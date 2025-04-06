import React, { useState } from "react";

const BankAccountDetails = () => {
  const [bankData, setBankData] = useState({
    accountNumber: "",
    accountHolderName: "",
    ibanNumber: "",
    bankName: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankData({
      ...bankData,
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

  const validateForm = () => {
    const errors = {};

    if (!bankData.accountNumber.trim()) {
      errors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(bankData.accountNumber)) {
      errors.accountNumber = "Account number should contain only digits";
    }

    if (!bankData.accountHolderName.trim()) {
      errors.accountHolderName = "Account holder name is required";
    }

    if (!bankData.ibanNumber.trim()) {
      errors.ibanNumber = "IBAN number is required";
    } else if (!/^[A-Z]{2}[0-9A-Z]{10,30}$/.test(bankData.ibanNumber)) {
      errors.ibanNumber = "Please enter a valid IBAN format";
    }

    if (!bankData.bankName.trim()) {
      errors.bankName = "Bank name is required";
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
    console.log("Form submitted:", bankData);
    // Here you would typically send data to your backend
  };

  return (
    <div className="max-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold  text-gray-800">
          Bank Account Details
        </h2>
        <p className="text-black/60">Please enter your bank account details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Account Number */}
          <div className="space-y-1">
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={bankData.accountNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.accountNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your account number"
            />
            {formErrors.accountNumber && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.accountNumber}
              </p>
            )}
          </div>

          {/* Account Holder Name */}
          <div className="space-y-1">
            <label
              htmlFor="accountHolderName"
              className="block text-sm font-medium text-gray-700"
            >
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountHolderName"
              name="accountHolderName"
              value={bankData.accountHolderName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.accountHolderName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter account holder's full name"
            />
            {formErrors.accountHolderName && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.accountHolderName}
              </p>
            )}
          </div>
        </div>

        {/* IBAN Number */}
        <div className="space-y-1">
          <label
            htmlFor="ibanNumber"
            className="block text-sm font-medium text-gray-700"
          >
            IBAN Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="ibanNumber"
            name="ibanNumber"
            value={bankData.ibanNumber}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.ibanNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., GB29NWBK60161331926819"
            autoComplete="off"
          />
          {formErrors.ibanNumber && (
            <p className="text-red-500 text-xs mt-1">{formErrors.ibanNumber}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            International Bank Account Number format: Country code (2 letters)
            followed by numbers and letters
          </p>
        </div>

        {/* Bank Name */}
        <div className="space-y-1">
          <label
            htmlFor="bankName"
            className="block text-sm font-medium text-gray-700"
          >
            Bank Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="bankName"
            name="bankName"
            value={bankData.bankName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.bankName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter bank name"
          />
          {formErrors.bankName && (
            <p className="text-red-500 text-xs mt-1">{formErrors.bankName}</p>
          )}
        </div>

        {/* Submit Button */}
        {/* <div className="pt-4">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
          >
            Save Bank Details
          </button>
        </div> */}
      </form>
    </div>
  );
};

export default BankAccountDetails;
