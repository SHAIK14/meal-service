import React, { useState } from "react";
import { X, Upload, Image } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import { createItem } from "../utils/api";
import "../styles/Add-item.css";

const AddItemPage = () => {
  const [item, setItem] = useState({
    image: null,
    nameEnglish: "",
    nameArabic: "",
    descriptionEnglish: "",
    descriptionArabic: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    type: "Non Veg",
    category: "Dinner",
    prices: [{ currency: "SAR", sellingPrice: "", discountPrice: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItem((prevState) => ({
        ...prevState,
        image: file,
      }));
    }
  };

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...item.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setItem((prevState) => ({
      ...prevState,
      prices: newPrices,
    }));
  };

  const addPrice = () => {
    setItem((prevState) => ({
      ...prevState,
      prices: [
        ...prevState.prices,
        { currency: "", sellingPrice: "", discountPrice: "" },
      ],
    }));
  };

  const removePrice = (index) => {
    if (item.prices.length > 1) {
      setItem((prevState) => ({
        ...prevState,
        prices: prevState.prices.filter((_, i) => i !== index),
      }));
    }
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let imageUrl = "";
      if (item.image) {
        imageUrl = await uploadImage(item.image);
      }

      const itemData = {
        ...item,
        image: imageUrl,
        calories: parseFloat(item.calories),
        protein: parseFloat(item.protein),
        carbs: parseFloat(item.carbs),
        fat: parseFloat(item.fat),
        prices: item.prices.map((price) => ({
          ...price,
          sellingPrice: parseFloat(price.sellingPrice),
          discountPrice: price.discountPrice
            ? parseFloat(price.discountPrice)
            : null,
        })),
      };

      const result = await createItem(itemData);
      if (result.success) {
        console.log("Item added:", result.data);
        setSuccess(true);

        // Reset the form
        setItem({
          image: null,
          nameEnglish: "",
          nameArabic: "",
          descriptionEnglish: "",
          descriptionArabic: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
          type: "Non Veg",
          category: "Dinner",
          prices: [{ currency: "SAR", sellingPrice: "", discountPrice: "" }],
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="add-item-page">
      <h1>Add New Item</h1>
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">Item added successfully!</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="image-upload"
              className="hidden"
            />
            <label htmlFor="image-upload" className="upload-area">
              {item.image ? (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(item.image)}
                    alt="Item"
                    className="uploaded-image"
                  />
                  <div className="image-overlay">
                    <Image size={24} />
                    <span>Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <Upload size={48} />
                  <span>Upload Image</span>
                </div>
              )}
            </label>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <input
                type="text"
                name="nameEnglish"
                placeholder="Name in English"
                value={item.nameEnglish}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="nameArabic"
                placeholder="Name in Arabic"
                value={item.nameArabic}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <textarea
                name="descriptionEnglish"
                placeholder="Description in English"
                value={item.descriptionEnglish}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="descriptionArabic"
                placeholder="Description in Arabic"
                value={item.descriptionArabic}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                name="calories"
                placeholder="Calories"
                value={item.calories}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="protein"
                placeholder="Protein (g)"
                value={item.protein}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="carbs"
                placeholder="Carbs (g)"
                value={item.carbs}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="fat"
                placeholder="Fat (g)"
                value={item.fat}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <select
                name="type"
                value={item.type}
                onChange={handleInputChange}
                required
              >
                <option value="Non Veg">Non Veg</option>
                <option value="Veg">Veg</option>
              </select>
              <select
                name="category"
                value={item.category}
                onChange={handleInputChange}
                required
              >
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Lunch and Dinner">Lunch and Dinner</option>
              </select>
            </div>

            <div className="price-section">
              {item.prices.map((price, index) => (
                <div key={index} className="price-group">
                  <select
                    value={price.currency}
                    onChange={(e) =>
                      handlePriceChange(index, "currency", e.target.value)
                    }
                    required
                  >
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                    <option value="BHD">BHD</option>
                    <option value="QAR">QAR</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Selling Price"
                    value={price.sellingPrice}
                    onChange={(e) =>
                      handlePriceChange(index, "sellingPrice", e.target.value)
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Discount Price (optional)"
                    value={price.discountPrice}
                    onChange={(e) =>
                      handlePriceChange(index, "discountPrice", e.target.value)
                    }
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePrice(index)}
                      className="remove-price"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addPrice} className="add-price">
                + Add Price
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Saving..." : "SAVE"}
        </button>
      </form>
    </div>
  );
};

export default AddItemPage;
