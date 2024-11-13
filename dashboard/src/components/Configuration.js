import React, { useState, useEffect } from "react";
import "../styles/Configuration.css";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import {
  getConfiguration,
  updateBasicConfig,
  updateLocationSettings,
  updateWeeklyHolidays,
  addNationalHoliday,
  deleteNationalHoliday,
  getEmergencyClosures,
  addEmergencyClosure,
  deleteEmergencyClosure,
  getDeliveryTimeSlots,
  updateDeliveryTimeSlots,
  getPlanDurations,
  addPlanDuration,
  updatePlanDuration,
  deletePlanDuration,
} from "../utils/api";
import toast from "react-hot-toast";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Duration days mapping for validation
const DURATION_DAYS = {
  "1_week": 7,
  "2_week": 14,
  "3_week": 21,
  "1_month": 30,
  "2_month": 60,
  "3_month": 90,
};

const Configuration = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(true);

  // Existing states
  const [selectedDays, setSelectedDays] = useState(0);
  const [userPlanStart, setUserPlanStart] = useState(0);
  const [skipAllowances, setSkipAllowances] = useState({
    week: 0,
    twoWeek: 0,
    month: 0,
  });
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedWeeklyHolidays, setSelectedWeeklyHolidays] = useState([]);
  const [weeklyHolidayInput, setWeeklyHolidayInput] = useState("");
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [emergencyClosures, setEmergencyClosures] = useState([]);
  const [emergencyDate, setEmergencyDate] = useState("");
  const [emergencyDescription, setEmergencyDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // New states for delivery time slots
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState([]);
  const [newSlotFrom, setNewSlotFrom] = useState("");
  const [newSlotTo, setNewSlotTo] = useState("");

  // New states for plan durations
  const [planDurations, setPlanDurations] = useState([]);
  const [newDurationType, setNewDurationType] = useState("");
  const [newMinDays, setNewMinDays] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const daysOptions = Array.from({ length: 8 }, (_, i) => i);
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const gccCountries = [
    { name: "Bahrain", currency: "Bahraini Dinar (BHD)" },
    { name: "Kuwait", currency: "Kuwaiti Dinar (KWD)" },
    { name: "Oman", currency: "Omani Rial (OMR)" },
    { name: "Qatar", currency: "Qatari Rial (QAR)" },
    { name: "Saudi Arabia", currency: "Saudi Riyal (SAR)" },
    { name: "United Arab Emirates", currency: "UAE Dirham (AED)" },
  ];

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const validateTimeRange = (fromTime, toTime) => {
    const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
    const [toHours, toMinutes] = toTime.split(":").map(Number);

    const fromTotal = fromHours * 60 + fromMinutes;
    const toTotal = toHours * 60 + toMinutes;

    return toTotal > fromTotal;
  };
  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          configResponse,
          emergencyResponse,
          timeSlotsResponse,
          durationsResponse,
        ] = await Promise.all([
          getConfiguration(),
          getEmergencyClosures(),
          getDeliveryTimeSlots(),
          getPlanDurations(),
        ]);

        if (configResponse.success) {
          const config = configResponse.data;
          setSelectedDays(config?.skipMealDays ?? 0);
          setUserPlanStart(config?.planStartDelay ?? 0);
          setSelectedWeeklyHolidays(config?.weeklyHolidays || []);
          setNationalHolidays(
            (config?.nationalHolidays || []).map((holiday) => ({
              ...holiday,
              date: formatDate(holiday.date),
            }))
          );
          setSkipAllowances({
            week: config?.skipAllowances?.week ?? 0,
            twoWeek: config?.skipAllowances?.twoWeek ?? 0,
            month: config?.skipAllowances?.month ?? 0,
          });
          setSelectedCountry(config?.country || "");
          setSelectedCurrency(config?.currency || "");
          setLatitude(config?.coordinates?.latitude || "");
          setLongitude(config?.coordinates?.longitude || "");
        }

        if (emergencyResponse.success) {
          setEmergencyClosures(
            emergencyResponse.data.map((closure) => ({
              ...closure,
              date: formatDate(closure.date),
            }))
          );
        }

        if (timeSlotsResponse.success) {
          setDeliveryTimeSlots(timeSlotsResponse.data);
        }

        if (durationsResponse.success) {
          setPlanDurations(durationsResponse.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (error.response?.status !== 404) {
          toast.error("Failed to load configuration");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // All existing handlers
  const handleUpdateConfiguration = async () => {
    try {
      const basicConfigResponse = await updateBasicConfig({
        skipMealDays: selectedDays,
        planStartDelay: userPlanStart,
        skipAllowances: {
          week: skipAllowances.week,
          twoWeek: skipAllowances.twoWeek,
          month: skipAllowances.month,
        },
      });

      const weeklyHolidaysResponse = await updateWeeklyHolidays(
        selectedWeeklyHolidays
      );

      const locationResponse = await updateLocationSettings({
        country: selectedCountry,
        currency: selectedCurrency,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      });

      if (
        basicConfigResponse.success &&
        weeklyHolidaysResponse.success &&
        locationResponse.success
      ) {
        toast.success("Configuration updated successfully");
      } else {
        toast.error("Some updates failed");
      }
    } catch (error) {
      toast.error("Error updating configuration");
      console.error("Error:", error);
    }
  };

  const handleWeekSkipChange = (e) => {
    setSkipAllowances((prev) => ({
      ...prev,
      week: e.target.value,
    }));
  };

  const handleTwoWeekSkipChange = (e) => {
    setSkipAllowances((prev) => ({
      ...prev,
      twoWeek: e.target.value,
    }));
  };

  const handleMonthSkipChange = (e) => {
    setSkipAllowances((prev) => ({
      ...prev,
      month: e.target.value,
    }));
  };

  const handleDaysChange = (event) => setSelectedDays(event.target.value);
  const handleUserPlanStartChange = (event) =>
    setUserPlanStart(event.target.value);

  const handleWeeklyHolidayChange = (event) => {
    const day = event.target.value;
    if (!selectedWeeklyHolidays.includes(day)) {
      if (selectedWeeklyHolidays.length < 7) {
        setSelectedWeeklyHolidays([...selectedWeeklyHolidays, day]);
      } else {
        toast.error("Maximum 7 holidays can be selected");
      }
    }
    setWeeklyHolidayInput("");
  };

  const handleRemoveWeeklyHoliday = (dayToRemove) => {
    setSelectedWeeklyHolidays(
      selectedWeeklyHolidays.filter((day) => day !== dayToRemove)
    );
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const currency =
      gccCountries.find((item) => item.name === country)?.currency || "";
    setSelectedCurrency(currency);
  };

  const handleAddHoliday = async () => {
    if (holidayDate && holidayName) {
      try {
        const response = await addNationalHoliday({
          date: holidayDate,
          name: holidayName,
        });
        if (response.success) {
          const formattedDate = formatDate(holidayDate);
          const newHoliday = {
            _id: response.data._id,
            date: formattedDate,
            name: holidayName,
          };
          setNationalHolidays([...nationalHolidays, newHoliday]);
          setHolidayDate("");
          setHolidayName("");
          toast.success("Holiday added successfully");
        }
      } catch (error) {
        toast.error("Failed to add holiday");
        console.error("Error:", error);
      }
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      const response = await deleteNationalHoliday(holidayId);
      if (response.success) {
        setNationalHolidays(
          nationalHolidays.filter((holiday) => holiday._id !== holidayId)
        );
        toast.success("Holiday deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete holiday");
      console.error("Error:", error);
    }
  };

  const handleEmergencyDayOff = async () => {
    if (emergencyDate && emergencyDescription) {
      try {
        const response = await addEmergencyClosure({
          date: emergencyDate,
          description: emergencyDescription,
        });
        if (response.success) {
          const formattedDate = formatDate(emergencyDate);
          const newClosure = {
            _id: response.data._id,
            date: formattedDate,
            description: emergencyDescription,
          };
          setEmergencyClosures([...emergencyClosures, newClosure]);
          setEmergencyDate("");
          setEmergencyDescription("");
          toast.success("Emergency closure added successfully");
        }
      } catch (error) {
        toast.error("Failed to add emergency closure");
        console.error("Error:", error);
      }
    }
  };

  const handleDeleteEmergencyClosure = async (closureId) => {
    try {
      const response = await deleteEmergencyClosure(closureId);
      if (response.success) {
        setEmergencyClosures(
          emergencyClosures.filter((closure) => closure._id !== closureId)
        );
        toast.success("Emergency closure deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete emergency closure");
      console.error("Error:", error);
    }
  };

  // New handlers for delivery time slots
  // Update the handleAddTimeSlot function
  const handleAddTimeSlot = async () => {
    if (!newSlotFrom || !newSlotTo) {
      toast.error("Please fill in both time fields");
      return;
    }
    if (!validateTimeRange(newSlotFrom, newSlotTo)) {
      toast.error("End time must be after start time");
      return;
    }

    // Convert 24h format to 12h format with AM/PM
    const formatTime = (time24) => {
      const [hours, minutes] = time24.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    const newSlot = {
      fromTime: formatTime(newSlotFrom),
      toTime: formatTime(newSlotTo),
      isActive: true,
    };

    try {
      const updatedSlots = [...deliveryTimeSlots, newSlot];
      const response = await updateDeliveryTimeSlots({
        timeSlots: updatedSlots,
      });

      if (response.success) {
        setDeliveryTimeSlots(updatedSlots);
        setNewSlotFrom("");
        setNewSlotTo("");
        toast.success("Time slot added successfully");
      }
    } catch (error) {
      console.error("Error in handleAddTimeSlot:", error);
      toast.error(error.response?.data?.message || "Failed to add time slot");
    }
  };

  const handleDeleteTimeSlot = async (index) => {
    try {
      const updatedSlots = deliveryTimeSlots.filter((_, i) => i !== index);
      const response = await updateDeliveryTimeSlots({
        timeSlots: updatedSlots,
      });

      if (response.success) {
        setDeliveryTimeSlots(updatedSlots);
        toast.success("Time slot deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete time slot");
    }
  };

  // New handlers for plan durations
  const handleAddPlanDuration = async () => {
    if (!newDurationType || !newMinDays) {
      toast.error("Please fill in all fields");
      return;
    }

    const maxDays = DURATION_DAYS[newDurationType];
    if (!maxDays) {
      toast.error("Invalid duration type");
      return;
    }

    if (parseInt(newMinDays) > maxDays) {
      toast.error(
        `Minimum days cannot exceed ${maxDays} for this duration type`
      );
      return;
    }

    try {
      const response = await addPlanDuration({
        durationType: newDurationType,
        minDays: parseInt(newMinDays),
      });

      if (response.success) {
        setPlanDurations([...planDurations, response.data]);
        setNewDurationType("");
        setNewMinDays("");
        toast.success("Plan duration added successfully");
      }
    } catch (error) {
      console.error("Error in handleAddPlanDuration:", error);
      toast.error(
        error.response?.data?.message || "Failed to add plan duration"
      );
    }
  };

  const handleUpdatePlanDuration = async (planId, isActive) => {
    try {
      const response = await updatePlanDuration(planId, { isActive });

      if (response.success) {
        setPlanDurations(
          planDurations.map((plan) =>
            plan._id === planId ? { ...plan, isActive } : plan
          )
        );
        toast.success("Plan duration updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update plan duration");
    }
  };

  const handleDeletePlanDuration = async (planId) => {
    try {
      const response = await deletePlanDuration(planId);

      if (response.success) {
        setPlanDurations(planDurations.filter((plan) => plan._id !== planId));
        toast.success("Plan duration deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete plan duration");
    }
  }; // This closes the last handler from part 1

  const renderContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <div className="tab-content">
            <div className="top-section-wrapper">
              <div className="top-section">
                <div className="skipping-meal-option">
                  <h4>Skip Meal</h4>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Days</InputLabel>
                    <Select
                      value={selectedDays}
                      onChange={handleDaysChange}
                      input={<OutlinedInput label="Select Days" />}
                      MenuProps={MenuProps}
                    >
                      {daysOptions.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day} day{day > 1 ? "s" : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="plan-start">
                  <h4>Plan Start After</h4>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Days</InputLabel>
                    <Select
                      value={userPlanStart}
                      onChange={handleUserPlanStartChange}
                      input={<OutlinedInput label="Select Days" />}
                      MenuProps={MenuProps}
                    >
                      {daysOptions.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day} day{day > 1 ? "s" : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              <div className="fixed-weekly-holidays-option">
                <h4>Fixed Weekly Holidays</h4>
                <div className="weekly-holidays">
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Day</InputLabel>
                    <Select
                      value={weeklyHolidayInput}
                      onChange={handleWeeklyHolidayChange}
                      input={<OutlinedInput label="Select Day" />}
                      MenuProps={MenuProps}
                    >
                      {weekDays
                        .filter((day) => !selectedWeeklyHolidays.includes(day))
                        .map((day) => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <div className="selected-days">
                    {selectedWeeklyHolidays.map((day) => (
                      <div key={day} className="selected-day">
                        {day}
                        <button
                          className="day-remove-btn"
                          onClick={() => handleRemoveWeeklyHoliday(day)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="national-holidays-option">
                <h4>National Holidays</h4>
                <div className="holiday-inputs">
                  <input
                    type="date"
                    value={holidayDate}
                    min={today}
                    onChange={(e) => setHolidayDate(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Holiday Name"
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                  />
                  <button className="save-btn" onClick={handleAddHoliday}>
                    Save
                  </button>
                </div>
                <div className="holiday-list-container">
                  <ul className="holiday-list">
                    {nationalHolidays.map((holiday) => (
                      <li key={holiday._id} className="holiday-item">
                        <span className="holiday-text">
                          {holiday.date} - {holiday.name}
                        </span>
                        <button
                          className="holiday-delete-btn"
                          onClick={() => handleDeleteHoliday(holiday._id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="second-line">
              <div className="emergency-day-off-option">
                <h4>Emergency Day Off</h4>
                <input
                  type="date"
                  value={emergencyDate}
                  min={today}
                  onChange={(e) => setEmergencyDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={emergencyDescription}
                  onChange={(e) => setEmergencyDescription(e.target.value)}
                />
                <button onClick={handleEmergencyDayOff}>Send</button>

                <div className="emergency-list-container">
                  <ul className="emergency-list">
                    {emergencyClosures.map((closure) => (
                      <li key={closure._id} className="emergency-item">
                        <span className="emergency-text">
                          {closure.date} - {closure.description}
                        </span>
                        <button
                          className="emergency-delete-btn"
                          onClick={() =>
                            handleDeleteEmergencyClosure(closure._id)
                          }
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="number-of-skips-option">
                <h4>Number of Skips</h4>
                <div className="plan-selection">
                  <h5>1 Week Plan</h5>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Days</InputLabel>
                    <Select
                      value={skipAllowances.week}
                      onChange={handleWeekSkipChange}
                      input={<OutlinedInput label="Select Days" />}
                      MenuProps={MenuProps}
                    >
                      {daysOptions.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day} day{day > 1 ? "s" : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="plan-selection">
                  <h5>2 Week Plan</h5>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Days</InputLabel>
                    <Select
                      value={skipAllowances.twoWeek}
                      onChange={handleTwoWeekSkipChange}
                      input={<OutlinedInput label="Select Days" />}
                      MenuProps={MenuProps}
                    >
                      {daysOptions.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day} day{day > 1 ? "s" : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="plan-selection">
                  <h5>1 Month Plan</h5>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Days</InputLabel>
                    <Select
                      value={skipAllowances.month}
                      onChange={handleMonthSkipChange}
                      input={<OutlinedInput label="Select Days" />}
                      MenuProps={MenuProps}
                    >
                      {daysOptions.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day} day{day > 1 ? "s" : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="tab-content">
            <div className="Locations-Wrapper">
              <div className="country-currency-container">
                <h4>Select Country and Currency</h4>
                <div className="country-currency-selector">
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      input={<OutlinedInput label="Country" />}
                      MenuProps={MenuProps}
                    >
                      {gccCountries.map((country) => (
                        <MenuItem key={country.name} value={country.name}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      input={<OutlinedInput label="Currency" />}
                      MenuProps={MenuProps}
                      disabled={!selectedCountry}
                    >
                      {gccCountries.map((country) => (
                        <MenuItem
                          key={country.currency}
                          value={country.currency}
                        >
                          {country.currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div className="location-cordinates">
                <h4>Location Coordinates</h4>
                <div className="coordinates-inputs">
                  <div className="input-label-wrapper">
                    <TextField
                      id="latitude"
                      label="Latitude"
                      type="number"
                      placeholder="24°41'04.4 N"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      inputProps={{
                        step: 0.000001,
                      }}
                      fullWidth
                      sx={{ width: "100%" }}
                    />
                  </div>
                  <div className="input-label-wrapper">
                    <TextField
                      id="longitude"
                      label="Longitude"
                      type="number"
                      placeholder="46°46'39.4"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      inputProps={{
                        step: 0.000001,
                      }}
                      fullWidth
                      sx={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="tab-content">
            <div className="delivery-times-wrapper">
              <h4>Delivery Time Slots</h4>
              <div className="time-slot-inputs">
                <TextField
                  label="From Time"
                  type="time"
                  value={newSlotFrom}
                  onChange={(e) => setNewSlotFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
                <TextField
                  label="To Time"
                  type="time"
                  value={newSlotTo}
                  onChange={(e) => setNewSlotTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
                <button onClick={handleAddTimeSlot}>Add Time Slot</button>
              </div>

              <div className="time-slots-list">
                {deliveryTimeSlots.map((slot, index) => (
                  <div key={index} className="time-slot-item">
                    <span>
                      {slot.fromTime || ""} - {slot.toTime || ""}
                    </span>
                    <button onClick={() => handleDeleteTimeSlot(index)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="plan-durations-wrapper">
              <h4>Plan Durations</h4>
              <div className="plan-duration-inputs">
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Duration Type</InputLabel>
                  <Select
                    value={newDurationType}
                    onChange={(e) => setNewDurationType(e.target.value)}
                    input={<OutlinedInput label="Duration Type" />}
                  >
                    {Object.entries(DURATION_DAYS).map(([type, days]) => (
                      <MenuItem key={type} value={type}>
                        {type.replace("_", " ")} ({days} days)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Minimum Days"
                  type="number"
                  value={newMinDays}
                  onChange={(e) => setNewMinDays(e.target.value)}
                  inputProps={{ min: 1 }}
                />
                <button onClick={handleAddPlanDuration}>
                  Add Plan Duration
                </button>
              </div>
              <div className="plan-durations-list">
                {planDurations.map((plan) => (
                  <div key={plan._id} className="plan-duration-item">
                    <span>
                      {plan.durationType
                        ? plan.durationType.replace("_", " ")
                        : ""}{" "}
                      - Min: {plan.minDays} days
                    </span>
                    <div className="plan-duration-controls">
                      <label>
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={(e) =>
                            handleUpdatePlanDuration(plan._id, e.target.checked)
                          }
                        />
                        Active
                      </label>
                      <button
                        onClick={() => handleDeletePlanDuration(plan._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div className="configuration">
      <div className="tabs">
        <div className="tab-buttons">
          <button
            className={activeTab === 1 ? "active" : ""}
            onClick={() => setActiveTab(1)}
          >
            Active Days
          </button>
          <button
            className={activeTab === 2 ? "active" : ""}
            onClick={() => setActiveTab(2)}
          >
            Location
          </button>
          <button
            className={activeTab === 3 ? "active" : ""}
            onClick={() => setActiveTab(3)}
          >
            Delivery & Plans
          </button>
        </div>
        <button className="update-button" onClick={handleUpdateConfiguration}>
          Update
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default Configuration;
