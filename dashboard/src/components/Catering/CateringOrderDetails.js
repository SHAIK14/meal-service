import React from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Package,
  MenuSquare,
  FileText,
  CreditCard,
} from "lucide-react";

const CateringOrderDetails = ({ order }) => {
  // Mock data for demonstration
  const orderDetails = {
    packageName: "Premium Package",
    packagePrice: {
      adults: "110 SAR",
      kids: "55 SAR",
    },
    menu: {
      salads: ["Arabic Salad", "Caesar Salad", "Cucumber Yogurt Salad"],
      mainCourse: [
        "Chicken Biryani",
        "Mixed Grill",
        "Butter Chicken",
        "Lamb Mandi",
      ],
      sweets: ["Kunafa", "Basbousa", "Umm Ali", "Baklava"],
      drinks: ["Pepsi", "Mojito", "Tea", "Coffee"],
    },
    eventDate: "2025-05-15",
    pickupTime: "18:30",
    setupChosen: "Premium Setup",
    additionalNotes:
      "Cutlery should be plastic and extra spicy food for Indians",
    guests: {
      adults: 45,
      children: 10,
    },
    totalPrice: "5,600 SAR",
  };

  const MenuSection = ({ title, items, icon }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-lg font-semibold ml-2">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  const InfoItem = ({ label, value, icon }) => (
    <div className="flex items-center mb-2">
      <div className="text-primary-600 mr-2">{icon}</div>
      <div>
        <span className="font-medium text-gray-700">{label}:</span>{" "}
        <span className="text-gray-800">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Customer & Event Details */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Customer Information
            </h2>
            <InfoItem
              icon={<User size={18} className="text-blue-600" />}
              label="Name"
              value={order?.customerName || "N/A"}
            />
            <InfoItem
              icon={<Phone size={18} className="text-blue-600" />}
              label="Phone"
              value={order?.phoneNumber || "N/A"}
            />
            <InfoItem
              icon={<Calendar size={18} className="text-blue-600" />}
              label="Order Date"
              value={order?.orderDate || "N/A"}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Event Details
            </h2>
            <InfoItem
              icon={<Calendar size={18} className="text-green-600" />}
              label="Date"
              value={orderDetails.eventDate}
            />
            <InfoItem
              icon={<Clock size={18} className="text-green-600" />}
              label="Pickup Time"
              value={orderDetails.pickupTime}
            />
            <InfoItem
              icon={<Package size={18} className="text-green-600" />}
              label="Setup Type"
              value={orderDetails.setupChosen}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Package Details
            </h2>
            <InfoItem
              icon={<Package size={18} className="text-purple-600" />}
              label="Package"
              value={orderDetails.packageName}
            />
            <div className="ml-6 mt-2">
              <div className="text-sm text-gray-600 mb-1">
                Adults: {orderDetails.packagePrice.adults} ×{" "}
                {orderDetails.guests.adults} guests
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Children: {orderDetails.packagePrice.kids} ×{" "}
                {orderDetails.guests.children} guests
              </div>
            </div>
            <div className="border-t pt-3 mt-2">
              <InfoItem
                icon={<CreditCard size={18} className="text-purple-600" />}
                label="Total"
                value={orderDetails.totalPrice}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Menu & Notes */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              <div className="flex items-center">
                <MenuSquare size={20} className="text-red-600 mr-2" />
                Menu Selection
              </div>
            </h2>

            <MenuSection
              title="Salads"
              items={orderDetails.menu.salads}
              icon={
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  S
                </div>
              }
            />

            <MenuSection
              title="Main Course"
              items={orderDetails.menu.mainCourse}
              icon={
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                  M
                </div>
              }
            />

            <MenuSection
              title="Sweets"
              items={orderDetails.menu.sweets}
              icon={
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-700">
                  S
                </div>
              }
            />

            <MenuSection
              title="Drinks"
              items={orderDetails.menu.drinks}
              icon={
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  D
                </div>
              }
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              <div className="flex items-center">
                <FileText size={20} className="text-indigo-600 mr-2" />
                Additional Notes
              </div>
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 italic text-gray-700">
              {orderDetails.additionalNotes}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CateringOrderDetails;
