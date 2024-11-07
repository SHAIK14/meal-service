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
  getNationalHolidays,
  addNationalHoliday,
  deleteNationalHoliday,
  getEmergencyClosures,
  addEmergencyClosure,
  deleteEmergencyClosure,
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

const Configuration = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(true);

  // Initialize all skip-related states to 0
  const [selectedDays, setSelectedDays] = useState(0);
  const [userPlanStart, setUserPlanStart] = useState(0);

  // Skip allowances
  const [skipAllowances, setSkipAllowances] = useState({
    week: 0,
    twoWeek: 0,
    month: 0,
  });

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");

  // Weekly holidays state
  const [selectedWeeklyHolidays, setSelectedWeeklyHolidays] = useState([]);
  const [weeklyHolidayInput, setWeeklyHolidayInput] = useState("");

  // Holiday states
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");

  // Emergency closure states
  const [emergencyClosures, setEmergencyClosures] = useState([]);
  const [emergencyDate, setEmergencyDate] = useState("");
  const [emergencyDescription, setEmergencyDescription] = useState("");

  // Location states
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const daysOptions = Array.from({ length: 8 }, (_, i) => i); // Changed to include 0

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

  // Format date to display without time
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchConfiguration();
    fetchEmergencyClosures();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const response = await getConfiguration();
      if (response.success) {
        const config = response.data;
        // Set default values to 0 if not present
        setSelectedDays(config?.skipMealDays ?? 0);
        setUserPlanStart(config?.planStartDelay ?? 0);

        // Handle weekly holidays array
        setSelectedWeeklyHolidays(config?.weeklyHolidays || []);

        // Format dates for national holidays
        const formattedHolidays = (config?.nationalHolidays || []).map(
          (holiday) => ({
            ...holiday,
            date: formatDate(holiday.date),
          })
        );
        setNationalHolidays(formattedHolidays);

        // Set skip allowances with defaults
        setSkipAllowances({
          week: config?.skipAllowances?.week ?? 0,
          twoWeek: config?.skipAllowances?.twoWeek ?? 0,
          month: config?.skipAllowances?.month ?? 0,
        });

        // Set location settings
        setSelectedCountry(config?.country || "");
        setSelectedCurrency(config?.currency || "");
        setLatitude(config?.coordinates?.latitude || "");
        setLongitude(config?.coordinates?.longitude || "");
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
      // Don't show error toast if it's the first time loading
      if (error.response?.status !== 404) {
        toast.error("Failed to load configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyClosures = async () => {
    try {
      const response = await getEmergencyClosures();
      if (response.success) {
        const formattedClosures = response.data.map((closure) => ({
          ...closure,
          date: formatDate(closure.date),
        }));
        setEmergencyClosures(formattedClosures);
      }
    } catch (error) {
      console.error("Error fetching emergency closures:", error);
    }
  };

  const handleUpdateConfiguration = async () => {
    try {
      // Update basic config with new skipAllowances structure
      const basicConfigResponse = await updateBasicConfig({
        skipMealDays: selectedDays,
        planStartDelay: userPlanStart,
        skipAllowances: {
          week: skipAllowances.week,
          twoWeek: skipAllowances.twoWeek,
          month: skipAllowances.month,
        },
      });

      // Update weekly holidays (already in array format)
      const weeklyHolidaysResponse = await updateWeeklyHolidays(
        selectedWeeklyHolidays
      );

      // Update location settings
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

  // Updated handlers for skip allowances
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

      default:
        return <div>Content for other tabs...</div>;
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
