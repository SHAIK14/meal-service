import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Image,
  AlertTriangle,
  Check,
  FileText,
  Download,
} from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import {
  createItem,
  getAllCategories,
  bulkUploadItems,
  // handleResponse,
} from "../utils/api";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const AddItemPage = () => {
  const navigate = useNavigate();
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
    category: "",
    prices: [{ currency: "SAR", sellingPrice: "", discountPrice: "" }],
    services: {
      subscription: false,
      indoorCatering: false,
      outdoorCatering: false,
      dining: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [uploadMode, setUploadMode] = useState("single"); // "single" or "bulk"
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploadStatus, setBulkUploadStatus] = useState(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const result = await getAllCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
        if (result.data.length > 0) {
          setItem((prevItem) => ({
            ...prevItem,
            category: result.data[0]._id || "",
          }));
        }
      } else {
        console.error("Failed to fetch categories:", result.error);
        setError("Failed to fetch categories. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("An error occurred while fetching categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleServiceChange = (service) => {
    setItem((prevState) => ({
      ...prevState,
      services: {
        ...prevState.services,
        [service]: !prevState.services[service],
      },
    }));
    setShowWarning(true);
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
        { currency: "SAR", sellingPrice: "", discountPrice: "" },
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
    if (!file) return "";

    const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for required fields
    if (
      !item.nameEnglish ||
      !item.nameArabic ||
      !item.calories ||
      !item.prices[0].sellingPrice ||
      !(
        item.services.subscription ||
        item.services.indoorCatering ||
        item.services.outdoorCatering ||
        item.services.dining
      )
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (categories.length === 0) {
      setError("Please add a category first before adding an item.");
      return;
    }

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
        setSuccess(true);
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
          category: categories[0]?._id || "",
          prices: [{ currency: "SAR", sellingPrice: "", discountPrice: "" }],
          services: {
            subscription: false,
            indoorCatering: false,
            outdoorCatering: false,
            dining: false,
          },
        });
      } else {
        setError(result.error || "Failed to add item. Please try again.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBulkFile(file);
      setBulkUploadStatus(null);
    }
  };

  const generateExcelTemplate = async () => {
    try {
      const categoriesResponse = await fetchAllCategories();
      const categories = categoriesResponse.success
        ? categoriesResponse.data.data
        : [];

      // Create a "Categories" sheet first
      const wb = XLSX.utils.book_new();

      // Add Categories Reference sheet
      if (categories.length > 0) {
        const categoryData = categories.map((cat) => ({
          categoryId: cat._id,
          categoryName: cat.nameEnglish || cat.name,
          description: cat.description || "",
        }));

        const catWs = XLSX.utils.json_to_sheet(categoryData);
        catWs["!cols"] = [{ wch: 24 }, { wch: 20 }, { wch: 30 }];

        // Add the categories reference sheet first
        XLSX.utils.book_append_sheet(wb, catWs, "Categories Reference");
      }

      // Template data with first category from the list
      const exampleCategory = categories.length > 0 ? categories[0] : null;

      const templateData = [
        {
          nameEnglish: "Example Item",
          nameArabic: "مثال عنصر",
          descriptionEnglish: "Description in English",
          descriptionArabic: "الوصف بالعربية",
          calories: 250,
          protein: 15,
          carbs: 30,
          fat: 10,
          type: "Non Veg", // or "Veg"
          categoryName: exampleCategory
            ? exampleCategory.nameEnglish || exampleCategory.name
            : "Enter Category Name",
          categoryId: exampleCategory ? exampleCategory._id : "",
          sellingPrice: 50,
          currency: "SAR",
          discountPrice: 45,
          subscription: "TRUE",
          indoorCatering: "TRUE",
          outdoorCatering: "FALSE",
          dining: "TRUE",
          image: "default-image.jpg",
        },
      ];

      // Create Excel worksheet from the template data
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Set column widths for better presentation
      ws["!cols"] = [
        { wch: 20 }, // nameEnglish
        { wch: 20 }, // nameArabic
        { wch: 30 }, // descriptionEnglish
        { wch: 30 }, // descriptionArabic
        { wch: 10 }, // calories
        { wch: 10 }, // protein
        { wch: 10 }, // carbs
        { wch: 10 }, // fat
        { wch: 10 }, // type
        { wch: 20 }, // categoryName
        { wch: 24 }, // categoryId
        { wch: 10 }, // sellingPrice
        { wch: 10 }, // currency
        { wch: 10 }, // discountPrice
        { wch: 10 }, // subscription
        { wch: 10 }, // indoorCatering
        { wch: 10 }, // outdoorCatering
        { wch: 10 }, // dining
        { wch: 20 }, // image
      ];

      // Add the template sheet
      XLSX.utils.book_append_sheet(wb, ws, "Items Template");

      // Write the Excel file
      XLSX.writeFile(wb, "item_upload_template.xlsx");
    } catch (error) {
      console.error("Error generating template:", error);
      setError("Failed to generate Excel template");
    }
  };

  // Function to fetch all categories
  const fetchAllCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      console.log("Categories API Response: ", response);
      return response;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, data: { data: [] } }; // Fallback to empty categories
    }
  };

  // Function to process bulk upload
  // Modify the processBulkUpload function to better handle the Excel data

  const processBulkUpload = async () => {
    if (!bulkFile) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setBulkUploadProgress(10);
    setBulkUploadStatus("processing");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          setBulkUploadProgress(40);

          const parsedItemsData = XLSX.utils.sheet_to_json(worksheet);
          console.log("Parsed Excel Data:", parsedItemsData); // Debug parsed data

          setBulkUploadProgress(60);

          const formattedItems = [];
          const errors = [];

          for (let i = 0; i < parsedItemsData.length; i++) {
            const item = parsedItemsData[i];

            // Skip example item
            if (
              item.nameEnglish === "Example Item" ||
              !item.nameEnglish?.trim()
            ) {
              console.log("Skipping example or empty item");
              continue;
            }

            // Make sure required fields exist
            if (
              !item.nameEnglish ||
              !item.nameArabic ||
              !item.descriptionEnglish ||
              !item.descriptionArabic
            ) {
              errors.push({
                row: i + 2,
                nameEnglish: item.nameEnglish || "Unknown",
                status: "error",
                message: "Missing required fields",
              });
              continue;
            }

            // Convert string boolean values to actual booleans
            const convertToBoolean = (value) => {
              if (typeof value === "boolean") return value;
              if (typeof value === "string") {
                return value.toLowerCase() === "true";
              }
              return Boolean(value);
            };

            // Important: Send categoryName directly from Excel
            formattedItems.push({
              nameEnglish: item.nameEnglish,
              nameArabic: item.nameArabic,
              descriptionEnglish: item.descriptionEnglish,
              descriptionArabic: item.descriptionArabic,
              image: item.image || "default-image.jpg",
              calories: Number(item.calories) || 0,
              protein: Number(item.protein) || 0,
              carbs: Number(item.carbs) || 0,
              fat: Number(item.fat) || 0,
              type: item.type === "Veg" ? "Veg" : "Non Veg",
              categoryName: item.categoryName, // Send the category name directly
              categoryId: item.categoryId, // Send the category ID as well
              prices: [
                {
                  currency: item.currency || "SAR",
                  sellingPrice: Number(item.sellingPrice) || 0,
                  discountPrice: item.discountPrice
                    ? Number(item.discountPrice)
                    : null,
                },
              ],
              available:
                item.available === undefined ? true : Boolean(item.available),
              subscription: convertToBoolean(item.subscription),
              indoorCatering: convertToBoolean(item.indoorCatering),
              outdoorCatering: convertToBoolean(item.outdoorCatering),
              dining: convertToBoolean(item.dining),
            });
          }

          setBulkUploadProgress(80);
          console.log("Formatted items count:", formattedItems.length);

          if (formattedItems.length === 0) {
            setError("No valid items found in the Excel file");
            setBulkUploadStatus({
              total: parsedItemsData.length,
              success: 0,
              error: errors.length,
              details: errors,
            });
            setLoading(false);
            return;
          }

          const result = await bulkUploadItems(formattedItems);
          setBulkUploadProgress(100);

          const allErrors = [...errors];
          if (result.data?.errors) {
            allErrors.push(...result.data.errors);
          }

          setBulkUploadStatus({
            total: parsedItemsData.length,
            success: result.success
              ? result.data.insertedCount || formattedItems.length
              : 0,
            error: allErrors.length,
            details: allErrors,
          });

          if (result.success) {
            setSuccess(true);
          } else {
            setError(result.error || "Failed to upload items");
          }
        } catch (parseError) {
          console.error("Parsing error:", parseError);
          setBulkUploadStatus("error");
          setError("Failed to parse Excel file: " + parseError.message);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        setBulkUploadStatus("error");
        setError("Failed to read file");
        setLoading(false);
      };

      reader.readAsArrayBuffer(bulkFile);
    } catch (error) {
      console.error("Bulk upload error:", error);
      setBulkUploadStatus("error");
      setError("Failed to process bulk upload");
      setLoading(false);
    }
  };
  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-medium text-gray-800 mb-6">
          Add New Item
        </h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600">
              No categories available. Please add a category first.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/items")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
        >
          Go to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-medium text-gray-800 mb-6">Add New Item</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-600">
              {uploadMode === "single"
                ? "Item added successfully!"
                : "Bulk upload completed successfully!"}
            </p>
          </div>
        </div>
      )}

      {/* Upload Type Selection */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setUploadMode("single")}
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${
              uploadMode === "single"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Add Single Item
          </button>
          <button
            onClick={() => setUploadMode("bulk")}
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${
              uploadMode === "bulk"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {uploadMode === "bulk" ? (
        <div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-sm text-blue-600">
                Upload multiple items at once using an Excel file.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={generateExcelTemplate}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkFileChange}
              id="bulk-upload"
              className="hidden"
            />
            <label
              htmlFor="bulk-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="mb-3 p-3 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-base font-medium text-gray-700">
                {bulkFile ? bulkFile.name : "Upload Excel File"}
              </p>
              <p className="text-sm text-gray-500 mt-1">.xlsx or .xls format</p>
            </label>
          </div>

          {bulkUploadStatus === "processing" && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${bulkUploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Processing: {bulkUploadProgress}%
              </p>
            </div>
          )}

          {bulkUploadStatus &&
            bulkUploadStatus !== "processing" &&
            bulkUploadStatus !== "error" && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Upload Results</h3>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="mb-2">Total Items: {bulkUploadStatus.total}</p>
                  <p className="text-green-600 mb-2">
                    Successfully Uploaded: {bulkUploadStatus.success}
                  </p>
                  <p className="text-red-600 mb-2">
                    Failed: {bulkUploadStatus.error}
                  </p>
                  {bulkUploadStatus.error > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-1">
                        Error Details:
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        {bulkUploadStatus.details
                          .filter((item) => item.status === "error")
                          .map((item, index) => (
                            <p key={index} className="text-sm text-red-600">
                              Row {item.row}: {item.message}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          <div className="flex justify-end">
            <button
              onClick={processBulkUpload}
              disabled={!bulkFile || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all"
            >
              {loading ? "Processing..." : "Upload Items"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Upload Section */}
            <div className="lg:col-span-1">
              <div
                className={`border-2 rounded-lg overflow-hidden ${
                  item.image
                    ? "border-green-500"
                    : "border-dashed border-gray-300"
                } transition-all`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="image-upload"
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center h-80 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {item.image ? (
                    <div className="relative w-full h-full">
                      <img
                        src={URL.createObjectURL(item.image)}
                        alt="Item Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="bg-white p-2 rounded-full">
                          <Image className="h-6 w-6 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-3 p-3 bg-gray-100 rounded-full">
                        <Upload className="h-8 w-8 text-gray-500" />
                      </div>
                      <p className="text-base font-medium text-gray-700">
                        Upload Image
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                      <p className="mt-4 text-xs text-gray-500">Optional</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name in English *
                  </label>
                  <input
                    type="text"
                    name="nameEnglish"
                    value={item.nameEnglish}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name in Arabic *
                  </label>
                  <input
                    type="text"
                    name="nameArabic"
                    value={item.nameArabic}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description in English
                  </label>
                  <textarea
                    name="descriptionEnglish"
                    value={item.descriptionEnglish}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description in Arabic
                  </label>
                  <textarea
                    name="descriptionArabic"
                    value={item.descriptionArabic}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    rows="3"
                  />
                </div>
              </div>

              {/* Nutrition Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nutrition Information
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Calories *
                    </label>
                    <input
                      type="number"
                      name="calories"
                      value={item.calories}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      name="protein"
                      value={item.protein}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      name="carbs"
                      value={item.carbs}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      name="fat"
                      value={item.fat}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={item.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="Non Veg">Non Veg</option>
                    <option value="Veg">Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={item.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Services Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Services *
                </label>
                {showWarning && (
                  <div className="flex items-center gap-2 bg-amber-50 border-l-4 border-amber-500 p-3 mb-3 text-sm text-amber-700">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Warning: Service options cannot be modified after
                      creation. Please choose carefully.
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="subscription"
                      checked={item.services.subscription}
                      onChange={() => handleServiceChange("subscription")}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="subscription"
                      className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600"
                    >
                      Subscription
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="indoor"
                      checked={item.services.indoorCatering}
                      onChange={() => handleServiceChange("indoorCatering")}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="indoor"
                      className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600"
                    >
                      Indoor Catering
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="outdoor"
                      checked={item.services.outdoorCatering}
                      onChange={() => handleServiceChange("outdoorCatering")}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="outdoor"
                      className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600"
                    >
                      Outdoor Catering
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="dining"
                      checked={item.services.dining}
                      onChange={() => handleServiceChange("dining")}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="dining"
                      className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600"
                    >
                      Dining
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Services cannot be modified after creation.
                </p>
              </div>

              {/* Price Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Price *
                  </label>
                  <button
                    type="button"
                    onClick={addPrice}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    + Add Currency
                  </button>
                </div>

                {item.prices.map((price, index) => (
                  <div key={index} className="flex items-center gap-3 mb-3">
                    <select
                      value={price.currency}
                      onChange={(e) =>
                        handlePriceChange(index, "currency", e.target.value)
                      }
                      className="w-20 px-2 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required={index === 0}
                    />
                    <input
                      type="number"
                      placeholder="Discount Price"
                      value={price.discountPrice}
                      onChange={(e) =>
                        handlePriceChange(
                          index,
                          "discountPrice",
                          e.target.value
                        )
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePrice(index)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all"
            >
              {loading ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddItemPage;
