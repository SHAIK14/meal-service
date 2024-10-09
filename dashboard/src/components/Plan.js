import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Plans.css"; // Import your CSS

import { FaEdit, FaTrash } from "react-icons/fa";

const Plans = () => {
  const [selectedImage, setSelectedImage] = useState(null); // Declare selectedImage
  const [plans, setPlans] = useState([]); // List of saved plans
  const [isFormOpen, setIsFormOpen] = useState(false); // Toggle form popup
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
    category: "Lunch", // Default category
  });

  const navigate = useNavigate(); // Initialize useNavigate

  // Handle input change in the form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPlan((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(URL.createObjectURL(file)); // Set the preview image
    setNewPlan((prevState) => ({
      ...prevState,
      image: file,
    }));
  };

  // Handle form submission to save the new plan and redirect
  const handleSavePlan = (e) => {
    e.preventDefault();
    setPlans((prevPlans) => [...prevPlans, newPlan]); // Save the new plan
    setIsFormOpen(false); // Close the form
    resetForm(); // Reset the form
    navigate("/Planitemselection"); // Redirect to Plan-item-selection page
  };

  // Reset the form
  const resetForm = () => {
    setNewPlan({
      nameEnglish: "",
      nameArabic: "",
      descriptionEnglish: "",
      descriptionArabic: "",
      image: null,
      isVeg: false,
      isNonVeg: false,
      isIndividual: false,
      isMultiple: false,
      category: "Lunch",
    });
    setSelectedImage(null); // Reset the selected image
  };

  const handleEdit = () => {
    // Add your edit logic here (if needed)
    alert("Edit functionality to be implemented");
  };

  const handleDelete = () => {
    setSelectedImage(null); // Remove the selected image
    setNewPlan((prevState) => ({ ...prevState, image: null })); // Clear the image in newPlan
  };

  return (
    <div className="plans-wrapper">
      <div className="plans-container">
        <h1>Meal Plans</h1>

        {/* Show "Create New Plan" button if there are existing plans */}
        <div className="create-plan-section">
          <button
            className="create-plan-btn global-btn"
            onClick={() => setIsFormOpen(true)}
          >
            Create New Plan
          </button>
        </div>

        {/* Show list of saved plans */}
        {plans.length > 0 ? (
          <div className="plans-list">
            {plans.map((plan, index) => (
              <div key={index} className="plan-card">
                <h2>{plan.nameEnglish}</h2>
                <p>{plan.descriptionEnglish}</p>
                {plan.image && (
                  <img
                    src={URL.createObjectURL(plan.image)}
                    alt={plan.nameEnglish}
                    className="plan-image"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-plans">
            <p>No plans available. Create a new one!</p>
          </div>
        )}

        {/* Form to create a new plan (popup) */}
        {isFormOpen && (
          <div className="form-overlay">
            <div className="form-wrapper">
              <div className="form-popup">
                <div className="form-header">
                  <div className="form-title">
                    <h2>Create New Plan</h2>
                  </div>
                </div>
                <form onSubmit={handleSavePlan}>
                  <div className="image-container">
                    <label htmlFor="file-upload" className="custom-file-upload">
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
                      style={{ display: "none" }} // Hide the default file input
                    />

                    {selectedImage && (
                      <div className="icon-container ">
                        <button
                          onClick={handleEdit}
                          className="icon-button Icon-stlye-edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={handleDelete}
                          className="icon-button Icon-stlye-delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="form-container">
                    <div className="fields-continer">
                      <div className="form-group">
                        <input
                          type="text"
                          name="nameEnglish"
                          placeholder="Plan Name (English)"
                          value={newPlan.nameEnglish}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          name="nameArabic"
                          placeholder="Plan Name (Arabic)"
                          value={newPlan.nameArabic}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <textarea
                          name="descriptionEnglish"
                          placeholder="Plan Description (English)"
                          value={newPlan.descriptionEnglish}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <textarea
                          name="descriptionArabic"
                          placeholder="Plan Description (Arabic)"
                          value={newPlan.descriptionArabic}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Stylish Checkboxes */}

                    <div className="checkbox-group">
                      <div className="checkboxes">
                        <label>
                          <input
                            type="checkbox"
                            name="isVeg"
                            checked={newPlan.isVeg}
                            onChange={handleInputChange}
                          />
                          Veg-plan
                        </label>
                      </div>
                      <div className="checkboxes">
                        <label>
                          <input
                            type="checkbox"
                            name="isNonVeg"
                            checked={newPlan.isNonVeg}
                            onChange={handleInputChange}
                          />
                          Non-Veg plan
                        </label>
                      </div>
                      <div className="checkboxes">
                        <label>
                          <input
                            type="checkbox"
                            name="isIndividual"
                            checked={newPlan.isIndividual}
                            onChange={handleInputChange}
                          />
                          Individual Plan
                        </label>
                      </div>
                      <div className="checkboxes">
                        <label>
                          <input
                            type="checkbox"
                            name="isMultiple"
                            checked={newPlan.isMultiple}
                            onChange={handleInputChange}
                          />
                          Multiple Plan
                        </label>
                      </div>
                    </div>

                    {/* Category Dropdown */}

                    <div className="form-group category">
                      <label>Category:</label>
                      <select
                        name="category"
                        value={newPlan.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                      </select>
                    </div>
                    <div className="form-btn">
                      <button
                        type="button"
                        className="close-button"
                        onClick={() => setIsFormOpen(false)}
                      >
                        Close
                      </button>
                      <button type="submit" className="next-button">
                        Next
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;
