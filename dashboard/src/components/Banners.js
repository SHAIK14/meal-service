import React, { useState } from "react";

const AdBanners = () => {
  const [banners, setBanners] = useState({
    dynamicBanners: [],
    loginPageAd: null,
    customerInfoPageAd: null,
    optScreenPageAd: null,
  });

  // Handle dynamic banner upload field addition
  const handleAddBannerField = () => {
    setBanners((prevState) => ({
      ...prevState,
      dynamicBanners: [...prevState.dynamicBanners, null],
    }));
  };

  // Handle image upload for dynamic banners
  const handleFileChange = (e, index, type) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a URL for the image preview
      if (type === "dynamic") {
        const updatedDynamicBanners = [...banners.dynamicBanners];
        updatedDynamicBanners[index] = { file, url: imageUrl };
        setBanners((prevState) => ({
          ...prevState,
          dynamicBanners: updatedDynamicBanners,
        }));
      } else {
        setBanners((prevState) => ({
          ...prevState,
          [type]: { file, url: imageUrl },
        }));
      }
    }
  };

  // Handle deleting an image for dynamic banners
  const handleDeleteBanner = (index) => {
    const updatedDynamicBanners = [...banners.dynamicBanners];
    updatedDynamicBanners[index] = null;
    setBanners((prevState) => ({
      ...prevState,
      dynamicBanners: updatedDynamicBanners,
    }));
  };

  // Save all banners
  const handleSave = () => {
    // Logic to save all banners
    console.log("All banners saved:", banners);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-semibold text-gray-800 text-center">
        Ad Banners
      </h1>

      {/* Add Dynamic Banner Button */}
      <div className="text-center">
        <button
          onClick={handleAddBannerField}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-200"
        >
          Add Banner
        </button>
      </div>

      {/* Dynamic Banner Fields */}
      <div className="grid grid-cols-1 gap-6">
        {banners.dynamicBanners.map((banner, index) => (
          <div
            key={index}
            className="relative rounded-lg border border-gray-300 bg-gray-50 p-4 hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            {banner ? (
              <img
                src={banner.url}
                alt={`Banner ${index + 1}`}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            ) : (
              <label className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md cursor-pointer hover:bg-gray-100 transition-all duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index, "dynamic")}
                  className="opacity-0 w-0 h-0"
                />
                <span className="text-gray-600">Upload Banner (16:9)</span>
              </label>
            )}

            {banner && (
              <button
                onClick={() => handleDeleteBanner(index)}
                className="absolute top-2 right-2 bg-red-600 text-white py-1 px-3 rounded-md text-sm shadow-md hover:bg-red-700 transition-all duration-200"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Login Page Ad Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Login Page Ad</h2>
        <div className="relative rounded-lg border border-gray-300 bg-gray-50 p-4 hover:shadow-xl transition-all duration-300 ease-in-out">
          {banners.loginPageAd ? (
            <img
              src={banners.loginPageAd.url}
              alt="Login Page Ad"
              className="w-full h-40 object-cover rounded-md mb-4"
            />
          ) : (
            <label className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md cursor-pointer hover:bg-gray-100 transition-all duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, null, "loginPageAd")}
                className="opacity-0 w-0 h-0"
              />
              <span className="text-gray-600">
                Upload Login Page Ad (16:9 Portrait)
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Customer Info Page Ad Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">
          Customer Info Page Ad
        </h2>
        <div className="relative rounded-lg border border-gray-300 bg-gray-50 p-4 hover:shadow-xl transition-all duration-300 ease-in-out">
          {banners.customerInfoPageAd ? (
            <img
              src={banners.customerInfoPageAd.url}
              alt="Customer Info Page Ad"
              className="w-full h-40 object-cover rounded-md mb-4"
            />
          ) : (
            <label className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md cursor-pointer hover:bg-gray-100 transition-all duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e, null, "customerInfoPageAd")
                }
                className="opacity-0 w-0 h-0"
              />
              <span className="text-gray-600">
                Upload Customer Info Page Ad (16:9 Portrait)
              </span>
            </label>
          )}
        </div>
      </div>

      {/* OPT Screen Page Ad Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">
          OPT Screen Page Ad
        </h2>
        <div className="relative rounded-lg border border-gray-300 bg-gray-50 p-4 hover:shadow-xl transition-all duration-300 ease-in-out">
          {banners.optScreenPageAd ? (
            <img
              src={banners.optScreenPageAd.url}
              alt="OPT Screen Page Ad"
              className="w-full h-40 object-cover rounded-md mb-4"
            />
          ) : (
            <label className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md cursor-pointer hover:bg-gray-100 transition-all duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, null, "optScreenPageAd")}
                className="opacity-0 w-0 h-0"
              />
              <span className="text-gray-600">
                Upload OPT Screen Page Ad (16:9 Portrait)
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-all duration-200"
        >
          Save All Banners
        </button>
      </div>
    </div>
  );
};

export default AdBanners;
