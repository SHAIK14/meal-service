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
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);

    // Simulating an API call or processing delay
    setTimeout(() => {
      setIsSaving(false);
      alert("Plan saved successfully!"); // Replace this with actual save logic
    }, 2000);
  };

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
    <div className="p-8 w-full h-screen ">
      <form onSubmit={handleSavePlan} className="bg-white p-8 min-w-[600px]  ">
        <h1 className="font-semibold text-2xl">Create New Plan </h1>
        <div className="flex gap-4  h-full w-full flex-1">
          <div className=" h-full">
            <div className="relative w-60 h-60 rounded-lg border-dashed border-medium flex items-center justify-center overflow-hidden">
              <label
                htmlFor="file-upload"
                className={`w-full h-full flex items-center justify-center ${
                  selectedImage ? "cursor-pointer" : "text-center"
                }`}
              >
                {selectedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={selectedImage}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                    {/* Delete Icon on Hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setNewPlan((prevState) => ({
                            ...prevState,
                            image: null,
                          }));
                        }}
                        className="bg-red-500 p-2 rounded-full text-white"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ) : (
                  "Upload Photo 200x200"
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                required
                style={{ display: "none" }}
              />
            </div>
            <div className=" mt-4">
              <div class="relative overflow-hidden w-full">
                <select
                  name="service"
                  value={newPlan.service}
                  onChange={handleInputChange}
                  required
                  class=" font-semibold w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer transition-all duration-300  mb-2 focus:outline-none"
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
              </div>
              <div>
                <div className="flex flex-col gap-2">
                  <label className="">Package Selection:</label>
                  <div className="gap-2 flex flex-col">
                    {["breakfast", "lunch", "dinner", "snacks"].map(
                      (option) => (
                        <label key={option} className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            name="package"
                            value={option}
                            checked={newPlan.package.includes(option)}
                            onChange={handleInputChange}
                            className="w-4 h-4 border-solid border-8"
                          />
                          <span>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            {showServiceWarning && (
              <div className="flex text-sm items-center   text-red-500 gap-1 font-semibold">
                <AlertTriangle size={16} color="red" />
                <span className="">
                  Warning: Service type cannot be modified after creation.
                </span>
              </div>
            )}
          </div>

          <div className="names flex-1 flex flex-col  ">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  name="nameEnglish"
                  placeholder="Plan Name (English)"
                  value={newPlan.nameEnglish}
                  onChange={handleInputChange}
                  required
                  className="admin-input"
                />
                <input
                  type="text"
                  name="nameArabic"
                  placeholder="Plan Name (Arabic)"
                  value={newPlan.nameArabic}
                  onChange={handleInputChange}
                  required
                  className="admin-input"
                />
              </div>
              <div className="flex flex-col gap-4">
                <textarea
                  name="descriptionEnglish"
                  placeholder="Plan Description (English)"
                  value={newPlan.descriptionEnglish}
                  onChange={handleInputChange}
                  required
                  className="admin-textarea"
                />
                <textarea
                  name="descriptionArabic"
                  placeholder="Plan Description (Arabic)"
                  value={newPlan.descriptionArabic}
                  onChange={handleInputChange}
                  required
                  className="admin-textarea"
                />
              </div>
              <div className="flex  gap-2 w-full p-2 justify-between items-left ">
                <label className=" items-center cursor-pointer flex gap-2">
                  <input
                    type="checkbox"
                    name="isVeg"
                    checked={newPlan.isVeg}
                    onChange={handleInputChange}
                    className="w-4 h-4 border-solid border-8"
                  />
                  <span>Veg-plan</span>
                </label>
                <label className=" items-center cursor-pointer flex gap-2">
                  <input
                    type="checkbox"
                    name="isNonVeg"
                    checked={newPlan.isNonVeg}
                    onChange={handleInputChange}
                    className="w-4 h-4 border-solid border-8"
                  />
                  <span>Non-Veg plan</span>
                </label>
                <label className=" items-center flex cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    name="isIndividual"
                    checked={newPlan.isIndividual}
                    onChange={handleInputChange}
                    className="w-4 h-4 border-solid border-8"
                  />
                  <span>Individual Plan</span>
                </label>
                <label className=" items-center flex cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    name="isMultiple"
                    checked={newPlan.isMultiple}
                    onChange={handleInputChange}
                    className="w-4 h-4 border-solid border-8"
                  />
                  <span>Multiple Plan</span>
                </label>
              </div>
              {showPackageWarning && (
                <div className="flex items-center text-sm text-red-500 gap- font-semibold">
                  <AlertTriangle size={16} />
                  <span>
                    Warning: Package selection cannot be modified after
                    creation.
                  </span>
                </div>
              )}
            </div>

            <div className="plan select "></div>
            <div className="buttons flex gap-8  items-right justify-end">
              <button
                type="button"
                className="px-8 py-2 text-white hover:bg-red-600  bg-red-500"
                onClick={() => navigate("/plans")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2 text-white hover:bg-green-600 bg-green-500 disabled:opacity-50"
                onClick={handleSave}
                disabled={isSaving} // Disable button while saving
              >
                {isSaving ? "Saving..." : "Save Plan"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlanCreate;
