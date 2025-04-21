import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import bgImage from "../../assets/BG/bg.png"; // adjust the path if needed
import { useNavigate } from "react-router-dom";

import OutDoorHeader from "../../components/OutDoorHeader";

const OutdoorPerHead = () => {
  const [step, setStep] = useState(1);
  const [totalMembers, setTotalMembers] = useState(30);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [partyDate, setPartyDate] = useState("");
  const [foodTime, setFoodTime] = useState("");
  const [eventType, setEventType] = useState("");
  const [foodAllergies, setFoodAllergies] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [streetName, setStreetName] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [pincode, setPincode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showMembersError, setShowMembersError] = useState(false);
  const [showMismatchError, setShowMismatchError] = useState(false);
  const [currentAllergy, setCurrentAllergy] = useState("");
  const [allergies, setAllergies] = useState([]);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [locationLink, setLocationLink] = useState("");

  // Handle total members input
  const handleTotalMembersChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setTotalMembers(value);
    if (value < 30) {
      setShowMembersError(true);
    } else {
      setShowMembersError(false);
    }
  };

  // Function to get current location (you'll need to implement browser geolocation)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationLink(
            `https://maps.google.com/maps?q=${latitude},${longitude}`
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Handle adults input
  const handleAdultsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setAdults(value);
    checkMembersMismatch(value, children);
  };

  // Handle children input
  const handleChildrenChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setChildren(value);
    checkMembersMismatch(adults, value);
  };

  // Check if adults + children equals totalMembers
  const checkMembersMismatch = (adultsVal, childrenVal) => {
    if (adultsVal + childrenVal !== totalMembers) {
      setShowMismatchError(true);
    } else {
      setShowMismatchError(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  const handleNext = () => {
    if (step === 1) {
      // Validation for step 1
      if (!eventType.trim()) {
        alert("Please enter an event type");
        return;
      }
      setStep(step + 1);
    } else if (step === 2) {
      // Validation for step 2
      if (totalMembers < 30) {
        setShowMembersError(true);
        return;
      }
      if (adults + children !== totalMembers) {
        setShowMismatchError(true);
        return;
      }
      setStep(step + 1);
    } else if (step === 3) {
      // Validation for step 3
      if (!partyDate) {
        alert("Please select a party date");
        return;
      }
      if (!foodTime) {
        alert("Please select food serving time");
        return;
      }
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleFinish = () => {
    // Validation for step 4
    if (
      !contactPerson ||
      !streetName ||
      !buildingName ||
      !pincode ||
      !phoneNumber
    ) {
      alert("Please fill all the contact information");
      return;
    }

    // Create form data object to send to the server or use elsewhere
    const formData = {
      eventType,
      foodAllergies: allergies, // Now an array of allergy tags
      totalMembers,
      adults,
      children,
      partyDate,
      foodTime,
      contactPerson,
      streetName,
      buildingName,
      pincode,
      phoneNumber,
    };

    console.log("Form data:", formData);
    alert("Form submitted successfully!");

    // Redirect using React Router
    navigate("/outdoorCatering/packageType/perHead/packages");
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <section className="min-h-screen h-screen overflow-y-auto text-white">
      <div className="bg-black w-full h-screen absolute z-[-10]"></div>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-[-10] opacity-80"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      <div className="max-w-2xl mx-auto p-6 md:p-8 bg-black rounded-xl shadow-2xl z-100 my-8 z-40">
        <div className="">
          <OutDoorHeader />
        </div>
        {/* Progress Bar */}
        <div className="relative mb-10 mt-4">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
            <div
              className="transition-all ease-in-out duration-1000 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#c4a75f]"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={`transition-all duration-500 w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNum ? "bg-[#c4a75f]" : "bg-gray-700"
                  }`}
                >
                  {step > stepNum ? "✓" : stepNum}
                </div>
                <span
                  className={`mt-2 text-xs ${
                    step === stepNum ? "text-[#c4a75f]" : "text-gray-400"
                  }`}
                >
                  {stepNum === 1 && "Event"}
                  {stepNum === 2 && "Members"}
                  {stepNum === 3 && "Date & Time"}
                  {stepNum === 4 && "Contact"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Header */}
        <h2 className="text-xl md:text-2xl font-semibold mb-8 text-center text-[#c4a75f]">
          Outdoor Catering Event Details
        </h2>

        {/* Form Content */}
        <motion.div
          key={step}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-[320px]"
        >
          {/* Step 1: Event Type */}
          {/* Step 1: Event Type */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="mb-4">
                <label className="block mb-2 font-medium text-[#c4a75f]">
                  Dietary Preferences / Allergies
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentAllergy}
                    onChange={(e) => setCurrentAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && currentAllergy.trim()) {
                        e.preventDefault();
                        if (!allergies.includes(currentAllergy.trim())) {
                          setAllergies([...allergies, currentAllergy.trim()]);
                        }
                        setCurrentAllergy("");
                      }
                    }}
                    placeholder="e.g., Peanuts, Shellfish, Gluten, Dairy"
                    className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                  />
                  <button
                    onClick={() => {
                      if (
                        currentAllergy.trim() &&
                        !allergies.includes(currentAllergy.trim())
                      ) {
                        setAllergies([...allergies, currentAllergy.trim()]);
                        setCurrentAllergy("");
                      }
                    }}
                    className="absolute right-2 top-2 px-3 py-1 bg-[#c4a75f] text-black rounded hover:bg-[#c0913b] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Type allergies and press Enter or click Add to create tags
                </p>

                {/* Display added allergies as tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center gap-2 transition-all hover:bg-gray-600"
                    >
                      <span>{allergy}</span>
                      <button
                        onClick={() => {
                          const newAllergies = [...allergies];
                          newAllergies.splice(index, 1);
                          setAllergies(newAllergies);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-[#c4a75f]">
                  Event Type
                </label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="e.g., Birthday, Wedding"
                  className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Tell us what you're celebrating
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Members */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="block mb-2 font-medium text-[#c4a75f]">
                  Total Number of Members
                </label>
                <input
                  type="number"
                  value={totalMembers}
                  onChange={handleTotalMembersChange}
                  className={`border rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300 ${
                    showMembersError ? "border-red-500" : "border-gray-700"
                  }`}
                />
                {showMembersError && (
                  <p className="text-red-500 text-sm mt-1 animate-pulse">
                    Minimum of 30 members required.
                  </p>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full">
                  <label className="block mb-2 font-medium text-[#c4a75f]">
                    Number of Adults
                  </label>
                  <input
                    type="number"
                    value={adults}
                    onChange={handleAdultsChange}
                    className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                  />
                </div>
                <div className="w-full">
                  <label className="block mb-2 font-medium text-[#c4a75f]">
                    Number of Children
                  </label>
                  <input
                    type="number"
                    value={children}
                    onChange={handleChildrenChange}
                    className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                  />
                </div>
              </div>
              {showMismatchError && (
                <p className="text-red-500 text-sm animate-pulse">
                  Members count mismatch. Adults + Children must equal{" "}
                  {totalMembers}.
                </p>
              )}
              {!showMismatchError && adults + children > 0 && (
                <p className="text-green-400 text-sm">
                  Adults ({adults}) + Children ({children}) ={" "}
                  {adults + children} of {totalMembers} members
                </p>
              )}
            </div>
          )}

          {/* Step 3: Party Date & Food Time */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="block mb-2 font-medium text-[#c4a75f]">
                  Select Party Date
                </label>
                <input
                  type="date"
                  min={getMinDate()}
                  value={partyDate}
                  onChange={(e) => setPartyDate(e.target.value)}
                  className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Date must be at least 24 hours from now
                </p>
              </div>
              <div>
                <label className="block mb-2 font-medium text-[#c4a75f]">
                  Food Serving Time
                </label>
                <input
                  type="time"
                  value={foodTime}
                  onChange={(e) => setFoodTime(e.target.value)}
                  className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Step 4: Contact Info */}
          {/* Step 4: Contact Info */}
          {step === 4 && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium mb-1">
                    Complete Address
                  </label>
                  <textarea
                    value={completeAddress}
                    onChange={(e) => setCompleteAddress(e.target.value)}
                    rows="3"
                    placeholder="Please enter your full address"
                    className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                  />
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Street Name
                    </label>
                    <input
                      type="text"
                      value={streetName}
                      onChange={(e) => setStreetName(e.target.value)}
                      className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Building Name/Number
                    </label>
                    <input
                      type="text"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="border border-gray-700 rounded-md p-3 w-full bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location Link
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={locationLink}
                      onChange={(e) => setLocationLink(e.target.value)}
                      placeholder="Google Maps link or coordinates"
                      className="border border-gray-700 rounded-md p-3 flex-1 bg-gray-800 focus:border-[#c4a75f] focus:ring-1 focus:ring-[#c4a75f] outline-none transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => getCurrentLocation()}
                      className="bg-[#c4a75f] text-black px-4 py-2 rounded-md hover:bg-[#d4b76f] transition-colors"
                    >
                      Current Location
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Share your Google Maps link or use current location
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-md transition-all duration-300 shadow-lg"
            >
              Previous
            </motion.button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="bg-[#c4a75f] hover:bg-[#c0913b] text-black font-medium py-3 px-10 rounded-md transition-all duration-300 shadow-lg"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFinish}
              className="bg-[#c4a75f] hover:bg-[#c0913b] text-black font-medium py-3 px-10 rounded-md transition-all duration-300 shadow-lg"
            >
              Submit
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
};

export default OutdoorPerHead;
