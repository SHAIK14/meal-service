import React from "react";
import bgImage from "../assets/BG/bg.png"; // adjust the path if needed
import { useNavigate } from "react-router-dom";

const PackageType = () => {
  const navigate = useNavigate();
  return (
    <section className="relative  text-white w-full h-screen overflow-y-auto flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black z-[-10]"></div>

      <div className="relative z-10 w-full max-w-md bg-black h-screen shadow-2xl flex-col   flex items-center justify-center text-white px-4">
        <div className="mb-4 lg:text-2xl font-semibold">
          <h1 className="">Choose Package Types</h1>
        </div>
        <div className="flex flex-col gap-8 font-semibold text-2xl text-center w-full  p-4">
          <button
            onClick={() => navigate("/outdoorCatering/packageType/perHead")}
            className="px-8 py-3 text-black bg-[#c4a75f] active:bg-white transition-all duration-200 hover:bg-[#c0913b] cursor-pointer "
          >
            Per Head
          </button>

          <button className="px-8 py-3 text-black bg-[#c4a75f] active:bg-white transition-all duration-200 hover:bg-[#c0913b] cursor-pointer ">
            Per Item
          </button>
        </div>
      </div>
    </section>
  );
};

export default PackageType;
