import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from "@mui/material";
import {
  getDeliveryTimeSlots,
  updateDeliveryTimeSlots,
  getPlanDurations,
  addPlanDuration,
  updatePlanDuration,
  deletePlanDuration,
} from "../utils/api";
import toast from "react-hot-toast";
import "../styles/Configuration.css";

const DURATION_DAYS = {
  "1_week": 7,
  "2_week": 14,
  "3_week": 21,
  "1_month": 30,
  "2_month": 60,
  "3_month": 90,
};

const DeliveryConfig = ({ branchId }) => {
  // Time slots states
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState([]);
  const [newSlotFrom, setNewSlotFrom] = useState("");
  const [newSlotTo, setNewSlotTo] = useState("");

  // Plan duration states
  const [planDurations, setPlanDurations] = useState([]);
  const [newDurationType, setNewDurationType] = useState("");
  const [newMinDays, setNewMinDays] = useState("");
  const [newSkipDays, setNewSkipDays] = useState("");

  const [loading, setLoading] = useState(true);

  const resetStates = useCallback(() => {
    setDeliveryTimeSlots([]);
    setPlanDurations([]);
    setNewSlotFrom("");
    setNewSlotTo("");
    setNewDurationType("");
    setNewMinDays("");
    setNewSkipDays("");
    setLoading(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [timeSlotsResponse, durationsResponse] = await Promise.all([
        getDeliveryTimeSlots(branchId),
        getPlanDurations(branchId),
      ]);

      if (timeSlotsResponse.success) {
        setDeliveryTimeSlots(timeSlotsResponse.data || []);
      }

      if (durationsResponse.success) {
        setPlanDurations(durationsResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading delivery configuration:", error);
      toast.error("Failed to load delivery configuration");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (branchId) {
      resetStates();
      fetchData();
    }
  }, [branchId, fetchData, resetStates]);

  // Time slot handlers
  const validateTimeRange = (fromTime, toTime) => {
    const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
    const [toHours, toMinutes] = toTime.split(":").map(Number);
    return toHours * 60 + toMinutes > fromHours * 60 + fromMinutes;
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleAddTimeSlot = async () => {
    if (!newSlotFrom || !newSlotTo) {
      toast.error("Please fill in both time fields");
      return;
    }
    if (!validateTimeRange(newSlotFrom, newSlotTo)) {
      toast.error("End time must be after start time");
      return;
    }

    const newSlot = {
      fromTime: formatTime(newSlotFrom),
      toTime: formatTime(newSlotTo),
      isActive: true,
    };

    try {
      const updatedSlots = [...deliveryTimeSlots, newSlot];
      const response = await updateDeliveryTimeSlots(branchId, {
        timeSlots: updatedSlots,
      });

      if (response.success) {
        setDeliveryTimeSlots(updatedSlots);
        setNewSlotFrom("");
        setNewSlotTo("");
        toast.success("Time slot added successfully");
      }
    } catch (error) {
      toast.error("Failed to add time slot");
    }
  };

  const handleDeleteTimeSlot = async (index) => {
    try {
      const updatedSlots = deliveryTimeSlots.filter((_, i) => i !== index);
      const response = await updateDeliveryTimeSlots(branchId, {
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

  // Plan duration handlers
  const handleAddPlanDuration = async () => {
    if (!newDurationType || !newMinDays || !newSkipDays) {
      toast.error("Please fill in all fields");
      return;
    }

    const maxDays = DURATION_DAYS[newDurationType];
    if (!maxDays) {
      toast.error("Invalid duration type");
      return;
    }

    // Convert to numbers and validate
    const minDaysNum = parseInt(newMinDays);
    const skipDaysNum = parseInt(newSkipDays);

    if (minDaysNum > maxDays) {
      toast.error(
        `Minimum days cannot exceed ${maxDays} for this duration type`
      );
      return;
    }

    if (skipDaysNum > maxDays) {
      toast.error(`Skip days cannot exceed ${maxDays} for this duration type`);
      return;
    }

    try {
      const durationData = {
        durationType: newDurationType,
        minDays: minDaysNum,
        skipDays: skipDaysNum,
        isActive: true,
      };
      console.log("Sending plan duration data:", durationData);
      const response = await addPlanDuration(branchId, durationData);

      if (response.success) {
        setPlanDurations((prev) => [...prev, response.data]);
        setNewDurationType("");
        setNewMinDays("");
        setNewSkipDays("");
        toast.success("Plan duration added successfully");
      } else {
        toast.error(response.error || "Failed to add plan duration");
      }
    } catch (error) {
      console.error("Error adding plan duration:", error);
      toast.error("Failed to add plan duration");
    }
  };

  const handleUpdatePlanDuration = async (planId, updates) => {
    try {
      const response = await updatePlanDuration(branchId, planId, updates);
      if (response.success) {
        setPlanDurations(
          planDurations.map((plan) =>
            plan._id === planId ? { ...plan, ...updates } : plan
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
      const response = await deletePlanDuration(branchId, planId);
      if (response.success) {
        setPlanDurations(planDurations.filter((plan) => plan._id !== planId));
        toast.success("Plan duration deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete plan duration");
    }
  };

  if (loading) {
    return (
      <div className="config_loading">Loading delivery configuration...</div>
    );
  }

  if (!branchId) {
    return (
      <div className="config_no-selection">Please select a branch first.</div>
    );
  }

  return (
    <div className="config_content">
      {/* Delivery Time Slots */}
      <div className="config_card config_time-slots">
        <div className="config_section-header">
          <h4>Delivery Time Slots</h4>
          <div className="config_time-slot-inputs">
            <div className="config_time-input-group">
              <TextField
                label="From Time"
                type="time"
                value={newSlotFrom}
                onChange={(e) => setNewSlotFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className="config_time-input"
              />
              <TextField
                label="To Time"
                type="time"
                value={newSlotTo}
                onChange={(e) => setNewSlotTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className="config_time-input"
              />
              <button className="config_add-btn" onClick={handleAddTimeSlot}>
                Add Time Slot
              </button>
            </div>
          </div>
        </div>

        <div className="config_time-slot-list">
          {deliveryTimeSlots.map((slot, index) => (
            <div key={index} className="config_time-slot-item">
              <span className="config_time-slot-text">
                {slot.fromTime} - {slot.toTime}
              </span>
              <button
                className="config_delete-btn"
                onClick={() => handleDeleteTimeSlot(index)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="config_divider" />

      {/* Plan Durations */}
      <div className="config_card config_plan-durations">
        <div className="config_section-header">
          <h4>Plan Durations</h4>
          <div className="config_duration-inputs">
            <FormControl variant="outlined" className="config_duration-select">
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
              className="config_min-days-input"
            />
            <TextField
              label="Skip Days"
              type="number"
              value={newSkipDays}
              onChange={(e) => setNewSkipDays(e.target.value)}
              inputProps={{ min: 0 }}
              className="config_skip-days-input"
            />
            <button className="config_add-btn" onClick={handleAddPlanDuration}>
              Add Duration
            </button>
          </div>
        </div>

        <div className="config_duration-list">
          {planDurations.map((plan) => (
            <div key={plan._id} className="config_duration-item">
              <span className="config_duration-text">
                {plan.durationType?.replace("_", " ")} - Min: {plan.minDays}{" "}
                days
                {plan.skipDays > 0 ? ` - Skip: ${plan.skipDays} days` : ""}
              </span>
              <div className="config_duration-controls">
                <label className="config_checkbox-label">
                  <input
                    type="checkbox"
                    checked={plan.isActive}
                    onChange={(e) =>
                      handleUpdatePlanDuration(plan._id, {
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
                <button
                  className="config_delete-btn"
                  onClick={() => handleDeletePlanDuration(plan._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="config_divider" />
    </div>
  );
};

export default DeliveryConfig;
