import React, { useState } from "react";
import { motion } from "framer-motion";

const AddOns = ({ bgImage = "/api/placeholder/1920/1080" }) => {
  // Sample add-ons data - replace with your actual data
  const [addOnsData, setAddOnsData] = useState([
    {
      id: 1,
      name: "Premium Cleaning Kit",
      description:
        "Professional grade cleaning solutions with microfiber cloths and special brushes.",
      price: 109.99,
      image: "/api/placeholder/400/300",
      isAdded: false,
    },
    {
      id: 2,
      name: "Extended Warranty",
      description:
        "Additional 2 years of coverage for parts and labor on your purchase.",
      price: 189.99,
      image: "/api/placeholder/400/300",
      isAdded: false,
    },
    {
      id: 3,
      name: "Express Installation",
      description:
        "Same-day professional installation service with priority scheduling.",
      price: 299.99,
      image: "/api/placeholder/400/300",
      isAdded: false,
    },
    {
      id: 4,
      name: "Smart Home Integration",
      description:
        "Connect your new product to your existing smart home ecosystem.",
      price: 149.99,
      image: "/api/placeholder/400/300",
      isAdded: false,
    },
  ]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.5 },
    },
  };

  const headerVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.1,
      },
    },
  };

  // Function to handle adding an add-on
  const handleAddAddon = (id) => {
    setAddOnsData(
      addOnsData.map((addon) =>
        addon.id === id ? { ...addon, isAdded: !addon.isAdded } : addon
      )
    );
  };

  return (
    <section className="relative min-h-screen py-16 px-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80 z-[-20]"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black opacity-70 z-[-10]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Framer Motion animations */}
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <h2 className="text-4xl font-bold mb-4 text-white">
            Premium Add-Ons
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Elevate your experience with our carefully selected premium add-ons.
            Each item has been designed to complement and enhance your purchase.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {addOnsData.map((addon) => (
            <motion.div
              key={addon.id}
              className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={addon.image}
                  alt={addon.name}
                  className="w-full h-full object-cover"
                  variants={imageVariants}
                />
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white font-medium px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {addon.price.toFixed(2)} SAR
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-xl text-white mb-2">
                  {addon.name}
                </h3>

                <p className="text-gray-300 mb-6 text-sm">
                  {addon.description}
                </p>

                <motion.button
                  onClick={() => handleAddAddon(addon.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    addon.isAdded
                      ? "bg-green-500 text-white"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {addon.isAdded ? "Added to Cart" : "Add to Cart"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AddOns;
