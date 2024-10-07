import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const NewPlan = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const [image, setImage] = useState(null);
  const [planNameEn, setPlanNameEn] = useState("");
  const [planNameAr, setPlanNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [categories, setCategories] = useState({
    multiplePlan: false,
    individualPlan: false,
    vegCategory: false,
    nonVegCategory: false,
  });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0])); // Preview the image
    }
  };

  const handleCheckboxChange = (e) => {
    setCategories({
      ...categories,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted!"); // Debug log
    console.log({
      image,
      planNameEn,
      planNameAr,
      descriptionEn,
      descriptionAr,
      categories,
    });

    // Navigate to SelectItemPage on form submission
    navigate("/select-item-page"); // Change this path based on your routing configuration
  };

  return (
    <div style={formContainerStyle}>
      <h1>Create New Plan</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex" }}>
        <div style={{ marginRight: "20px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" style={uploadLabelStyle}>
            {image ? (
              <img src={image} alt="Plan" style={imageStyle} />
            ) : (
              <span style={uploadButtonStyle}>Upload Image</span>
            )}
          </label>
          {image && (
            <div style={imageButtonContainerStyle}>
              <button
                type="button"
                onClick={() => setImage(null)} // Delete Image
                style={deleteButtonStyle}
              >
                Delete Image
              </button>
              <label htmlFor="image-upload" style={editButtonStyle}>
                Edit Image
              </label>
            </div>
          )}
        </div>
        <div style={{ flexGrow: 1 }}>
          <div>
            <input
              type="text"
              placeholder="Plan Name (English)"
              value={planNameEn}
              onChange={(e) => setPlanNameEn(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Plan Name (Arabic)"
              value={planNameAr}
              onChange={(e) => setPlanNameAr(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Description (English)"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              style={textareaStyle}
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Description (Arabic)"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              style={textareaStyle}
              required
            />
          </div>
          <div className="category-section">
            <h3>Select Categories</h3>
            <label style={RadioInputStyle}>
              <input
                style={CheckboxStyle}
                type="checkbox"
                name="multiplePlan"
                checked={categories.multiplePlan}
                onChange={handleCheckboxChange}
              />
              Multiple Plan
            </label>
            <br />
            <label style={RadioInputStyle}>
              <input
                style={CheckboxStyle}
                type="checkbox"
                name="individualPlan"
                checked={categories.individualPlan}
                onChange={handleCheckboxChange}
              />
              Individual Plan
            </label>
            <br />
            <label style={RadioInputStyle}>
              <input
                style={CheckboxStyle}
                type="checkbox"
                name="vegCategory"
                checked={categories.vegCategory}
                onChange={handleCheckboxChange}
              />
              Veg Category
            </label>
            <br />
            <label style={RadioInputStyle}>
              <input
                style={CheckboxStyle}
                type="checkbox"
                name="nonVegCategory"
                checked={categories.nonVegCategory}
                onChange={handleCheckboxChange}
              />
              Non-Veg Category
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <button type="submit" style={nextButtonStyle}>
              Next
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Styles
const formContainerStyle = {
  backgroundColor: "white",
  borderRadius: "50px",
  padding: "50px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  width: "600px",
};

const uploadLabelStyle = {
  width: "200px",
  height: "200px",
  border: "2px dashed #ccc",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  marginBottom: "20px",
  backgroundColor: "#f9f9f9",
};

const uploadButtonStyle = {
  color: "black", // Text color for upload button
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "8px",
};

const imageButtonContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
};

const deleteButtonStyle = {
  color: "red",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const editButtonStyle = {
  color: "blue",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  border: "1px solid #ccc",
  borderRadius: "25px",
};

const textareaStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  border: "1px solid #ccc",
  borderRadius: "25px",
  minHeight: "100px",
};

const RadioInputStyle = {
  cursor: "pointer",
  color: "black",
};

const CheckboxStyle = {
  marginBottom: "15px",
  marginRight: "20px",
};

const nextButtonStyle = {
  marginLeft: "10px",
  padding: "10px 30px",
  fontSize: "16px",
  cursor: "pointer",
  backgroundColor: "#FF0000", // Background color for next button
  color: "white",
  border: "none",
  borderRadius: "50px",
};

export default NewPlan;
