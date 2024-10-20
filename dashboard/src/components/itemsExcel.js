import React, { useState, useEffect } from 'react';
import '../styles/itemsExcel.css'; 
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx'; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig"; 
import { createItem, getAllCategories } from '../utils/api'; 

//To add = Duplicate logic, images 

function Excelupload() {
  const [fileData, setFileData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [failedItems, setFailedItems] = useState([]); //Track items that have failed to upload 
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 5; 

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCategories();
      if (response.success) {
        setCategories(response.data);
        console.log("Fetching categories in items excel", response.data); 
      } else {
        console.error("Failed to fetch categories:", response.error); 
      }
    };
    fetchCategories();
  }, []);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile); 

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      console.log("Sheet name:", sheetName);

      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      console.log("Parsed Excel data:", worksheet); 

      setFileData(worksheet);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleBulkUpload = async () => {
    if (!fileData) return;
  
    console.log("Starting bulk upload process...");
    const itemsToUpload = [];
    const failedUploads = [];
  
    const categoryMap = new Map(categories.map(cat => [cat.name.trim().toLowerCase(), cat._id]));
    console.log("Category map:", Array.from(categoryMap.entries()));
  
    for (const item of fileData) {
      const {
        image,
        nameEnglish,
        nameArabic,
        descriptionEnglish,
        descriptionArabic,
        calories,
        protein,
        carbs,
        fat,
        type,
        category,
        prices,
        ...otherFields
      } = item;
  
      const normalizedCategory = category.trim().toLowerCase();
      const categoryId = categoryMap.get(normalizedCategory);
      if (!categoryId) {
        const reason = `Invalid category: "${category}"`;
        failedUploads.push({ nameEnglish, reason });
        continue;
      }
  
      const trimmedNameEnglish = nameEnglish ? nameEnglish.trim() : undefined;
      if (!trimmedNameEnglish) {
        const reason = "Missing or invalid nameEnglish";
        failedUploads.push({ nameEnglish, reason });
        continue;
      }
  
      let imageUrl = "";
  
      if (image && typeof image === 'string' && image.startsWith('http')) {
        imageUrl = image;
      } else if (image) {
        try {
          const storageRef = ref(storage, `items/${Date.now()}_${image.name}`);
          const snapshot = await uploadBytes(storageRef, image);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
          const reason = "Error uploading image";
          failedUploads.push({ nameEnglish, reason });
          continue;
        }
      } else {
        const reason = "Image is required but missing";
        failedUploads.push({ nameEnglish, reason });
        continue;
      }
  
      const normalizedType = type.trim();
      if (!['Veg', 'Non Veg'].includes(normalizedType)) {
        const reason = `Invalid type: "${type}"`;
        failedUploads.push({ nameEnglish, reason });
        continue;
      }
  
      let parsedPrices = [];
      try {
        parsedPrices = JSON.parse(prices);
      } catch (error) {
        const reason = "Error parsing prices";
        failedUploads.push({ nameEnglish, reason });
        continue;
      }
  
      const itemToUpload = {
        nameEnglish: trimmedNameEnglish,
        nameArabic,
        descriptionEnglish,
        descriptionArabic,
        calories,
        protein,
        carbs,
        fat,
        type: normalizedType,
        category: categoryId,
        prices: parsedPrices,
        image: imageUrl,
        ...otherFields,
      };
  
      itemsToUpload.push(itemToUpload);
    }
  
    console.log("All items prepared for upload:", itemsToUpload);
    setFailedItems(failedUploads);
  
    try {
      setUploadStatus(null);
      let successCount = 0;
  
      for (const item of itemsToUpload) {
        const response = await createItem(item);
  
        if (response.success) {
          successCount++;
        } else {
          failedUploads.push({ nameEnglish: item.nameEnglish, reason: response.error });
        }
      }
      
      setUploadStatus({
        success: true,
        message: `${successCount} items processed successfully. ${failedUploads.length} items could not be uploaded.`,
      });
    } catch (error) {
      setUploadStatus({ success: false, message: "An error occurred during the bulk upload process." });
    }
  };

  //pagination buttons
  const currentItems = fileData ? fileData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = fileData ? Math.ceil(fileData.length / itemsPerPage) : 1;

  return (
    <div className="excel-upload">
      <label htmlFor="file-upload" className="center-button">
        <FaFileExcel /> Upload Excel Sheet
      </label>
      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        accept=".xlsx"
        onChange={handleFileUpload}
      />

      {currentItems.length > 0 && (
        <div className="data-container">
          <h3>Uploaded Excel Data:</h3>
          <div className="data-table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  {Object.keys(currentItems[0]).map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {fileData && totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button key={index} onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {fileData && (
        <div className="save-button-container">
          <button className="save-button" onClick={handleBulkUpload}>Save</button>
        </div>
      )}

      {uploadStatus && (
        <div className={uploadStatus.success ? "success-message" : "error-message"}>
          {uploadStatus.message}
        </div>
      )}

      {failedItems.length > 0 && (
        <div className="error-message">
          <h4>Items that could not be uploaded:</h4>
          <ul>
            {failedItems.map((item, index) => (
              <li key={index}>{item.nameEnglish}: {item.reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Excelupload;
