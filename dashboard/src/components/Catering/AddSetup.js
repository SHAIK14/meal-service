import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";

const AddSetup = () => {
  // State management
  const [setupName, setSetupName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = [];

    files.forEach((file) => {
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit`);
        return;
      }

      // Create preview URL for display
      const imageUrl = URL.createObjectURL(file);
      validImages.push({
        file,
        url: imageUrl,
        name: file.name,
      });
    });

    setImages((prev) => [...prev, ...validImages]);
  };

  // Remove image
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].url); // Free up memory
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form validation
    if (!setupName.trim()) return toast.error("Setup name is required");
    if (!selectedCategory) return toast.error("Please select a category");
    if (!price || price <= 0) return toast.error("Please enter a valid price");
    if (images.length === 0)
      return toast.error("Please upload at least one image");

    // Here you would normally submit the form data
    console.log({ setupName, selectedCategory, price, description, images });
    toast.success("Setup added successfully!");

    // Reset form (optional)
    setSetupName("");
    setSelectedCategory("");
    setPrice("");
    setDescription("");
    setImages([]);
  };

  return (
    <div className="max-full bg-white h-screen overflow-y-auto mx-auto p-6">
      <div className="bg-gray-100  p-6 rounded-lg">
        <h1 className="text-2xl font-semibold text-left text-gray-800 ">
          Add New Setup
        </h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col lg:flex-row gap-8"
            >
              {/* Left Column - Form Fields */}
              <div className="flex-1">
                {/* Setup Name */}
                <div className="mb-5">
                  <label
                    htmlFor="setupName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Setup Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="setupName"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter setup name"
                  />
                </div>

                {/* Category Selection */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="perHead"
                        name="category"
                        value="Per Head Packages"
                        checked={selectedCategory === "Per Head Packages"}
                        onChange={() =>
                          setSelectedCategory("Per Head Packages")
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="perHead" className="ml-2 text-gray-700">
                        Per Head Packages
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="fixedDishes"
                        name="category"
                        value="Fixed Dishes Package"
                        checked={selectedCategory === "Fixed Dishes Package"}
                        onChange={() =>
                          setSelectedCategory("Fixed Dishes Package")
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="fixedDishes"
                        className="ml-2 text-gray-700"
                      >
                        Fixed Dishes Package
                      </label>
                    </div>
                  </div>
                </div>

                {/* Price Input */}
                <div className="mb-5">
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="any"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Image Upload */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Images <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="imageUpload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG (MAX. 2MB per image)
                        </p>
                      </div>
                      <input
                        id="imageUpload"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    You can upload multiple images
                  </p>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter setup description"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Setup
                  </button>
                </div>
              </div>

              {/* Right Column - Image Previews */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">Preview</h3>

                {images.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center text-gray-500">
                    Uploaded images will appear here
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {image.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Total: {images.length} image(s)</span>
                      <button
                        type="button"
                        onClick={() => setImages([])}
                        className="text-red-500 hover:text-red-600"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSetup;
