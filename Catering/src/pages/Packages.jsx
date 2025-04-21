import React, { useState } from "react";
import bgImage from "../assets/BG/bg.png";
import OutDoorHeader from "../components/OutDoorHeader";
import SetupSelection from "../components/SetupSelection";
import { useNavigate } from "react-router-dom";

const packageData = [
  {
    id: 1,
    name: "Premium Package",
    price: 110,
    priceForKids: 55,
    categories: {
      salad: [
        "Green Salad",
        "Fattoush",
        "Chicken Ceaser Salad",
        "Protien Salad",
        "Fruite Salad",
      ],

      mainCourse: [
        "Chicken Biryani",
        "Chicken 65",
        "Mutton Masala",
        "Chicken Tikka Masala",
        "Chicken Hyderabadi ",
        "Fish Tikka",
        "Fish Masala",
        "Chicken Masala",
        "Ajwani fish Tikka",
        "Chicken Chilli",
      ],

      desserts: [
        "Gulab jamun",
        "Rass Malai",
        "Rabdi",
        "Pineappple Halwa",
        "UmmAli",
      ],
      drinks: ["Pepsi", "Coke", "Mojitos", "Tea"],
    },
    limits: {
      salad: 3,
      mainCourse: 4,
      desserts: 2,
      drinks: 2,
    },
  },

  {
    id: 2,
    name: "Standard Package",
    price: 90,
    priceForKids: 45,
    categories: {
      salad: [
        "Green Salad",
        "Fattoush",
        "Chicken Ceaser Salad",
        "Protien Salad",
        "Fruite Salad",
      ],

      mainCourse: [
        "Chicken Biryani ",
        "Chicken 65",
        "Mutton Masala",
        "Chicken Tikka Masala",
        "Chicken Hyderabadi ",
        "Fish Tikka",
        "Fish Masala",
        "Chicken Masala",
        "Ajwani fish Tikka",
        "Chicken Chilli",
      ],
      desserts: [
        "Gulab jamun",
        "Rass Malai",
        "Rabdi",
        "Pineappple Halwa",
        "UmmAli",
      ],
      drinks: ["Pepsi", "Coke", "Mojitos", "Tea"],
    },
    limits: {
      salad: 2,
      mainCourse: 3,
      desserts: 1,
      drinks: 1,
    },
  },
];

const categoryIcons = {
  salad: "🥗",
  mainCourse: "🍽️",
  desserts: "🍰",
  drinks: "🥤",
};

const categoryLabels = {
  salad: "Salads",
  mainCourse: "Main Courses",
  desserts: "Desserts",
  drinks: "Beverages",
};

