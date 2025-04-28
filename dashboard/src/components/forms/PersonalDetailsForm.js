import React, { useState } from "react";

const PersonalDetailsForm = () => {
  // State Management
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    mobile: "",
    nationalId: "",
    joiningDate: "",
    fatherName: "",
    motherName: "",
    currentAddress: "",
    permanentAddress: "",
  });
  const [nationality, setNationality] = useState("");
  const [hasUpshare, setHasUpshare] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    nationalId: 0,
    profile: 0,
  });

  // Dummy nationalities data (replace with your actual data)
  const nationalities = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
  ];

  // Handle input changes
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
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white   transform transition-all duration-300 ">
        {/* Section Header */}

        <div className="mb-4">
          <h2 className="text font-semibold text-gray-900  text-left tracking-tight">
            Personal Details
          </h2>
          <p className="text-gray-400">
            {" "}
            Please complete yout profile information
          </p>
        </div>

        {/* Form Grid */}
        <div className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out "
              required
            />
          </div>

          {/* Row with Multiple Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date of Birth */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm"
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm"
                required
              />
            </div>

            {/* Nationality */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <select
                name="nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm appearance-none"
                required
              >
                <option value="">Select Nationality</option>
                {nationalities.map((nat) => (
                  <option key={nat.value} value={nat.value}>
                    {nat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* National ID Number */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID Number
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm"
                required
              />
            </div>
          </div>

          {/* File Uploads and Other Fields */}
          <div className="space-y-8">
            <></>
            {/* National ID Document */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID Document
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("nationalId", e)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 file:mr-4 file:py-2 file:px-4 file:-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-900 transition-all duration-300 shadow-sm"
                required
              />
              {uploadProgress.nationalId > 0 && (
                <div className="mt-2 text-sm text-gray-600 animate-fade-in">
                  Upload Progress: {uploadProgress.nationalId}%
                </div>
              )}
            </div>

            {/* Joining Date */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleInputChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm"
                required
              />
            </div>

            {/* Parents' Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("profile", e)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200  text-gray-800 file:mr-4 file:py-2 file:px-4 file:-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-900 transition-all duration-300 shadow-sm"
                required
              />
              {uploadProgress.profile > 0 && (
                <div className="mt-2 text-sm text-gray-600 animate-fade-in">
                  Upload Progress: {uploadProgress.profile}%
                </div>
              )}
            </div>

            {/* Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={hasUpshare}
                onChange={(e) => setHasUpshare(e.target.checked)}
                className="h-5 w-5 text-gray-800 border-gray-300  focus:ring-gray-800 transition-all duration-200"
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Has Absher Account
              </label>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Address
              </label>
              <textarea
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out  resize-none"
                required
              ></textarea>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permanent Address
              </label>
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200  text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transform transition-all duration-300 ease-in-out resize-none"
                required
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;
