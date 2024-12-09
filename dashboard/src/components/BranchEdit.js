import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBranchById, updateBranch } from "../utils/api2";
import "../styles/AddBranch.css"; // Reusing the same CSS

const EditBranch = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    crNumber: "",
    municipalityNumber: "",
    vatNumber: "",
    serviceRadius: "",
    password: "",
    confirmPassword: "",
    address: {
      country: "",
      currency: "",
      mainAddress: "",
      apartment: "",
      city: "",
      state: "",
      pincode: "",
      coordinates: {
        latitude: "",
        longitude: "",
      },
    },
    dynamicAttributes: [],
  });
  const [newAttribute, setNewAttribute] = useState({
    name: "",
    value: "",
  });

  // Fetch branch details
  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response = await getBranchById(branchId);
        if (response.success) {
          // Add coordinates if they don't exist
          const branchData = {
            ...response.data,
            address: {
              ...response.data.address,
              coordinates: response.data.address.coordinates || {
                latitude: "",
                longitude: "",
              },
            },
          };
          setFormData(branchData);
        } else {
          setError("Failed to fetch branch details");
        }
      } catch (error) {
        setError("Error fetching branch details");
      } finally {
        setLoading(false);
      }
    };

    fetchBranchDetails();
  }, [branchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    if (name.includes("address.coordinates.")) {
      const coordinateField = name.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          coordinates: {
            ...prev.address.coordinates,
            [coordinateField]: value,
          },
        },
      }));
    } else if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setFormData((prev) => ({
        ...prev,
        dynamicAttributes: [...prev.dynamicAttributes, { ...newAttribute }],
      }));
      setNewAttribute({ name: "", value: "" });
    }
  };

  const validateForm = () => {
    if (formData.address.coordinates) {
      const { latitude, longitude } = formData.address.coordinates;

      if (latitude || longitude) {
        // If either coordinate is provided, both become required
        if (!latitude || !longitude) {
          setError("Both latitude and longitude are required");
          return false;
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) {
          setError("Latitude must be between -90 and 90 degrees");
          return false;
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
          setError("Longitude must be between -180 and 180 degrees");
          return false;
        }
      }
    }
    const serviceRadiusNum = parseFloat(formData.serviceRadius);
    if (isNaN(serviceRadiusNum) || serviceRadiusNum <= 0) {
      setError("Please enter a valid service radius greater than 0");
      return false;
    }

    if (!formData.name.trim()) {
      setError("Branch name is required");
      return false;
    }

    // Validate currency
    if (!formData.address.currency) {
      setError("Currency is required");
      return false;
    }

    const requiredFields = ["crNumber", "municipalityNumber", "vatNumber"];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
        return false;
      }
    }

    const requiredAddressFields = [
      "country",
      "mainAddress",
      "city",
      "state",
      "pincode",
    ];
    for (const field of requiredAddressFields) {
      if (!formData.address[field].trim()) {
        setError(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const finalData = {
        ...formData,
        serviceRadius: parseFloat(formData.serviceRadius),
      };

      const response = await updateBranch(branchId, finalData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/branches");
        }, 2000);
      } else {
        setError(response.error || "Failed to update branch");
      }
    } catch (error) {
      console.error("Error updating branch:", error);
      setError("An unexpected error occurred while updating the branch");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="branch-container">Loading...</div>;
  }

  return (
    <div className="branch-container">
      <div className="branch-header">
        <h2>Edit Branch</h2>
      </div>

      {error && (
        <div className="alert error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert success">
          <span>Branch updated successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="branch-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Branch Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>CR Number</label>
              <input
                type="text"
                name="crNumber"
                value={formData.crNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Municipality Number</label>
              <input
                type="text"
                name="municipalityNumber"
                value={formData.municipalityNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>VAT Number</label>
              <input
                type="text"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="form-section">
          <h3 className="section-title">Address Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Country/Region</label>
              <select
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="half-width"
                required
              >
                <option value="">Select Country</option>
                <option value="india">India</option>
                <option value="saudi">Saudi Arabia</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select
                name="address.currency"
                value={formData.address.currency}
                onChange={handleChange}
                className="half-width"
                required
              >
                <option value="">Select Currency</option>
                <option value="INR">Indian Rupee (INR)</option>
                <option value="SAR">Saudi Riyal (SAR)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address.mainAddress"
                value={formData.address.mainAddress}
                onChange={handleChange}
                placeholder="Street address or P.O. box"
                required
              />
            </div>
            <div className="form-group">
              <label>Apartment/Suite/Floor (Optional)</label>
              <input
                type="text"
                name="address.apartment"
                value={formData.address.apartment}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, floor, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>State/Province</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>PIN Code/Postal Code</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className="half-width"
                maxLength={formData.address.country === "india" ? 6 : 5}
                pattern={
                  formData.address.country === "india" ? "[0-9]{6}" : "[0-9]{5}"
                }
                title={`Please enter a valid ${
                  formData.address.country === "india" ? "6" : "5"
                }-digit postal code`}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                name="address.coordinates.latitude"
                value={formData.address.coordinates.latitude}
                onChange={handleChange}
                step="any"
                min="-90"
                max="90"
                required
                placeholder="Enter latitude (-90 to 90)"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                name="address.coordinates.longitude"
                value={formData.address.coordinates.longitude}
                onChange={handleChange}
                step="any"
                min="-180"
                max="180"
                required
                placeholder="Enter longitude (-180 to 180)"
              />
            </div>
          </div>
        </div>

        {/* Service Area */}
        <div className="form-section">
          <h3 className="section-title">Service Area</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Service Radius (km)</label>
              <input
                type="number"
                name="serviceRadius"
                value={formData.serviceRadius}
                onChange={handleChange}
                className="half-width"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>
        </div>

        {/* Dynamic Attributes */}
        <div className="dynamic-attributes">
          <h3>Additional Attributes</h3>
          <div className="attribute-inputs">
            <input
              type="text"
              placeholder="Attribute Name"
              value={newAttribute.name}
              onChange={(e) =>
                setNewAttribute({ ...newAttribute, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Attribute Value"
              value={newAttribute.value}
              onChange={(e) =>
                setNewAttribute({ ...newAttribute, value: e.target.value })
              }
            />
            <button
              type="button"
              onClick={handleAddAttribute}
              disabled={loading}
            >
              Add
            </button>
          </div>

          {formData.dynamicAttributes.map((attr, index) => (
            <div key={index} className="attribute-item">
              <span>
                {attr.name}: {attr.value}
              </span>
              <button
                type="button"
                onClick={() => {
                  const newAttributes = formData.dynamicAttributes.filter(
                    (_, i) => i !== index
                  );
                  setFormData((prev) => ({
                    ...prev,
                    dynamicAttributes: newAttributes,
                  }));
                }}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Branch"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/branches")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBranch;