const PackagesPage = () => {
  const [activePackage, setActivePackage] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selections, setSelections] = useState({
    1: { salad: [], mainCourse: [], desserts: [], drinks: [] },
    2: { salad: [], mainCourse: [], desserts: [], drinks: [] },
  });
  const navigate = useNavigate();
  const handleTogglePackage = (packageId) => {
    setActivePackage(activePackage === packageId ? null : packageId);
    setActiveCategory(null);
  };

  const handleToggleCategory = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const handleSelectItem = (item) => {
    const currentSelections = selections[activePackage][activeCategory];
    const pkg = packageData.find((p) => p.id === activePackage);
    const limit = pkg.limits[activeCategory];

    if (currentSelections.includes(item)) {
      setSelections({
        ...selections,
        [activePackage]: {
          ...selections[activePackage],
          [activeCategory]: currentSelections.filter((i) => i !== item),
        },
      });
    } else if (currentSelections.length < limit) {
      setSelections({
        ...selections,
        [activePackage]: {
          ...selections[activePackage],
          [activeCategory]: [...currentSelections, item],
        },
      });
    }
  };

  const getSelectedCount = (packageId, category) => {
    return selections[packageId][category].length;
  };

  const getProgressPercentage = (packageId, category) => {
    const pkg = packageData.find((p) => p.id === packageId);
    const limit = pkg.limits[category];
    const selected = getSelectedCount(packageId, category);
    return (selected / limit) * 100;
  };

  // Add this to your PackagesPage.js
  const handleAddToOrder = (pkg) => {
    // Save the selected package and selections to localStorage
    localStorage.setItem(
      "selectedPackage",
      JSON.stringify({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        priceForKids: pkg.priceForKids,
        selections: selections[pkg.id],
      })
    );

    // Navigate to setup selection page
    navigate("/outdoorCatering/packageType/perHead/addOns");
  };

  const renderPackageCard = (pkg) => {
    const isActive = activePackage === pkg.id;

    return (
      <div
        key={pkg.id}
        className={`rounded-xl overflow-hidden transition-all duration-300 ${
          isActive
            ? "border-2 border-[#c4a75f] shadow-lg shadow-[#c4a75f]/20"
            : "border border-gray-700 hover:border-gray-500"
        }`}
      >
        <div
          className={`cursor-pointer p-6 ${
            isActive ? "bg-gray-800/90" : "bg-gray-900/90"
          }`}
          onClick={() => handleTogglePackage(pkg.id)}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#c4a75f]">
                {pkg.name}
              </h2>
              <div className="flex flex-col sm:flex-row items-baseline gap-2">
                <div className="flex items-baseline gap-2 m-0">
                  <span className="text-white text-lg m-0 p-0 font-medium">
                    {pkg.price} SAR
                  </span>
                  <span className="text-gray-400 text-sm m-0 p-0">
                    (Kids: {pkg.priceForKids} SAR)
                  </span>
                </div>
              </div>
            </div>
            <button
              className={`mt-4 md:mt-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-[#c4a75f] text-black"
                  : "bg-transparent border border-[#c4a75f] text-[#c4a75f] hover:bg-[#c4a75f]/10"
              }`}
            >
              {isActive ? "Collapse" : "Customize"}
            </button>
          </div>
        </div>

        {isActive && (
          <div className="bg-gray-800/90 p-4">
            <div className="grid grid-cols-2 text-white sm:grid-cols-4 gap-2">
              {Object.keys(pkg.categories).map((category) => {
                const selected = getSelectedCount(pkg.id, category);
                const limit = pkg.limits[category];
                const isCategoryActive = activeCategory === category;

                return (
                  <div
                    key={category}
                    onClick={() => handleToggleCategory(category)}
                    className={`cursor-pointer text-white p-3 rounded-lg transition-all ${
                      isCategoryActive
                        ? "bg-gray-700/90"
                        : "bg-gray-900/90 hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex text-white items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">
                          {categoryIcons[category]}
                        </span>
                        <span className="font-medium">
                          {categoryLabels[category]}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {selected}/{limit}
                      </span>
                    </div>

                    <div className="mt-2 h-1 bg-gray-700 text-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c4a75f] transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(pkg.id, category)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeCategory && (
              <div className="mt-6 p-4 bg-gray-900/90 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <span className="mr-2">
                      {categoryIcons[activeCategory]}
                    </span>
                    {categoryLabels[activeCategory]}
                  </h3>
                  <span className="text-sm text-gray-400 ">
                    Select up to {pkg.limits[activeCategory]} items
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 text-white lg:grid-cols-3 gap-2">
                  {pkg.categories[activeCategory].map((item) => {
                    const isSelected =
                      selections[pkg.id][activeCategory].includes(item);
                    const isDisabled =
                      getSelectedCount(pkg.id, activeCategory) >=
                        pkg.limits[activeCategory] && !isSelected;

                    return (
                      <div
                        key={item}
                        onClick={() => !isDisabled && handleSelectItem(item)}
                        className={`p-3 rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#c4a75f] text-black"
                            : isDisabled
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-gray-800 hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item}</span>
                          {isSelected && <span className="text-black">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleAddToOrder(pkg)}
                className="bg-[#c4a75f] hover:bg-[#c0913b] text-black font-medium py-2 px-6 rounded-full transition-all"
              >
                Add to Order
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="min-h-screen relative py-12 px-4">
      {/* Black base layer */}
      <div className="absolute inset-0 bg-black z-10"></div>
      {/* Background Image with opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center z-20 opacity-60"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      {/* Content container with higher z-index */}
      <div className="relative z-30 max-w-4xl mx-auto">
        <div className="text-white mb-8">
          <OutDoorHeader />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center text-white">
          Choose Your Catering Package
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Customize your perfect dining experience
        </p>
        <div className="space-y-6">{packageData.map(renderPackageCard)}</div>
      </div>
    </section>
  );
};

export default PackagesPage;
