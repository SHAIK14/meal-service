import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bgImage from "../assets/BG/bg.png";
import OutDoorHeader from "../components/OutDoorHeader";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  // Get package and setup data from local storage or state management
  useEffect(() => {
    // Simulate loading data - in a real app, you'd retrieve from your state management solution
    const timer = setTimeout(() => {
      // This is where you would retrieve the selected package and setup data
      // In this example, we're using localStorage, but you might be using Redux, Context API, etc.
      const selectedPackage = JSON.parse(
        localStorage.getItem("selectedPackage")
      );
      const selectedSetup = JSON.parse(localStorage.getItem("selectedSetup"));
      const guestCount = JSON.parse(localStorage.getItem("guestCount")) || {
        adults: 20,
        children: 5,
      };
      const customNotes = localStorage.getItem("customNotes");

      // Combine all data
      setOrderData({
        package: selectedPackage,
        setup: selectedSetup,
        guests: guestCount,
        customNotes: customNotes,
      });

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!orderData) return 0;

    const packageCost =
      orderData.package.price * orderData.guests.adults +
      orderData.package.priceForKids * orderData.guests.children;

    // Setup cost is per person (only for paid setups)
    const setupCost =
      typeof orderData.setup.price === "number"
        ? orderData.setup.price *
          (orderData.guests.adults + orderData.guests.children)
        : 0;

    return packageCost + setupCost;
  };

  // Handle payment button click
  const handlePayment = () => {
    // Save confirmed order data if needed
    localStorage.setItem(
      "confirmedOrder",
      JSON.stringify({
        ...orderData,
        totalPrice: calculateTotalPrice(),
        orderDate: new Date().toISOString(),
      })
    );

    // Navigate to payment page (you would create this route)
    navigate("/outdoorCatering/packageType/perHead/confirmation/payment");
  };

  if (isLoading || !orderData) {
    return (
      <section className="min-h-screen relative py-12 px-4">
        <div className="absolute inset-0 bg-black z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center z-20 opacity-60"
          style={{ backgroundImage: `url(${bgImage})` }}
        ></div>
        <div className="relative z-30 flex items-center justify-center h-screen">
          <div className="text-[#c4a75f] text-2xl">
            Loading your order details...
          </div>
        </div>
      </section>
    );
  }

  // Render categories and items
  const renderCategory = (categoryName, items) => {
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

    return (
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white flex items-center mb-2">
          <span className="mr-2">{categoryIcons[categoryName]}</span>
          {categoryLabels[categoryName]}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-800 p-2 rounded-lg text-white">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalPrice = calculateTotalPrice();

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
          Order Confirmation
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Review your selections before proceeding to payment
        </p>

        {/* Main content */}
        <div className="bg-gray-900/90 rounded-xl p-4 md:p-6 mb-6 border border-gray-800">
          {/* Package details */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#c4a75f]">
                {orderData.package.name}
              </h2>
              <div>
                <span className="text-white">
                  {orderData.package.price} SAR{" "}
                  <span className="text-gray-400 text-sm">per adult</span>
                </span>
                <br />
                <span className="text-white">
                  {orderData.package.priceForKids} SAR{" "}
                  <span className="text-gray-400 text-sm">per child</span>
                </span>
              </div>
            </div>

            <div className="bg-gray-800/90 rounded-lg p-4 mb-4">
              <h3 className="text-white text-lg mb-3">Your Selected Items</h3>
              {Object.keys(orderData.package.selections).map((category) =>
                renderCategory(category, orderData.package.selections[category])
              )}
            </div>
          </div>

          {/* Setup details */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#c4a75f]">
                  {orderData.setup.name} Setup
                </h2>
                <p className="text-gray-400">{orderData.setup.description}</p>
              </div>
              <div className="text-white">
                {typeof orderData.setup.price === "number"
                  ? `${orderData.setup.price} SAR per person`
                  : orderData.setup.price}
              </div>
            </div>
          </div>

          {/* Guest count */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#c4a75f] mb-3">
              Guest Count
            </h2>
            <div className="bg-gray-800/90 rounded-lg p-4 flex justify-between">
              <div>
                <div className="text-white mb-2">
                  <span className="mr-2">👤</span> Adults:{" "}
                  {orderData.guests.adults}
                </div>
                <div className="text-white">
                  <span className="mr-2">👶</span> Children:{" "}
                  {orderData.guests.children}
                </div>
              </div>
              <div className="text-white">
                Total: {orderData.guests.adults + orderData.guests.children}{" "}
                guests
              </div>
            </div>
          </div>

          {/* Custom notes */}
          {orderData.customNotes && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#c4a75f] mb-3">
                Special Requests
              </h2>
              <div className="bg-gray-800/90 rounded-lg p-4">
                <p className="text-white">{orderData.customNotes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Price summary */}
        <div className="bg-gray-900/90 rounded-xl p-4 md:p-6 mb-6 border border-gray-800">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Package Total</span>
            <span className="text-white">
              {orderData.package.price * orderData.guests.adults +
                orderData.package.priceForKids * orderData.guests.children}{" "}
              SAR
            </span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-300">Setup Cost</span>
            <span className="text-white">
              {typeof orderData.setup.price === "number"
                ? `${
                    orderData.setup.price *
                    (orderData.guests.adults + orderData.guests.children)
                  } SAR`
                : orderData.setup.price}
            </span>
          </div>
          <div className="border-t border-gray-700 pt-4 flex justify-between">
            <span className="text-xl font-bold text-[#c4a75f]">Total</span>
            <span className="text-xl font-bold text-white">
              {totalPrice} SAR
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-transparent hover:bg-gray-800 cursor-pointer text-white font-medium py-3 px-6 border border-gray-600 rounded-full transition-all"
          >
            Back to Add ons
          </button>
          <button
            onClick={handlePayment}
            className="bg-[#c4a75f] hover:bg-[#c0913b] text-black font-bold py-3 px-8 rounded-full transition-all"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </section>
  );
};

export default ConfirmationPage;
