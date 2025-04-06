import React, { useState } from "react";

const InsuranceDetails = () => {
  const [insuranceData, setInsuranceData] = useState({
    insuranceNumber: "",
    insuranceProvider: "",
    issueDate: "",
    expireDate: "",
    insuranceDocument: null,
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInsuranceData({
      ...insuranceData,
      [name]: value,
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setInsuranceData({
        ...insuranceData,
        insuranceDocument: e.target.files[0],
      });

      // Clear document error if it exists
      if (formErrors.insuranceDocument) {
        setFormErrors({
          ...formErrors,
          insuranceDocument: "",
        });
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!insuranceData.insuranceNumber.trim()) {
      errors.insuranceNumber = "Insurance number is required";
    }

    if (!insuranceData.insuranceProvider.trim()) {
      errors.insuranceProvider = "Insurance provider is required";
    }

    if (!insuranceData.issueDate) {
      errors.issueDate = "Issue date is required";
    }

    if (!insuranceData.expireDate) {
      errors.expireDate = "Expiry date is required";
    } else if (
      new Date(insuranceData.expireDate) <= new Date(insuranceData.issueDate)
    ) {
      errors.expireDate = "Expiry date must be after issue date";
    }

    if (!insuranceData.insuranceDocument) {
      errors.insuranceDocument = "Insurance document is required";
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Process form submission
    console.log("Form submitted:", insuranceData);
    // Here you would typically send the data to your backend
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Insurance Details
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Insurance Number */}
        <div className="space-y-1">
          <label
            htmlFor="insuranceNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Insurance Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="insuranceNumber"
            name="insuranceNumber"
            value={insuranceData.insuranceNumber}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.insuranceNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter insurance number"
          />
          {formErrors.insuranceNumber && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.insuranceNumber}
            </p>
          )}
        </div>

        {/* Insurance Provider */}
        <div className="space-y-1">
          <label
            htmlFor="insuranceProvider"
            className="block text-sm font-medium text-gray-700"
          >
            Insurance Provider <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="insuranceProvider"
            name="insuranceProvider"
            value={insuranceData.insuranceProvider}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.insuranceProvider
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter insurance provider name"
          />
          {formErrors.insuranceProvider && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.insuranceProvider}
            </p>
          )}
        </div>

        {/* Date Fields - in a flex container for desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Issue Date */}
          <div className="space-y-1">
            <label
              htmlFor="issueDate"
              className="block text-sm font-medium text-gray-700"
            >
              Issue Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="issueDate"
              name="issueDate"
              value={insuranceData.issueDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.issueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.issueDate && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.issueDate}
              </p>
            )}
          </div>

          {/* Expire Date */}
          <div className="space-y-1">
            <label
              htmlFor="expireDate"
              className="block text-sm font-medium text-gray-700"
            >
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="expireDate"
              name="expireDate"
              value={insuranceData.expireDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.expireDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.expireDate && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.expireDate}
              </p>
            )}
          </div>
        </div>

        {/* Insurance Document Upload */}
        <div className="space-y-1">
          <label
            htmlFor="insuranceDocument"
            className="block text-sm font-medium text-gray-700"
          >
            Insurance Document Upload <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="insuranceDocument"
            name="insuranceDocument"
            onChange={handleFileChange}
            className={`block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 ${
                formErrors.insuranceDocument
                  ? "border border-red-500 rounded-md"
                  : ""
              }`}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, JPG, JPEG, PNG
          </p>
          {insuranceData.insuranceDocument && (
            <p className="text-sm text-green-600 mt-1">
              File selected: {insuranceData.insuranceDocument.name}
            </p>
          )}
          {formErrors.insuranceDocument && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.insuranceDocument}
            </p>
          )}
        </div>

        {/* Submit Button */}
        {/* <div className="pt-4">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
          >
            Submit Insurance Details
          </button>
        </div> */}
      </form>
    </div>
  );
};

export default InsuranceDetails;
