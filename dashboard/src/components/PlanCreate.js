import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
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
    duration: 5,
  });
  const [showPackageWarning, setShowPackageWarning] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "package") {
      setNewPlan((prevState) => ({
        ...prevState,
        package: checked
          ? [...prevState.package, value]
          : prevState.package.filter((item) => item !== value),
      }));
      setShowPackageWarning(true);
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
        // Handle error (e.g., show error message to user)
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      // Handle error (e.g., show error message to user)
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
              Veg-plan
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isNonVeg"
                checked={newPlan.isNonVeg}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              Non-Veg plan
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isIndividual"
                checked={newPlan.isIndividual}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              Individual Plan
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isMultiple"
                checked={newPlan.isMultiple}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              Multiple Plan
            </label>
          </div>
          <div className="admin-checkbox-group">
            <label className="admin-checkbox-label">Package:</label>
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
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </label>
            ))}
          </div>
          {showPackageWarning && (
            <div className="package-warning">
              Warning: Please select packages carefully. Cannot modify later to
              prevent data loss.
            </div>
          )}
          <div className="admin-form-group-category">
            <label className="admin-select-label">Duration (days):</label>
            <select
              name="duration"
              value={newPlan.duration}
              onChange={handleInputChange}
              required
              className="admin-select"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
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
