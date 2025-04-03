import React, { useState } from "react";
import PerHeadForms from "./PerHeadForms";
import FixedDishesForm from "./FixedDishesForm";
import { useNavigate } from "react-router-dom";

const Catering = () => {
  const navigate = useNavigate();

  const handleAddSetupClick = () => {
    navigate("/add-setup");
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
    <div className="w-full p-6 bg-white h-screen overflow-auto">
      <div className="w-full h-screen bg-gray-100">
        <header className="w-full p-6">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-black text-2xl">Catering</h1>
            <div className="flex gap-8">
              <button
                onClick={handleAddSetupClick}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-green-500 hover:text-white font-semibold transition-all ease-in-out duration-300"
              >
                Add Setup
              </button>
              <button
                onClick={handleCreatePackageClick}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-green-500 hover:text-white font-semibold transition-all ease-in-out duration-300"
              >
                Create Package
              </button>
            </div>
          </div>
        </header>
        {/* Package Creation Modal */}
        {isPackageModalOpen && !selectedPackageType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Select Package Type
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedPackageType("perHead")}
                  className="w-full border-2  text-gray-800 py-3 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Per Head Package
                </button>
                <button
                  onClick={() => setSelectedPackageType("fixedDish")}
                  className="w-full border-2  text-gray-800 py-3 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Fixed Dish Package
                </button>
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Package Form Modal */}
        {isPackageModalOpen && selectedPackageType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
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
        <main className="w-full h-full p-6">
          {/* Tabs */}
          <div className="flex gap-8 mb-6">
            <button
              className={`text-lg font-semibold p-2 ${
                activeTab === "perHead"
                  ? "text-gray-800 bg-gray-200 p-2"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("perHead")}
            >
              Per Head Packages
            </button>
            <button
              className={`text-lg font-semibold p-2 ${
                activeTab === "fixedDishes"
                  ? "text-gray-800 bg-gray-200 p-2"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("fixedDishes")}
            >
              Fixed Dishes Package
            </button>
          </div>
          {/* List Display */}
          {activeTab === "perHead" && (
            <div className="bg-white h-[600px] max-h-[400px] overflow-y-scroll">
              <ul className="bg-white p-8 grid gap-4 grid-cols-2">
                {perHeadPackages.map((pkg, index) => (
                  <li
                    key={index}
                    className="p-4 border rounded-lg shadow-sm  flex justify-between items-center"
                  >
                    <span className="font-semibold">{pkg.name}</span>
                    <p className="text-sm flex flex-col bg-gray-100 w-16 h-16 justify-center items-center rounded-2xl">
                      <span className="font-semibold text-2xl">
                        {pkg.price}
                      </span>{" "}
                      SAR
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "fixedDishes" && (
            <div className="bg-white h-[600px] max-h-[400px] overflow-y-scroll">
              <ul className="bg-white p-8 grid gap-4 grid-cols-2">
                {fixedDishesPackages.map((pkg, index) => (
                  <li
                    key={index}
                    className="p-4 border rounded-lg shadow-sm flex justify-between items-center font-semibold"
                  >
                    <span>{pkg.name}</span>
                    <div className="flex gap-4">
                      <p className="text-sm flex font-normal flex-col items-center bg-gray-100 rounded-2xl h-16 w-16 justify-center">
                        <span className="font-semibold text-2xl">
                          {pkg.price}
                        </span>
                        SAR
                      </p>
                      <p className="text-sm flex flex-col font-normal items-center w-16 h-16 bg-gray-100 rounded-2xl justify-center">
                        <span className="font-semibold text-2xl">
                          {pkg.guests}
                        </span>
                        Guests
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catering;
