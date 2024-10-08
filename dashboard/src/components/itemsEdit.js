// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { X, Upload, Image } from "lucide-react";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from "../config/firebaseConfig";
// import { getItem, updateItem, deleteItem } from "../utils/api";
// import "../styles/Add-item.css";

// const ItemsEdit = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [item, setItem] = useState({
//     image: null,
//     nameEnglish: "",
//     nameArabic: "",
//     descriptionEnglish: "",
//     descriptionArabic: "",
//     calories: "",
//     protein: "",
//     carbs: "",
//     fat: "",
//     type: "Non Veg",
//     category: "Dinner",
//     prices: [{ currency: "SAR", sellingPrice: "", discountPrice: "" }],
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     const fetchItem = async () => {
//       setLoading(true);
//       const result = await getItem(id);
//       if (result.success) {
//         setItem(result.data);
//       } else {
//         setError("Failed to fetch item details.");
//       }
//       setLoading(false);
//     };

//     fetchItem();
//   }, [id]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setItem((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setItem((prevState) => ({
//         ...prevState,
//         image: file,
//       }));
//     }
//   };

//   const handlePriceChange = (index, field, value) => {
//     const newPrices = [...item.prices];
//     newPrices[index] = { ...newPrices[index], [field]: value };
//     setItem((prevState) => ({
//       ...prevState,
//       prices: newPrices,
//     }));
//   };

//   const addPrice = () => {
//     setItem((prevState) => ({
//       ...prevState,
//       prices: [
//         ...prevState.prices,
//         { currency: "", sellingPrice: "", discountPrice: "" },
//       ],
//     }));
//   };

//   const removePrice = (index) => {
//     if (item.prices.length > 1) {
//       setItem((prevState) => ({
//         ...prevState,
//         prices: prevState.prices.filter((_, i) => i !== index),
//       }));
//     }
//   };

//   const uploadImage = async (file) => {
//     const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
//     const snapshot = await uploadBytes(storageRef, file);
//     return getDownloadURL(snapshot.ref);
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       let imageUrl = item.image;
//       if (item.image instanceof File) {
//         imageUrl = await uploadImage(item.image);
//       }

//       const itemData = {
//         ...item,
//         image: imageUrl,
//         calories: parseFloat(item.calories),
//         protein: parseFloat(item.protein),
//         carbs: parseFloat(item.carbs),
//         fat: parseFloat(item.fat),
//         prices: item.prices.map((price) => ({
//           ...price,
//           sellingPrice: parseFloat(price.sellingPrice),
//           discountPrice: price.discountPrice
//             ? parseFloat(price.discountPrice)
//             : null,
//         })),
//       };

//       const result = await updateItem(id, itemData);
//       if (result.success) {
//         setSuccess(true);
//       } else {
//         setError(result.error);
//       }
//     } catch (error) {
//       console.error("Error updating item:", error);
//       setError("Failed to update item. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (window.confirm("Are you sure you want to delete this item?")) {
//       setLoading(true);
//       setError(null);
//       try {
//         const result = await deleteItem(id);
//         if (result.success) {
//           navigate("/lunch"); // Redirect to lunch page after successful delete
//         } else {
//           setError(result.error);
//         }
//       } catch (error) {
//         console.error("Error deleting item:", error);
//         setError("Failed to delete item. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div className="error-message">{error}</div>;

//   return (
//     <div className="add-item-page">
//       <h1>Edit Item</h1>
//       {success && (
//         <div className="success-message">Item updated successfully!</div>
//       )}
//       <form onSubmit={handleUpdate}>
//         <div className="form-layout">
//           <div className="image-upload">
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//               id="image-upload"
//               className="hidden"
//             />
//             <label htmlFor="image-upload" className="upload-area">
//               {item.image ? (
//                 <div className="image-preview">
//                   <img
//                     src={
//                       item.image instanceof File
//                         ? URL.createObjectURL(item.image)
//                         : item.image
//                     }
//                     alt="Item"
//                     className="uploaded-image"
//                   />
//                   <div className="image-overlay">
//                     <Image size={24} />
//                     <span>Change Image</span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="upload-placeholder">
//                   <Upload size={48} />
//                   <span>Upload Image</span>
//                 </div>
//               )}
//             </label>
//           </div>

//           <div className="form-fields">
//             <div className="form-group">
//               <input
//                 type="text"
//                 name="nameEnglish"
//                 placeholder="Name in English"
//                 value={item.nameEnglish}
//                 onChange={handleInputChange}
//                 required
//               />
//               <input
//                 type="text"
//                 name="nameArabic"
//                 placeholder="Name in Arabic"
//                 value={item.nameArabic}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <textarea
//                 name="descriptionEnglish"
//                 placeholder="Description in English"
//                 value={item.descriptionEnglish}
//                 onChange={handleInputChange}
//                 required
//               />
//               <textarea
//                 name="descriptionArabic"
//                 placeholder="Description in Arabic"
//                 value={item.descriptionArabic}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <input
//                 type="number"
//                 name="calories"
//                 placeholder="Calories"
//                 value={item.calories}
//                 onChange={handleInputChange}
//                 required
//               />
//               <input
//                 type="number"
//                 name="protein"
//                 placeholder="Protein (g)"
//                 value={item.protein}
//                 onChange={handleInputChange}
//                 required
//               />
//               <input
//                 type="number"
//                 name="carbs"
//                 placeholder="Carbs (g)"
//                 value={item.carbs}
//                 onChange={handleInputChange}
//                 required
//               />
//               <input
//                 type="number"
//                 name="fat"
//                 placeholder="Fat (g)"
//                 value={item.fat}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <select
//                 name="type"
//                 value={item.type}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="Non Veg">Non Veg</option>
//                 <option value="Veg">Veg</option>
//               </select>
//               <select
//                 name="category"
//                 value={item.category}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="Lunch">Lunch</option>
//                 <option value="Dinner">Dinner</option>
//                 <option value="Lunch and Dinner">Lunch and Dinner</option>
//               </select>
//             </div>

//             <div className="price-section">
//               {item.prices.map((price, index) => (
//                 <div key={index} className="price-group">
//                   <select
//                     value={price.currency}
//                     onChange={(e) =>
//                       handlePriceChange(index, "currency", e.target.value)
//                     }
//                     required
//                   >
//                     <option value="SAR">SAR</option>
//                     <option value="AED">AED</option>
//                     <option value="BHD">BHD</option>
//                     <option value="QAR">QAR</option>
//                   </select>
//                   <input
//                     type="number"
//                     placeholder="Selling Price"
//                     value={price.sellingPrice}
//                     onChange={(e) =>
//                       handlePriceChange(index, "sellingPrice", e.target.value)
//                     }
//                     required
//                   />
//                   <input
//                     type="number"
//                     placeholder="Discount Price (optional)"
//                     value={price.discountPrice}
//                     onChange={(e) =>
//                       handlePriceChange(index, "discountPrice", e.target.value)
//                     }
//                   />
//                   {index > 0 && (
//                     <button
//                       type="button"
//                       onClick={() => removePrice(index)}
//                       className="remove-price"
//                     >
//                       <X size={16} />
//                     </button>
//                   )}
//                 </div>
//               ))}
//               <button type="button" onClick={addPrice} className="add-price">
//                 + Add Price
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="button-group">
//           <button
//             type="submit"
//             className="action-btn update-btn"
//             disabled={loading}
//           >
//             {loading ? "Updating..." : "Update"}
//           </button>
//           <button
//             type="button"
//             className="action-btn delete-btn"
//             onClick={handleDelete}
//             disabled={loading}
//           >
//             {loading ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ItemsEdit;
