import React, { useState } from "react";
import { Plus, X } from "lucide-react";
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
    type: "Non Veg",
    category: "Dinner",
    prices: [{ currency: "SAR", sellingPrice: "", discountPrice: "" }],
  });

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setItem((prevState) => ({
          ...prevState,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
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

  const addCurrency = () => {
    setItem((prevState) => ({
      ...prevState,
      prices: [
        ...prevState.prices,
        { currency: "", sellingPrice: "", discountPrice: "" },
      ],
    }));
  };

  const removeCurrency = (index) => {
    setItem((prevState) => ({
      ...prevState,
      prices: prevState.prices.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Item added:", item);
  };

  return (
    <div className="add-item-page">
      <h1>Add New Item</h1>
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
            <label htmlFor="image-upload" className="upload-label">
              {item.image ? (
                <img src={item.image} alt="Item" className="uploaded-image" />
              ) : (
                <span className="upload-button">Upload Image</span>
              )}
            </label>
            {item.image && (
              <div className="image-actions">
                <button
                  type="button"
                  onClick={() => setItem((prev) => ({ ...prev, image: null }))}
                  className="delete-button"
                >
                  Delete Image
                </button>
                <label htmlFor="image-upload" className="edit-button">
                  Edit Image
                </label>
              </div>
            )}
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
                <div key={index} className="currency-group">
                  <select
                    value={price.currency}
                    onChange={(e) =>
                      handlePriceChange(index, "currency", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Currency</option>
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
                      onClick={() => removeCurrency(index)}
                      className="remove-currency"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addCurrency}
                className="add-currency"
              >
                <Plus size={20} /> Add Currency
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          <Plus size={20} />
          Add Item
        </button>
      </form>
    </div>
  );
};

export default AddItemPage;
