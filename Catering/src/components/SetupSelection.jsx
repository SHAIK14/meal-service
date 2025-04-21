import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenDish from "../assets/Images/GoldenDish.JPG";
import bgImage from "../assets/BG/bg.png"; // adjust the path if needed
import { useNavigate } from "react-router-dom";

// Using the existing image for demonstration (you'll replace these later)
const setupData = [
  {
    id: 1,
    name: "Luxury",
    description: "Luxury Setup Includes all the premium items and decorations",
    keyPoints: [
      { id: 1, text: "Premium tableware" },
      { id: 2, text: "Elegant decorations" },
      { id: 3, text: "High-end service staff" },
    ],
    price: 25,
    // Multiple images for carousel
    images: [GoldenDish, GoldenDish, GoldenDish, GoldenDish], // Replace with actual images later
  },

  {
    id: 2,
    name: "Standard",
    description: "Standard Setup Includes Standard Dishes and Cutlery",
    keyPoints: [
      { id: 1, text: "Silver Dishes" },
      { id: 2, text: "Standard crockery" },
      { id: 3, text: "Serving Staff" },
    ],
    price: "Complementary",
    // Multiple images for carousel
    images: [GoldenDish, GoldenDish, GoldenDish, GoldenDish], // Replace with actual images later
  },

  {
    id: 3,
    name: "Basic",
    description: "Basic Setup Includes Basic Dishes and Cutlery",
    keyPoints: [
      { id: 1, text: "Rose Gold Dishes" },
      { id: 2, text: "Normal Table & basic Decoration" },
      { id: 3, text: "Self Service" },
    ],
    price: "Complementary",
    // Multiple images for carousel
    images: [GoldenDish, GoldenDish, GoldenDish, GoldenDish], // Replace with actual images later
  },
];

