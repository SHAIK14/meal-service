// import React, { useState, useEffect } from "react";
// import { getAllItems, toggleItemAvailability } from "../utils/api";
// import { Edit2, ChevronLeft, ChevronRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "../styles/Lunchmenu.css";

// const ITEMS_PER_PAGE = 5;

// const Lunchmenu = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [editingItem, setEditingItem] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchItems();
//   }, []);

//   const fetchItems = async () => {
//     setLoading(true);
//     const result = await getAllItems();
//     if (result.success) {
//       setItems(result.data.filter((item) => item.category === "Lunch"));
//     } else {
//       setError(result.error);
//     }
//     setLoading(false);
//   };

//   const handleToggleAvailability = async (id) => {
//     const result = await toggleItemAvailability(id);
//     if (result.success) {
//       setItems(
//         items.map((item) =>
//           item._id === id ? { ...item, available: !item.available } : item
//         )
//       );
//     } else {
//       setError(result.error);
//     }
//   };

//   const handleEdit = (id) => {
//     navigate(`/lunch/${id}`);
//   };

//   const handleUpdate = (id) => {
//     // Implement update functionality
//     console.log("Update item:", id);
//     setEditingItem(null);
//   };

//   const handleDelete = (id) => {
//     // Implement delete functionality
//     console.log("Delete item:", id);
//     setEditingItem(null);
//   };

//   const renderPagination = (type) => {
//     const filteredItems = items.filter((item) => item.type === type);
//     const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

//     return (
//       <div className="pagination">
//         <button
//           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//           disabled={currentPage === 1}
//         >
//           <ChevronLeft size={20} />
//         </button>
//         <span>
//           {currentPage} / {pageCount}
//         </span>
//         <button
//           onClick={() =>
//             setCurrentPage((prev) => Math.min(prev + 1, pageCount))
//           }
//           disabled={currentPage === pageCount}
//         >
//           <ChevronRight size={20} />
//         </button>
//       </div>
//     );
//   };

//   const renderItems = (type) => {
//     const filteredItems = items.filter((item) => item.type === type);
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const endIndex = startIndex + ITEMS_PER_PAGE;
//     const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

//     return itemsToDisplay.map((item) => (
//       <div key={item._id} className="menu-item">
//         <img src={item.image} alt={item.nameEnglish} />
//         <p>{item.nameEnglish}</p>
//         <div className="item-actions">
//           <button onClick={() => handleEdit(item._id)} className="edit-btn">
//             <Edit2 size={20} />
//           </button>
//           <label className="switch">
//             <input
//               type="checkbox"
//               checked={item.available}
//               onChange={() => handleToggleAvailability(item._id)}
//             />
//             <span className="slider"></span>
//           </label>
//         </div>
//         {editingItem === item._id && (
//           <div className="edit-actions">
//             <button
//               onClick={() => handleUpdate(item._id)}
//               className="update-btn"
//             >
//               Update
//             </button>
//             <button
//               onClick={() => handleDelete(item._id)}
//               className="delete-btn"
//             >
//               Delete
//             </button>
//           </div>
//         )}
//       </div>
//     ));
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="lunch-menu-page">
//       <div className="lunch-menu-header">
//         <h2>Lunch Menu</h2>
//       </div>
//       <div className="menu-category">
//         <h3>Veg</h3>
//         {renderItems("Veg")}
//         {renderPagination("Veg")}
//       </div>
//       <div className="menu-category">
//         <h3>Non-Veg</h3>
//         {renderItems("Non Veg")}
//         {renderPagination("Non Veg")}
//       </div>
//     </div>
//   );
// };

// export default Lunchmenu;
