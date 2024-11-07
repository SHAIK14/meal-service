import React, { useState } from "react";
import "../styles/Configuration.css"; // Ensure you have the appropriate styles imported
import { Theme, useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
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
  const [weekPlan, setWeekPlan] = useState(""); // For 1 Week Plan
  const [twoWeekPlan, setTwoWeekPlan] = useState(""); // For 2 Week Plan
  const [monthPlan, setMonthPlan] = useState(""); // For 1 Month Plan
  const [selectedDays, setSelectedDays] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [weeklyHolidays, setWeeklyHolidays] = useState({
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  });
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [userPlanStart, setUserPlanStart] = useState(1);
  const [emergencyDate, setEmergencyDate] = useState("");
  const [emergencyDescription, setEmergencyDescription] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const daysOptions = Array.from({ length: 7 }, (_, i) => i + 1);

  const gccCountries = [
    { name: "Bahrain", currency: "Bahraini Dinar (BHD)" },
    { name: "Kuwait", currency: "Kuwaiti Dinar (KWD)" },
    { name: "Oman", currency: "Omani Rial (OMR)" },
    { name: "Qatar", currency: "Qatari Rial (QAR)" },
    { name: "Saudi Arabia", currency: "Saudi Riyal (SAR)" },
    { name: "United Arab Emirates", currency: "UAE Dirham (AED)" },
  ];
  // Event Handlers for changing dropdown values
  const handleWeekPlanChange = (e) => {
    setWeekPlan(e.target.value);
  };

  const handleTwoWeekPlanChange = (e) => {
    setTwoWeekPlan(e.target.value);
  };

  const handleMonthPlanChange = (e) => {
    setMonthPlan(e.target.value);
  };

  // Handle country selection
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const currency =
      gccCountries.find((item) => item.name === country)?.currency || "";
    setSelectedCurrency(currency); // Automatically set the currency based on the selected country
  };
  // State for location coordinates
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleDaysChange = (event) => setSelectedDays(event.target.value);
  const handleUserPlanStartChange = (event) =>
    setUserPlanStart(event.target.value);
  const handleToggleChange = (day) => {
    setWeeklyHolidays((prevState) => ({
      ...prevState,
      [day]: !prevState[day],
    }));
  };

  const handleAddHoliday = () => {
    if (holidayDate && holidayName) {
      setNationalHolidays([
        ...nationalHolidays,
        { date: holidayDate, name: holidayName },
      ]);
      setHolidayDate("");
      setHolidayName("");
    }
  };

  const handleDeleteHoliday = (index) => {
    setNationalHolidays((prevHolidays) =>
      prevHolidays.filter((_, i) => i !== index)
    );
  };

  const handleEmergencyDayOff = () => {
    if (emergencyDate && emergencyDescription) {
      alert(
        `Emergency Day Off Requested:\nDate: ${emergencyDate}\nDescription: ${emergencyDescription}`
      );
      setEmergencyDate("");
      setEmergencyDescription("");
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
                    <InputLabel>Day</InputLabel>
                    <Select
                      value={selectedDays}
                      onChange={handleDaysChange}
                      input={<OutlinedInput label="Day" />}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 4.5 + 8, // Max height for dropdown
                            width: 250,
                          },
                        },
                      }}
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
                    <InputLabel>Day</InputLabel>
                    <Select
                      value={userPlanStart}
                      onChange={handleUserPlanStartChange}
                      input={<OutlinedInput label="Day" />}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 4.5 + 8, // Max height for dropdown
                            width: 250,
                          },
                        },
                      }}
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
                  {Object.keys(weeklyHolidays).map((day) => (
                    <div key={day} className="holiday-toggle">
                      <span className="day-label">{day}</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={weeklyHolidays[day]}
                          onChange={() => handleToggleChange(day)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  ))}
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
                    {nationalHolidays.map((holiday, index) => (
                      <li key={index} className="holiday-item">
                        <span className="holiday-text">
                          {holiday.date} - {holiday.name}
                        </span>
                        <button
                          className="holiday-delete-btn"
                          onClick={() => handleDeleteHoliday(index)}
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
              </div>
              {/* Number of Skips Section */}
              <div className="number-of-skips-option">
                <h4>Number of Skips</h4>

                <div className="plan-selection">
                  <h5>1 Week Plan</h5>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Day</InputLabel>
                    <Select
                      value={weekPlan}
                      onChange={handleWeekPlanChange}
                      input={<OutlinedInput label="Day" />}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 4.5 + 8, // Max height for dropdown
                            width: 250,
                          },
                        },
                      }}
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
                    <InputLabel>Day</InputLabel>
                    <Select
                      value={twoWeekPlan}
                      onChange={handleTwoWeekPlanChange}
                      input={<OutlinedInput label="Day" />}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 4.5 + 8, // Max height for dropdown
                            width: 250,
                          },
                        },
                      }}
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
                    <InputLabel>Day</InputLabel>
                    <Select
                      value={monthPlan}
                      onChange={handleMonthPlanChange}
                      input={<OutlinedInput label="Day" />}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 4.5 + 8, // Max height for dropdown
                            width: 250,
                          },
                        },
                      }}
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
                        step: 0.000001, // Precision for decimal values
                      }}
                      fullWidth // Use fullWidth for the Material-UI TextField
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
                        step: 0.000001, // Precision for decimal values
                      }}
                      fullWidth // Use fullWidth for the Material-UI TextField
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
        <button
          className="update-button"
          onClick={() => console.log("Update button clicked")}
        >
          Update
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default Configuration;
