import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { AlertTriangle } from "lucide-react";
import { createPlan } from "../utils/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import "../styles/PlanCreate.css";

const PlanCreate = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [newPlan, setNewPlan] = useState({
    nameEnglish: "",
    nameArabic: "",
    descriptionEnglish: "",
    descriptionArabic: "",
    image: null,
    isVeg: false,
    isNonVeg: false,
    isIndividual: false,
    isMultiple: false,
    package: [],
    service: "",
  });
  const [showPackageWarning, setShowPackageWarning] = useState(false);
  const [showServiceWarning, setShowServiceWarning] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "package") {
      const updatedPackages = checked
        ? [...newPlan.package, value]
        : newPlan.package.filter((item) => item !== value);

      setNewPlan((prevState) => ({
        ...prevState,
        package: updatedPackages,
      }));
      setShowPackageWarning(true);
    } else if (name === "service") {
      setShowServiceWarning(true);
      setNewPlan((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      setNewPlan((prevState) => ({
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    setNewPlan((prevState) => ({
      ...prevState,
      image: file,
    }));
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (newPlan.package.length === 0) {
      alert("Please select at least one package option.");
      return;
    }
    if (!newPlan.service) {
      alert("Please select a service type.");
      return;
    }

    try {
      let imageUrl = "";
      if (newPlan.image) {
        const imageRef = ref(storage, `plans/${newPlan.image.name}`);
        await uploadBytes(imageRef, newPlan.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const planData = {
        ...newPlan,
        image: imageUrl,
      };

      const result = await createPlan(planData);
      if (result.success) {
        console.log("Plan created successfully:", result.data);
        navigate("/plans");
      } else {
        console.error("Failed to create plan:", result.error);
      }
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  return (
    <div className="admin-plan-create-wrapper">
      <h1>Create New Plan</h1>
      <form onSubmit={handleSavePlan} className="admin-plan-create-form">
        <div className="admin-image-container">
          <label htmlFor="file-upload" className="admin-custom-file-upload">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                style={{ width: "100%", height: "auto" }}
              />
            ) : (
              "Upload Photo 200x200"
            )}
          </label>
          <input
            id="file-upload"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            required
            style={{ display: "none" }}
          />
          {selectedImage && (
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setNewPlan((prev) => ({ ...prev, image: null }));
              }}
              className="admin-icon-button"
            >
              <FaTrash />
            </button>
          )}
        </div>
        <div className="admin-form-container">
          <div className="admin-form-group-category">
            <label className="admin-select-label">Service Type:</label>
            <select
              name="service"
              value={newPlan.service}
              onChange={handleInputChange}
              required
              className="admin-select"
            >
              <option value="">Select a service</option>
              <option value="subscription">Subscription Service</option>
              <option value="indoorCatering">Indoor Catering Service</option>
              <option value="outdoorCatering">Outdoor Catering Service</option>
              <option value="dining">Dining Service</option>
            </select>
          </div>
          {showServiceWarning && (
            <div className="admin-warning-message">
              <AlertTriangle size={16} />
              <span>
                Warning: Service type cannot be modified after creation.
              </span>
            </div>
          )}

          <input
            type="text"
            name="nameEnglish"
            placeholder="Plan Name (English)"
            value={newPlan.nameEnglish}
            onChange={handleInputChange}
            required
            className="admin-input"
          />
          <input
            type="text"
            name="nameArabic"
            placeholder="Plan Name (Arabic)"
            value={newPlan.nameArabic}
            onChange={handleInputChange}
            required
            className="admin-input"
          />
          <textarea
            name="descriptionEnglish"
            placeholder="Plan Description (English)"
            value={newPlan.descriptionEnglish}
            onChange={handleInputChange}
            required
            className="admin-textarea"
          />
          <textarea
            name="descriptionArabic"
            placeholder="Plan Description (Arabic)"
            value={newPlan.descriptionArabic}
            onChange={handleInputChange}
            required
            className="admin-textarea"
          />
          <div className="admin-checkbox-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isVeg"
                checked={newPlan.isVeg}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              <span>Veg-plan</span>
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isNonVeg"
                checked={newPlan.isNonVeg}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              <span>Non-Veg plan</span>
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isIndividual"
                checked={newPlan.isIndividual}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              <span>Individual Plan</span>
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isMultiple"
                checked={newPlan.isMultiple}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              <span>Multiple Plan</span>
            </label>
          </div>

          <div className="admin-checkbox-group">
            <label>Package Selection:</label>
            <div className="admin-package-options">
              {["breakfast", "lunch", "dinner", "snacks"].map((option) => (
                <label key={option} className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="package"
                    value={option}
                    checked={newPlan.package.includes(option)}
                    onChange={handleInputChange}
                    className="admin-checkbox"
                  />
                  <span>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {showPackageWarning && (
            <div className="admin-warning-message">
              <AlertTriangle size={16} />
              <span>
                Warning: Package selection cannot be modified after creation.
              </span>
            </div>
          )}
          <div className="admin-form-btn">
            <button
              type="button"
              className="admin-cancel-button"
              onClick={() => navigate("/plans")}
            >
              Cancel
            </button>
            <button type="submit" className="admin-save-button">
              Save Plan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlanCreate;
