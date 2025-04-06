import React, { useState } from "react";

const VehicleRegistrationDetails = () => {
  const [vehicleData, setVehicleData] = useState({
    registrationNumber: "",
    vehicleType: "",
    yearModel: "",
    documents: null,
    photos: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: value,
    });
  };

  const handleDocumentUpload = (e) => {
    setVehicleData({
      ...vehicleData,
      documents: e.target.files[0],
    });
  };

  const handlePhotoUpload = (e) => {
    const newPhotos = Array.from(e.target.files);
    setVehicleData({
      ...vehicleData,
      photos: [...vehicleData.photos, ...newPhotos],
    });
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...vehicleData.photos];
    updatedPhotos.splice(index, 1);
    setVehicleData({
      ...vehicleData,
      photos: updatedPhotos,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process form submission here
    console.log("Form submitted:", vehicleData);
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold  text-gray-800">
          Vehicle Registration Details
        </h2>
        <p className="text-black/40"> Please Enter your Vehicle Detials</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Registration Number */}
          <div className="space-y-2">
            <label
              htmlFor="registrationNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Vehicle Registration Number{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="registrationNumber"
              name="registrationNumber"
              value={vehicleData.registrationNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g., AB12 CDE"
            />
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <label
              htmlFor="vehicleType"
              className="block text-sm font-medium text-gray-700"
            >
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={vehicleData.vehicleType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
          </div>

          {/* Year Model */}
          <div className="space-y-2">
            <label
              htmlFor="yearModel"
              className="block text-sm font-medium text-gray-700"
            >
              Vehicle Year Model <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="yearModel"
              name="yearModel"
              value={vehicleData.yearModel}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g., 2023"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Document Upload */}
          <div className="space-y-2">
            <label
              htmlFor="documents"
              className="block text-sm font-medium text-gray-700"
            >
              Vehicle Document Upload <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="documents"
                name="documents"
                onChange={handleDocumentUpload}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Accepted formats: PDF, JPG, JPEG, PNG
            </p>
            {vehicleData.documents && (
              <p className="text-sm text-green-600">
                Document uploaded: {vehicleData.documents.name}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label
              htmlFor="photos"
              className="block text-sm font-medium text-gray-700"
            >
              Vehicle Photos Upload
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="photos"
                name="photos"
                onChange={handlePhotoUpload}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
                accept=".jpg,.jpeg,.png"
                multiple
              />
            </div>
            <p className="text-xs text-gray-500">
              Upload multiple photos (JPG, JPEG, PNG)
            </p>
          </div>
        </div>

        {/* Photo Preview */}
        {vehicleData.photos.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              Uploaded Photos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {vehicleData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <div className="h-24 w-full bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Vehicle photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {/* <div className="pt-4">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Registration
          </button>
        </div> */}
      </form>
    </div>
  );
};

export default VehicleRegistrationDetails;
