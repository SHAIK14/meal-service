import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import DeliveryConfig from "./DeliveryConfig";
import toast from "react-hot-toast";
import {
  getConfiguration,
  updateBasicConfig,
  updateWeeklyHolidays,
  addNationalHoliday,
  deleteNationalHoliday,
  getEmergencyClosures,
  addEmergencyClosure,
  deleteEmergencyClosure,
} from "../utils/api";
import { getAllBranches } from "../utils/api2";
import "../styles/Configuration.css";

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

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const Configuration = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(true);
  // Add new branch-related states
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  // Basic Settings States
  const [selectedDays, setSelectedDays] = useState(0);
  const [userPlanStart, setUserPlanStart] = useState(0);

  // Location States

  // Holiday States
  const [selectedWeeklyHolidays, setSelectedWeeklyHolidays] = useState([]);
  const [weeklyHolidayInput, setWeeklyHolidayInput] = useState("");
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");

  // Emergency Closure States
  const [emergencyClosures, setEmergencyClosures] = useState([]);
  const [emergencyDate, setEmergencyDate] = useState("");
  const [emergencyDescription, setEmergencyDescription] = useState("");

  // Update Indicators State
  const [updateIndicators, setUpdateIndicators] = useState({
    skipMeal: false,
    planStart: false,
    weeklyHolidays: false,

    holidays: false,
    emergency: false,
  });

  const today = new Date().toISOString().split("T")[0];
  const daysOptions = Array.from({ length: 8 }, (_, i) => i);

  // Helper function to show update indicator
  const showUpdateIndicator = (section) => {
    setUpdateIndicators((prev) => ({
      ...prev,
      [section]: true,
    }));

    setTimeout(() => {
      setUpdateIndicators((prev) => ({
        ...prev,
        [section]: false,
      }));
    }, 3000);
  };
  // Add new useEffect for fetching branches

  // Fetch Initial Data
  useEffect(() => {
    const fetchAllData = async () => {
      if (!selectedBranch) return; // Don't fetch if no branch selected

      setLoading(true);
      try {
        const [configResponse, emergencyResponse] = await Promise.all([
          getConfiguration(selectedBranch._id),
          getEmergencyClosures(selectedBranch._id),
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
        }

        if (emergencyResponse.success) {
          setEmergencyClosures(
            emergencyResponse.data.map((closure) => ({
              ...closure,
              date: formatDate(closure.date),
            }))
          );
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
  }, [selectedBranch]);
  // Modify branch fetching useEffect
  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await getAllBranches();
        if (response.success) {
          setBranches(response.data);
          // Don't auto-select any branch
          setSelectedBranch(null);
          setLoading(false); // Don't load any config until branch is selected
        }
      } catch (error) {
        console.error("Error loading branches:", error);
        toast.error("Failed to load branches");
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // Add function to clear all states
  const clearConfigStates = () => {
    setSelectedDays(0);
    setUserPlanStart(0);
    setSelectedWeeklyHolidays([]);
    setNationalHolidays([]);

    setEmergencyClosures([]);
    setHolidayDate("");
    setHolidayName("");
    setEmergencyDate("");
    setEmergencyDescription("");
    // Reset loading state
    setLoading(true);
  };
  // Modify branch selection handler
  const handleBranchChange = (event) => {
    clearConfigStates(); // Clear all states before changing branch
    const branchId = event.target.value;
    if (!branchId) {
      setSelectedBranch(null);
      return;
    }
    const branch = branches.find((b) => b._id === branchId);
    setSelectedBranch(branch);
  };

  // Modify the early return conditions
  if (loadingBranches) {
    return <div className="config_loading">Loading branches...</div>;
  }

  if (!loadingBranches && branches.length === 0) {
    return (
      <div className="config_container">
        <div className="config_no-branches">
          <p>No branches available. Please add a branch first.</p>
        </div>
      </div>
    );
  }
  // Helper Functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Event Handlers
  const handleUpdateConfiguration = async () => {
    try {
      const [basicConfigResponse, weeklyHolidaysResponse] = await Promise.all([
        updateBasicConfig(selectedBranch._id, {
          skipMealDays: selectedDays,
          planStartDelay: userPlanStart,
        }),
        updateWeeklyHolidays(selectedBranch._id, selectedWeeklyHolidays),
      ]);

      if (basicConfigResponse.success && weeklyHolidaysResponse.success) {
        toast.success("Configuration updated successfully");
        showUpdateIndicator("skipMeal");
        showUpdateIndicator("planStart");
        showUpdateIndicator("weeklyHolidays");
      } else {
        toast.error("Some updates failed");
      }
    } catch (error) {
      toast.error("Error updating configuration");
      console.error("Error:", error);
    }
  };

  // Basic Settings Handlers
  const handleDaysChange = (event) => {
    setSelectedDays(event.target.value);
  };

  const handleUserPlanStartChange = (event) => {
    setUserPlanStart(event.target.value);
  };

  // Location Handlers

  // Weekly Holiday Handlers
  const handleWeeklyHolidayChange = async (event) => {
    const day = event.target.value;
    if (!selectedWeeklyHolidays.includes(day)) {
      if (selectedWeeklyHolidays.length < 7) {
        const newHolidays = [...selectedWeeklyHolidays, day];
        setSelectedWeeklyHolidays(newHolidays);
        try {
          await updateWeeklyHolidays(selectedBranch._id, newHolidays);
        } catch (error) {
          toast.error("Failed to update weekly holidays");
          console.error("Error:", error);
        }
      } else {
        toast.error("Maximum 7 holidays can be selected");
      }
    }
    setWeeklyHolidayInput("");
  };

  const handleRemoveWeeklyHoliday = async (dayToRemove) => {
    const newHolidays = selectedWeeklyHolidays.filter(
      (day) => day !== dayToRemove
    );
    setSelectedWeeklyHolidays(newHolidays);
    try {
      await updateWeeklyHolidays(selectedBranch._id, newHolidays);
    } catch (error) {
      toast.error("Failed to update weekly holidays");
      console.error("Error:", error);
    }
  };

  // National Holiday Handlers
  const handleAddHoliday = async () => {
    if (holidayDate && holidayName) {
      try {
        const response = await addNationalHoliday(selectedBranch._id, {
          date: holidayDate,
          name: holidayName,
        });
        if (response.success) {
          const formattedDate = formatDate(holidayDate);
          setNationalHolidays((prev) => [
            ...prev,
            {
              _id: response.data._id,
              date: formattedDate,
              name: holidayName,
            },
          ]);
          setHolidayDate("");
          setHolidayName("");
          toast.success("Holiday added successfully");
          showUpdateIndicator("holidays");
        }
      } catch (error) {
        toast.error("Failed to add holiday");
        console.error("Error:", error);
      }
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      const response = await deleteNationalHoliday(
        selectedBranch._id,
        holidayId
      );
      if (response.success) {
        setNationalHolidays((prev) =>
          prev.filter((holiday) => holiday._id !== holidayId)
        );
        toast.success("Holiday deleted successfully");
        showUpdateIndicator("holidays");
      }
    } catch (error) {
      toast.error("Failed to delete holiday");
      console.error("Error:", error);
    }
  };

  // Emergency Closure Handlers
  const handleEmergencyDayOff = async () => {
    if (emergencyDate && emergencyDescription) {
      try {
        const response = await addEmergencyClosure(selectedBranch._id, {
          date: emergencyDate,
          description: emergencyDescription,
        });
        if (response.success) {
          const formattedDate = formatDate(emergencyDate);
          setEmergencyClosures((prev) => [
            ...prev,
            {
              _id: response.data._id,
              date: formattedDate,
              description: emergencyDescription,
            },
          ]);
          setEmergencyDate("");
          setEmergencyDescription("");
          toast.success("Emergency closure added successfully");
          showUpdateIndicator("emergency");
        }
      } catch (error) {
        toast.error("Failed to add emergency closure");
        console.error("Error:", error);
      }
    }
  };

  const handleDeleteEmergencyClosure = async (closureId) => {
    try {
      const response = await deleteEmergencyClosure(
        selectedBranch._id,
        closureId
      );
      if (response.success) {
        setEmergencyClosures((prev) =>
          prev.filter((closure) => closure._id !== closureId)
        );
        toast.success("Emergency closure deleted successfully");
        showUpdateIndicator("emergency");
      }
    } catch (error) {
      toast.error("Failed to delete emergency closure");
      console.error("Error:", error);
    }
  };

  const renderBasicSettings = () => (
    <div className="config_content">
      <div className="config_basic-settings">
        {/* Top Section - Basic Settings */}
        <div className="config_basic-row">
          <div className="config_card config_skip-meals">
            {updateIndicators.skipMeal && (
              <div className="config_update-indicator">Updated</div>
            )}
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

          <div className="config_card config_plan-start">
            {updateIndicators.planStart && (
              <div className="config_update-indicator">Updated</div>
            )}
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

          <div className="config_card config_weekly-holidays">
            {updateIndicators.weeklyHolidays && (
              <div className="config_update-indicator">Updated</div>
            )}
            <h4>Fixed Weekly Holidays</h4>
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
            <div className="config_selected-days">
              {selectedWeeklyHolidays.map((day) => (
                <div key={day} className="config_selected-day">
                  {day}
                  <button
                    className="config_day-remove-btn"
                    onClick={() => handleRemoveWeeklyHoliday(day)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="config_divider" />

        {/* Location Section */}

        <div className="config_divider" />

        {/* Bottom Section - Holidays and Emergency */}
        <div className="config_holiday-row">
          <div className="config_card config_national-holidays">
            {updateIndicators.holidays && (
              <div className="config_update-indicator">Updated</div>
            )}
            <h4>National Holidays</h4>
            <div className="config_holiday-inputs">
              <div className="config_input-group">
                <input
                  type="date"
                  value={holidayDate}
                  min={today}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="config_date-input"
                />
              </div>
              <div className="config_input-group">
                <input
                  type="text"
                  placeholder="Holiday Name"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="config_text-input"
                />
              </div>
              <button className="config_save-btn" onClick={handleAddHoliday}>
                Save
              </button>
            </div>
            <div className="config_holiday-list">
              {nationalHolidays.map((holiday) => (
                <div key={holiday._id} className="config_holiday-item">
                  <span className="config_holiday-text">
                    {holiday.date} - {holiday.name}
                  </span>
                  <button
                    className="config_delete-btn"
                    onClick={() => handleDeleteHoliday(holiday._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="config_card config_emergency">
            {updateIndicators.emergency && (
              <div className="config_update-indicator">Updated</div>
            )}
            <h4>Emergency Day Off</h4>
            <div className="config_emergency-inputs">
              <div className="config_input-group">
                <input
                  type="date"
                  value={emergencyDate}
                  min={today}
                  onChange={(e) => setEmergencyDate(e.target.value)}
                  className="config_date-input"
                />
              </div>
              <div className="config_input-group">
                <input
                  type="text"
                  placeholder="Description"
                  value={emergencyDescription}
                  onChange={(e) => setEmergencyDescription(e.target.value)}
                  className="config_text-input"
                />
              </div>
              <button
                className="config_save-btn"
                onClick={handleEmergencyDayOff}
              >
                Save
              </button>
            </div>
            <div className="config_emergency-list">
              {emergencyClosures.map((closure) => (
                <div key={closure._id} className="config_emergency-item">
                  <span className="config_emergency-text">
                    {closure.date} - {closure.description}
                  </span>
                  <button
                    className="config_delete-btn"
                    onClick={() => handleDeleteEmergencyClosure(closure._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="config_loading">Loading configuration...</div>;
  }

  return (
    <div className="config_container">
      {/* Branch selector should be here, above everything */}
      <div className="config_branch-selector">
        <FormControl fullWidth variant="outlined">
          <InputLabel>Select Branch</InputLabel>
          <Select
            value={selectedBranch?._id || ""}
            onChange={handleBranchChange}
            label="Select Branch"
          >
            <MenuItem value="">
              <em>Select a branch</em>
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch._id} value={branch._id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      {!selectedBranch ? (
        <div className="config_no-selection">
          <p>Please select a branch to view its configuration.</p>
        </div>
      ) : (
        <>
          <div className="config_header">
            <div className="config_tabs">
              <button
                className={`config_tab-btn ${activeTab === 1 ? "active" : ""}`}
                onClick={() => setActiveTab(1)}
              >
                Basic Settings
              </button>
              <button
                className={`config_tab-btn ${activeTab === 2 ? "active" : ""}`}
                onClick={() => setActiveTab(2)}
              >
                Delivery & Plans
              </button>
            </div>
            <button
              className="config_update-btn"
              onClick={handleUpdateConfiguration}
            >
              Update
            </button>
          </div>

          {loading ? (
            <div className="config_loading">Loading configuration...</div>
          ) : activeTab === 1 ? (
            renderBasicSettings()
          ) : (
            <DeliveryConfig branchId={selectedBranch._id} />
          )}
        </>
      )}
    </div>
  );
};

export default Configuration;
