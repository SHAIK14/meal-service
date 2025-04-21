import React, { useState } from "react";
import PerHeadForms from "./PerHeadForms";
import FixedDishesForm from "./FixedDishesForm";
import { useNavigate } from "react-router-dom";

const Catering = () => {
  const navigate = useNavigate();

  const handleAddSetupClick = () => {
    navigate("/add-setup");
  };

  const perHeadCateringItems = () => {
    navigate("/perHeadCateringItems");
  };

  const fixedDishesCateringItems = () => {
    navigate("/fixedDishesCateringItems");
  };

  // State for package creation modal
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  // State for selected package type
  const [selectedPackageType, setSelectedPackageType] = useState(null);

  const [activeTab, setActiveTab] = useState("perHead");

  // Updated state to manage packages with ability to add new ones
  const [perHeadPackages, setPerHeadPackages] = useState([
    { name: "Basic Package", price: 50 },
    { name: "Standard Package", price: 50 },
    { name: "Premium Package", price: 50 },
  ]);

  const [fixedDishesPackages, setFixedDishesPackages] = useState([
    { name: "Family Feast", price: 500, guests: 10 },
    { name: "Party Platter", price: 1000, guests: 20 },
    { name: "Corporate Deal", price: 2000, guests: 50 },
  ]);

  const handleCreatePackageClick = () => {
    setIsPackageModalOpen(true);
  };

  // Handler to close modal and reset selection
  const handleCloseModal = () => {
    setIsPackageModalOpen(false);
    setSelectedPackageType(null);
  };

  // Handler to add a per head package
  const handleAddPerHeadPackage = (newPackage) => {
    setPerHeadPackages([...perHeadPackages, newPackage]);
    handleCloseModal();
  };

  // Handler to add a fixed dish package
  const handleAddFixedDishPackage = (newPackage) => {
    setFixedDishesPackages([...fixedDishesPackages, newPackage]);
    handleCloseModal();
  };

  // Render appropriate form based on selection
  const renderPackageForm = () => {
    switch (selectedPackageType) {
      case "perHead":
        return (
          <PerHeadForms
            onClose={handleCloseModal}
            onSubmit={handleAddPerHeadPackage}
          />
        );

      case "fixedDish":
        return (
          <FixedDishesForm
            onClose={handleCloseModal}
            onSubmit={handleAddFixedDishPackage}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="wrounded-full min-h-screen h-screen p-6 overflow-y-auto bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-screen py-6 bg-gray-100">
        <header className="bg-white   shadow-sm px-6 py-5 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-bold m-0 text-gray-800 text-2xl">Catering</h1>
            <div className="flex gap-4">
              <button
                onClick={handleAddSetupClick}
                className="bg-gray-200 px-5 py-2.5  hover:bg-gray-800 hover:text-white font-medium transition-all duration-200 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Add Setup
              </button>
              <button
                onClick={handleCreatePackageClick}
                className="bg-gray-200 px-5 py-2.5 -lg hover:bg-gray-800 hover:text-white font-medium transition-all duration-200 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Create Package
              </button>
            </div>
          </div>
        </header>

        <main className="bg-white -xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex ">
            <button
              className={`px-6 py-4 text-base font-medium transition-all duration-200 border-b-2 ${
                activeTab === "perHead"
                  ? "text-gray-800 border-gray-800 bg-gray-50"
                  : "text-gray-800 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("perHead")}
            >
              Per Head Packages
            </button>
            <button
              className={`px-6 py-4 text-base font-medium transition-all duration-200 border-b-2 ${
                activeTab === "fixedDishes"
                  ? "text-gray-800 border-gray-800 bg-gray-50"
                  : "text-gray-800 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("fixedDishes")}
            >
              Fixed Dishes Package
            </button>
          </div>

          {/* List Display */}
          <div className="p-6">
            {activeTab === "perHead" && (
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {perHeadPackages.map((pkg, index) => (
                    <div
                      key={index}
                      onClick={perHeadCateringItems}
                      className="bg-white border border-gray-200 -xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
                    >
                      <div className="p-5 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-gray-600 transition-colors duration-200">
                            {pkg.name}
                          </h3>
                          <div className="bg-gray-100 rounded-full p-1 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex flex-col justify-center bg-gray-100  p-3 text-center">
                            <span className="text-2xl font-bold text-gray-800">
                              {pkg.price}
                            </span>
                            <span className="text-xs text-gray-800 font-medium">
                              SAR per head
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "fixedDishes" && (
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {fixedDishesPackages.map((pkg, index) => (
                    <div
                      key={index}
                      onClick={fixedDishesCateringItems}
                      className="bg-white border border-gray-200 -xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
                    >
                      <div className="p-5 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-gray-600 transition-colors duration-200">
                            {pkg.name}
                          </h3>
                          <div className="bg-gray-100 rounded-full p-1 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col justify-center bg-gray-100 -lg p-3 text-center flex-1">
                            <span className="text-2xl font-bold text-gray-800">
                              {pkg.price}
                            </span>
                            <span className="text-xs text-gray-800 font-medium">
                              SAR
                            </span>
                          </div>
                          <div className="flex flex-col justify-center bg-gray-100 -lg p-3 text-center flex-1">
                            <span className="text-2xl font-bold text-gray-800">
                              {pkg.guests}
                            </span>
                            <span className="text-xs text-gray-800 font-medium">
                              Guests
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Package Creation Modal */}
      {isPackageModalOpen && !selectedPackageType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -xl shadow-xl wrounded-full max-w-md p-6 transform transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Select Package Type
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => setSelectedPackageType("perHead")}
                className="wrounded-full border-2 border-gray-200 text-gray-700 py-3 px-4 -lg hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                Per Head Package
              </button>
              <button
                onClick={() => setSelectedPackageType("fixedDish")}
                className="wrounded-full border-2 border-gray-200 text-gray-700 py-3 px-4 -lg hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                Fixed Dish Package
              </button>
              <button
                onClick={handleCloseModal}
                className="wrounded-full bg-gray-200 text-gray-700 py-3 px-4 -lg hover:bg-gray-300 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Form Modal */}
      {isPackageModalOpen && selectedPackageType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -xl shadow-xl wrounded-full max-w-md relative transform transition-all duration-300 ease-in-out">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-800 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            {renderPackageForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catering;
