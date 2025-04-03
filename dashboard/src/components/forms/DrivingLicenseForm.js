import React, { useState } from "react";

const DrivingLicenseForm = () => {
  const [formData, setFormData] = useState({
    licenseNumber: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    licenseDocument: "",
  });

  const [uploadProgress, setUploadProgress] = useState({
    licenseDocument: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file uploads (mock implementation)
  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress((prev) => ({ ...prev, [field]: progress }));
        if (progress >= 100) clearInterval(interval);
      }, 200);
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="p-6 ">
        <div className="mb-6">
          <h1 className="text-left text-xl font-semibold mb-0">
            {" "}
            Driving License
          </h1>
          <p className="text-gray-400 ">
            {" "}
            Please enter your driving license detials{" "}
          </p>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Number
            </label>
            <input
              type="number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out "
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                name="dob"
                value={formData.issueDate}
                onChange={handleInputChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm"
                required
              />
            </div>
            <div className="relative flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="dob"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuing Authority
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.issuingAuthority}
              onChange={handleInputChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out "
              required
            />
          </div>

          {/* National ID Document */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              license Document
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange("nationalId", e)}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 file:mr-4 file:py-2 file:px-4 file:-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-900 transition-all duration-300 shadow-sm"
              required
            />
            {uploadProgress.licenseDocument > 0 && (
              <div className="mt-2 text-sm text-gray-600 animate-fade-in">
                Upload Progress: {uploadProgress.licenseDocument}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrivingLicenseForm;
