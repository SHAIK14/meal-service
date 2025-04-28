import React, { useState } from "react";
import { storage } from "../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { registerDriver } from "../utils/api2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import DrivingLicenseForm from "./forms/DrivingLicenseForm";
import VehicleRegistrationDetails from "./forms/VehicleRegistrationDetials";
import PersonalDetailsForm from "./forms/PersonalDetailsForm";
import InsuranceDetails from "./forms/InsuranceDetails";
import BankAccountDetails from "./forms/BankAccountDetials";
import CriminalRecordCheck from "./forms/CriminalRecordCheck";

const DriverRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [nationality, setNationality] = useState("");
  const [hasUpshare, setHasUpshare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Complete form data state
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    mobile: "",
    nationalId: "",
    fatherName: "",
    motherName: "",
    joiningDate: "",
    currentAddress: "",
    permanentAddress: "",
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportIssuePlace: "",
    licenseNumber: "",
    licenseIssueDate: "",
    licenseExpiryDate: "",
    licenseAuthority: "",
    vehicleRegNumber: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleYear: "",
    insuranceNumber: "",
    insuranceProvider: "",
    insuranceIssueDate: "",
    insuranceExpiryDate: "",
    accountNumber: "",
    accountName: "",
    ibanNumber: "",
    bankName: "",
    bankBranch: "",
    hasCriminalRecord: "",
    criminalDetails: "",
  });

  // File state management
  const [files, setFiles] = useState({
    profile: null,
    nationalId: null,
    passport: null,
    license: null,
    rc: null,
    insurance: null,
  });

  // Additional documents state with file handling
  const [attachments, setAttachments] = useState([]);

  // Define form steps
  const steps = [
    { name: "Personal Details", component: PersonalDetailsForm },
    { name: "Driving License", component: DrivingLicenseForm },
    { name: "Vehicle Registration", component: VehicleRegistrationDetails },
    { name: "Insurance Details", component: InsuranceDetails },
    { name: "Bank Account", component: BankAccountDetails },
    { name: "Criminal Record Check", component: CriminalRecordCheck },
  ];

  // Handle form navigation
  const nextStep = () => {
    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  // Calculate progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleFileChange = (sectionName, event) => {
    const file = event.target.files[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [sectionName]: file,
      }));
      // Reset progress when new file is selected
      setUploadProgress((prev) => ({
        ...prev,
        [sectionName]: 0,
      }));
    }
  };

  const uploadFile = async (file, driverId, section) => {
    if (!file) return null;

    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${section}-${uuidv4()}.${fileExtension}`;
      const storageRef = ref(
        storage,
        `drivers/${driverId}/${section}/${fileName}`
      );

      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading ${section}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // If not on the last step, just go to next step
    if (currentStep < steps.length - 1) {
      nextStep();
      return;
    }

    // Otherwise proceed with submission
    setLoading(true);

    try {
      const driverId = `DR-${uuidv4().slice(0, 8)}`;
      const uploadedFiles = {};

      // Upload all main documents
      for (const [section, file] of Object.entries(files)) {
        if (file) {
          try {
            uploadedFiles[section] = await uploadFile(file, driverId, section);
          } catch (error) {
            console.error(`Error uploading ${section}:`, error);
            toast.error(
              `Failed to upload ${section} document. Please try again.`
            );
            setLoading(false);
            return;
          }
        }
      }

      // Upload additional documents
      const uploadedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment.file) {
            const url = await uploadFile(
              attachment.file,
              driverId,
              `additional/${attachment.type.toLowerCase().replace(/\s+/g, "-")}`
            );
            return {
              type: attachment.type,
              description: attachment.description,
              documentUrl: url,
            };
          }
          return null;
        })
      );

      // Prepare driver data matching our backend model
      const driverData = {
        driverId,
        personalDetails: {
          fullName: formData.fullName,
          dob: formData.dob,
          mobile: formData.mobile,
          nationality,
          nationalId: formData.nationalId,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          joiningDate: formData.joiningDate,
          currentAddress: formData.currentAddress,
          permanentAddress: formData.permanentAddress,
          hasUpshare,
          profilePicture: uploadedFiles.profile,
          nationalIdDocument: uploadedFiles.nationalId,
        },
        passportDetails:
          nationality !== "saudi"
            ? {
                passportNumber: formData.passportNumber,
                issueDate: formData.passportIssueDate,
                expiryDate: formData.passportExpiryDate,
                issuePlace: formData.passportIssuePlace,
                documentUrl: uploadedFiles.passport,
              }
            : undefined,
        licenseDetails: {
          licenseNumber: formData.licenseNumber,
          issueDate: formData.licenseIssueDate,
          expiryDate: formData.licenseExpiryDate,
          authority: formData.licenseAuthority,
          documentUrl: uploadedFiles.license,
        },
        vehicleDetails: {
          registrationNumber: formData.vehicleRegNumber,
          type: formData.vehicleType,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          documentUrl: uploadedFiles.rc,
        },
        insuranceDetails: {
          insuranceNumber: formData.insuranceNumber,
          provider: formData.insuranceProvider,
          issueDate: formData.insuranceIssueDate,
          expiryDate: formData.insuranceExpiryDate,
          documentUrl: uploadedFiles.insurance,
        },
        bankDetails: {
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
          ibanNumber: formData.ibanNumber,
          bankName: formData.bankName,
          branch: formData.bankBranch,
        },
        backgroundCheck: {
          hasCriminalRecord: formData.hasCriminalRecord,
          criminalDetails:
            formData.hasCriminalRecord === "yes"
              ? formData.criminalDetails
              : undefined,
        },
        additionalDocuments: uploadedAttachments.filter((doc) => doc !== null),
        status: "pending",
      };

      // Send to backend using our API
      const response = await registerDriver(driverData);

      if (response.success) {
        toast.success("Driver registered successfully!");
        // Reset form and state here
      } else {
        toast.error(response.error || "Failed to register driver");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 h-screen overflow-x-scroll">
      <div className="p-6 bg-gray-100">
        <ToastContainer />
        <h1 className="text-left text-2xl font-semibold mb-6">
          Driver Registration
        </h1>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">
              {steps[currentStep].name}
            </span>
            <span className="text-sm font-medium">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="hidden sm:flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                  index < currentStep
                    ? "bg-blue-600 border-blue-600 text-white"
                    : index === currentStep
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-300"
                }`}
              >
                {index < currentStep ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs mt-1">{step.name}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="">
          {/* Only render the current step */}
          <div className="bg-white shadow-lg p-6 mb-6">
            {currentStep === 0 && <PersonalDetailsForm />}
            {currentStep === 1 && <DrivingLicenseForm />}
            {currentStep === 2 && <VehicleRegistrationDetails />}
            {currentStep === 3 && <InsuranceDetails />}
            {currentStep === 4 && <BankAccountDetails />}
            {currentStep === 5 && <CriminalRecordCheck />}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0 || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {currentStep === steps.length - 1
                    ? "Registering..."
                    : "Saving..."}
                </div>
              ) : currentStep === steps.length - 1 ? (
                "Register Driver"
              ) : (
                "Next"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverRegistration;
