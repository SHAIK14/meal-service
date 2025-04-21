import React, { useState } from "react";
import { motion } from "framer-motion";
import bgImage from "../assets/BG/bg.png";
import { useNavigate } from "react-router-dom";

const AddOns = () => {
  const navigate = useNavigate();

  // Sample add-ons data - replace with your actual data
  const [addOnsData, setAddOnsData] = useState([
    {
      id: 1,
      name: "Live Chat",
      description:
        "Mouth Watering and tempting Live Chat counter at the Event.",
      price: 109.99,
      image: "https://i.ytimg.com/vi/-TnF5yhdSDs/maxresdefault.jpg",
      isAdded: false,
    },
    {
      id: 2,
      name: "Live Pani Puri",
      description: "Live Pani Puri counter with a variety of fillings.",
      price: 189.99,
      image:
        "https://www.foodline.sg/PageImage/Caterer/Riverwalk-Tandoor/83121_large.webp",
      isAdded: false,
    },
    {
      id: 3,
      name: "Live BBQ",
      description:
        "Same-day professional installation service with priority scheduling.",
      price: 149.99,
      image:
        "https://lh6.googleusercontent.com/proxy/C_tJYiQ73cb2HAafZXKcFF3DxJzQIPf95uBtPaLlqfh7kJk2smvNvcwkxWwJ58jBcy25fDDx7kxVTDEaZdB_8EV64H2AwPYSubuVhB5MAIQm6Ugnmx_mBg",
      isAdded: false,
    },
    {
      id: 4,
      name: "Live Tandoor Counter",
      description: "Live Tandoor counter with a variety of Tandoori Items.",
      price: 149.99,
      image:
        "https://www.riverwalktandoor.com/public/assets/images/chinese/1739341978XuDoMOssRM1621240654.jpg",
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

  // Function to handle the confirmation and navigation
  const handleConfirm = () => {
    navigate("/outdoorCatering/packageType/perHead/confirmation");
  };

  return (
    <section className="relative min-h-screen py-16 px-4 overflow-hidden bg-black">
      {/* Background Image on top of black background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80 z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Content layer on top of everything */}
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
              className="bg-gray-900 bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
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
                {/* Name in bold letters directly under the photo */}
                <h3 className="font-bold text-2xl text-white mb-3">
                  {addon.name}
                </h3>

                {/* Description under the name */}
                <p className="text-gray-300 mb-6 text-sm">
                  {addon.description}
                </p>

                <motion.button
                  onClick={() => handleAddAddon(addon.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    addon.isAdded
                      ? "bg-green-500 text-black"
                      : "bg-[#c4a75f] text-black"
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
        <div className="w-full  flex items-center justify-center  ">
          {/* Confirm button now placed at the top */}
          <motion.button
            onClick={handleConfirm}
            className="bg-[#c4a75f] mt-8 rounded cursor-pointer font-semibold px-10 py-3 text-xl text-black hover:bg-[#d4b76f]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Confirm Selection
          </motion.button>
        </div>
      </div>

      {/* Removed the bottom confirm button since it's now at the top */}
    </section>
  );
};

export default AddOns;
