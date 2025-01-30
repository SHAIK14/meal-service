import React, { useState } from "react";
import "../styles/Banners.css";


const Banners = () => {
  const [banners, setBanners] = useState(Array(5).fill(null)); // Array to hold 5 banner slots

  // Handle image upload
  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a URL for the image preview
      const updatedBanners = [...banners];
      updatedBanners[index] = { file, url: imageUrl }; // Store the file and its preview URL
      setBanners(updatedBanners);
    }
  };

  // Handle deleting an image
  const handleDeleteBanner = (index) => {
    const updatedBanners = [...banners];
    updatedBanners[index] = null; // Reset the selected banner slot
    setBanners(updatedBanners);
  };

  return (
    <div className="banners-container">
      <h1>Manage Banners</h1>

      <div className="banner-list">
        {banners.map((banner, index) => (
          <div key={index} className="banner-item">
            {/* Image preview or Upload Image placeholder */}
            {banner ? (
              <img
                src={banner.url}
                alt={`Banner ${index + 1}`}
                className="banner-img"
              />
            ) : (
              <label className="upload-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  className="file-input"
                />
                <span>Upload Image</span>
              </label>
            )}

            {/* Only the "Delete" button when an image is uploaded */}
            {banner && (
              <div className="banner-buttons">
                <button
                  onClick={() => handleDeleteBanner(index)}
                  className="btn delete-btn"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banners;