// Revamped Image carousel component with sliding animation
const ImageCarousel = ({ images, price }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [dragging, setDragging] = useState(false);
  const carouselRef = useRef(null);
  const [dragStartX, setDragStartX] = useState(0);

  // Auto-slide effect - only when not being dragged
  useEffect(() => {
    if (dragging) return;

    const interval = setInterval(() => {
      setDirection(1); // Set direction to forward
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [images.length, dragging]);

  // Variants for slide animation
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  // Handle mouse down for drag start
  const handleDragStart = (e) => {
    setDragging(true);
    setDragStartX(e.clientX || (e.touches && e.touches[0].clientX) || 0);
  };

  // Handle mouse move for drag
  const handleDragMove = (e) => {
    if (!dragging) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - dragStartX;

    // Optional: Add some visual feedback during drag
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(${deltaX * 0.5}px)`;
    }
  };

  // Handle mouse up for drag end
  const handleDragEnd = (e) => {
    if (!dragging) return;

    const clientX =
      e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
    const deltaX = clientX - dragStartX;
    const threshold = 50; // Minimum drag distance to trigger slide change

    // Reset transform
    if (carouselRef.current) {
      carouselRef.current.style.transform = "";
    }

    if (deltaX < -threshold && currentIndex < images.length - 1) {
      // Dragged left - go to next slide
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else if (deltaX > threshold && currentIndex > 0) {
      // Dragged right - go to previous slide
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }

    setDragging(false);
  };

  // Navigate to a specific slide
  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleProceedToConfirmation = () => {
    // Save the selected setup to localStorage
    localStorage.setItem("selectedSetup", JSON.stringify(selectedSetup));

    // Save any custom notes
    localStorage.setItem("customNotes", customRequests);

    // Navigate to confirmation page
    navigate("/outdoorCatering/packageType/perHead/confirmation");
  };

  return (
    <div
      className="relative w-full h-48 overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onMouseMove={handleDragMove}
      onTouchMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Carousel container */}
      <div ref={carouselRef} className="w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute w-full h-full"
          >
            <img
              src={images[currentIndex]}
              alt={`Setup preview ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-60"></div>

            {/* Price tag */}
            <div className="absolute bottom-0 left-0 p-4 z-10">
              <span className="bg-[#c4a75f] text-black px-3 py-1 rounded-full text-sm font-bold">
                {typeof price === "number" ? `SAR ${price} / Person` : price}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrow navigation */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(currentIndex - 1);
          }
        }}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-1 z-20 transition-all duration-200"
        aria-label="Previous image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (currentIndex < images.length - 1) {
            setDirection(1);
            setCurrentIndex(currentIndex + 1);
          }
        }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-1 z-20 transition-all duration-200"
        aria-label="Next image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Image navigation dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? "bg-[#c4a75f] w-4"
                : "bg-white bg-opacity-60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const SetupCard = ({ setup, isSelected, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-800 flex flex-col h-full"
      data-setup-id={setup.id}
    >
      <ImageCarousel images={setup.images} price={setup.price} />

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold text-[#c4a75f] mb-2">{setup.name}</h3>
        <p className="text-gray-300 mb-4">{setup.description}</p>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(!showDetails)}
          className="text-[#c4a75f] text-sm font-medium cursor-pointer flex items-center mb-4 hover:text-[#c0913b] transition-colors duration-300"
        >
          {showDetails ? "Hide Details" : "Show More Details"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ml-1 transition-transform duration-300 ${
              showDetails ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <ul className="space-y-2 mb-4 pl-5">
                {setup.keyPoints.map((point) => (
                  <motion.li
                    key={point.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: point.id * 0.1 }}
                    className="text-gray-300 flex items-start"
                  >
                    <span className="text-[#c4a75f] mr-2">•</span>
                    {point.text}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`w-full ${
              isSelected ? "bg-[#c0913b]" : "bg-[#c4a75f]"
            } hover:bg-[#c0913b] cursor-pointer active:bg-white text-black font-bold py-3 px-4 rounded-md transition-all duration-300 shadow-lg`}
            onClick={() => onSelect(setup)}
          >
            {isSelected ? "Selected" : "Select This Setup"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const SetupSelection = () => {
  const navigate = useNavigate();
  const [customRequests, setCustomRequests] = useState("");
  const [selectedSetup, setSelectedSetup] = useState(null);

  const handleSetupSelection = (setup) => {
    setSelectedSetup(setup);
  };

  const handleProceedToConfirmation = () => {
    if (selectedSetup) {
      // Save to localStorage
      localStorage.setItem("selectedSetup", JSON.stringify(selectedSetup));
      localStorage.setItem("customNotes", customRequests);

      // Navigate to confirmation
      navigate("/outdoorCatering/packageType/perHead/confirmation");
    } else {
      // Show an error message to select a setup first
      alert("Please select a setup before proceeding");
    }
  };
  return (
    <section className="relative min-h-screen text-white py-10">
      {/* Solid Black Overlay */}
      <div className="absolute inset-0 bg-black z-0"></div>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-[1] opacity-60"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Content */}
      <div className="relative container mx-auto px-4 z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your <span className="text-[#c4a75f]">Setup</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Select the perfect setup for your outdoor catering event. Each
            option offers unique features to make your experience memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {setupData.map((setup) => (
            <SetupCard
              key={setup.id}
              setup={setup}
              isSelected={selectedSetup?.id === setup.id}
              onSelect={handleSetupSelection}
            />
          ))}
        </div>

        {/* Rest of your component */}
        <div className="mt-10 w-full flex items-center justify-center flex-col">
          <div className="w-full max-w-xl px-4 flex items-center justify-center flex-col">
            <h3 className="font-semibold text-2xl mb-4">
              Please Share any of your Custom Requests
            </h3>

            <textarea
              id="customRequests"
              placeholder="Enter your special requests here..."
              value={customRequests}
              onChange={(e) => setCustomRequests(e.target.value)}
              className="w-full h-32 p-3 border bg-gray-900 text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div className="my-4 w-full items-center flex justify-center">
            <button
              className="w-xl py-3 px-6 rounded cursor-pointer text-lg bg-[#c4a75f] hover:bg-[#c0913b] text-black font-semibold"
              onClick={handleProceedToConfirmation}
              disabled={!selectedSetup}
            >
              Proceed to Confirmation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetupSelection;
