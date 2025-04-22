import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { AlertTriangle } from "lucide-react";
import { createPlan } from "../utils/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
// import "../styles/PlanCreate.css";

const PlanCreate = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
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
    package: [],
    service: "",
  });
  const [showPackageWarning, setShowPackageWarning] = useState(false);
  const [showServiceWarning, setShowServiceWarning] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "package") {
      const updatedPackages = checked
        ? [...newPlan.package, value]
        : newPlan.package.filter((item) => item !== value);

      setNewPlan((prevState) => ({
        ...prevState,
        package: updatedPackages,
      }));
      setShowPackageWarning(true);
    } else if (name === "service") {
      setShowServiceWarning(true);
      setNewPlan((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      setNewPlan((prevState) => ({
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    setNewPlan((prevState) => ({
      ...prevState,
      image: file,
    }));
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (newPlan.package.length === 0) {
      alert("Please select at least one package option.");
      return;
    }
    if (!newPlan.service) {
      alert("Please select a service type.");
      return;
    }

    try {
      let imageUrl = "";
      if (newPlan.image) {
        const imageRef = ref(storage, `plans/${newPlan.image.name}`);
        await uploadBytes(imageRef, newPlan.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const planData = {
        ...newPlan,
        image: imageUrl,
      };

      const result = await createPlan(planData);
      if (result.success) {
        console.log("Plan created successfully:", result.data);
        navigate("/plans");
      } else {
        console.error("Failed to create plan:", result.error);
      }
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Create New Plan
          </h1>

          <form onSubmit={handleSavePlan}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left sidebar for image upload */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <label
                      htmlFor="file-upload"
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                    >
                      {selectedImage ? (
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <div className="text-blue-500 mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 mx-auto"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">
                            Upload Image
                          </span>
                          <span className="text-xs text-gray-400 block">
                            200 x 200
                          </span>
                        </div>
                      )}
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                      className="hidden"
                    />
                  </div>

                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setNewPlan((prev) => ({ ...prev, image: null }));
                      }}
                      className="flex items-center text-red-500 hover:text-red-700 text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              {/* Main form content */}
              <div className="md:col-span-2 space-y-5">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <div className="relative">
                    <select
                      name="service"
                      value={newPlan.service}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a service</option>
                      <option value="subscription">Subscription Service</option>
                      <option value="indoorCatering">
                        Indoor Catering Service
                      </option>
                      <option value="outdoorCatering">
                        Outdoor Catering Service
                      </option>
                      <option value="dining">Dining Service</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  {showServiceWarning && (
                    <div className="flex items-center mt-2 text-xs text-amber-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>
                        Warning: Service type cannot be modified after creation.
                      </span>
                    </div>
                  )}
                </div>

                {/* Plan Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="nameEnglish"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Plan Name (English)
                    </label>
                    <input
                      id="nameEnglish"
                      type="text"
                      name="nameEnglish"
                      placeholder="Enter name in English"
                      value={newPlan.nameEnglish}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="nameArabic"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Plan Name (Arabic)
                    </label>
                    <input
                      id="nameArabic"
                      type="text"
                      name="nameArabic"
                      placeholder="Enter name in Arabic"
                      value={newPlan.nameArabic}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Plan Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="descriptionEnglish"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description (English)
                    </label>
                    <textarea
                      id="descriptionEnglish"
                      name="descriptionEnglish"
                      placeholder="Enter description in English"
                      value={newPlan.descriptionEnglish}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="descriptionArabic"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description (Arabic)
                    </label>
                    <textarea
                      id="descriptionArabic"
                      name="descriptionArabic"
                      placeholder="Enter description in Arabic"
                      value={newPlan.descriptionArabic}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Plan Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Plan Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <input
                        id="isVeg"
                        type="checkbox"
                        name="isVeg"
                        checked={newPlan.isVeg}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isVeg"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Vegetarian
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="isNonVeg"
                        type="checkbox"
                        name="isNonVeg"
                        checked={newPlan.isNonVeg}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isNonVeg"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Non-Vegetarian
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="isIndividual"
                        type="checkbox"
                        name="isIndividual"
                        checked={newPlan.isIndividual}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isIndividual"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Individual Plan
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="isMultiple"
                        type="checkbox"
                        name="isMultiple"
                        checked={newPlan.isMultiple}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isMultiple"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Multiple Plan
                      </label>
                    </div>
                  </div>
                </div>

                {/* Packages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Package Selection
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["breakfast", "lunch", "dinner", "snacks"].map(
                      (option) => (
                        <div key={option} className="flex items-center">
                          <input
                            id={option}
                            type="checkbox"
                            name="package"
                            value={option}
                            checked={newPlan.package.includes(option)}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={option}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </label>
                        </div>
                      )
                    )}
                  </div>

                  {showPackageWarning && (
                    <div className="flex items-center mt-2 text-xs text-amber-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>
                        Warning: Package selection cannot be modified after
                        creation.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/plans")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlanCreate;
