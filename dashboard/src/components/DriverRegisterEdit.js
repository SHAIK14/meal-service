import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storage } from "../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { getDriverById, updateDriver } from "../utils/api2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "../styles/DriverRegistration.css";

const SectionCard = ({ title, children }) => (
  <div className="section-card">
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
    </div>
    <div className="section-content">{children}</div>
  </div>
);

const DriverRegisterEdit = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();

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

  // State for existing files/documents
  const [existingFiles, setExistingFiles] = useState({
    profile: null,
    nationalId: null,
    passport: null,
    license: null,
    rc: null,
    insurance: null,
  });

  // State for new files to be uploaded
  const [files, setFiles] = useState({
    profile: null,
    nationalId: null,
    passport: null,
    license: null,
    rc: null,
    insurance: null,
  });

  // Additional documents state
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await getDriverById(driverId);
        if (response.success) {
          const driver = response.data;

          // Set form data
          setFormData({
            fullName: driver.personalDetails.fullName,
            dob: new Date(driver.personalDetails.dob)
              .toISOString()
              .split("T")[0],
            mobile: driver.personalDetails.mobile,
            nationalId: driver.personalDetails.nationalId,
            fatherName: driver.personalDetails.fatherName,
            motherName: driver.personalDetails.motherName,
            joiningDate: new Date(driver.personalDetails.joiningDate)
              .toISOString()
              .split("T")[0],
            currentAddress: driver.personalDetails.currentAddress,
            permanentAddress: driver.personalDetails.permanentAddress,
            // Passport details
            passportNumber: driver.passportDetails?.passportNumber || "",
            passportIssueDate: driver.passportDetails?.issueDate
              ? new Date(driver.passportDetails.issueDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            passportExpiryDate: driver.passportDetails?.expiryDate
              ? new Date(driver.passportDetails.expiryDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            passportIssuePlace: driver.passportDetails?.issuePlace || "",
            // License details
            licenseNumber: driver.licenseDetails.licenseNumber,
            licenseIssueDate: new Date(driver.licenseDetails.issueDate)
              .toISOString()
              .split("T")[0],
            licenseExpiryDate: new Date(driver.licenseDetails.expiryDate)
              .toISOString()
              .split("T")[0],
            licenseAuthority: driver.licenseDetails.authority,
            // Vehicle details
            vehicleRegNumber: driver.vehicleDetails.registrationNumber,
            vehicleType: driver.vehicleDetails.type,
            vehicleModel: driver.vehicleDetails.model,
            vehicleYear: driver.vehicleDetails.year,
            // Insurance details
            insuranceNumber: driver.insuranceDetails.insuranceNumber,
            insuranceProvider: driver.insuranceDetails.provider,
            insuranceIssueDate: new Date(driver.insuranceDetails.issueDate)
              .toISOString()
              .split("T")[0],
            insuranceExpiryDate: new Date(driver.insuranceDetails.expiryDate)
              .toISOString()
              .split("T")[0],
            // Bank details
            accountNumber: driver.bankDetails.accountNumber,
            accountName: driver.bankDetails.accountName,
            ibanNumber: driver.bankDetails.ibanNumber,
            bankName: driver.bankDetails.bankName,
            bankBranch: driver.bankDetails.branch,
            // Background check
            hasCriminalRecord: driver.backgroundCheck.hasCriminalRecord,
            criminalDetails: driver.backgroundCheck.criminalDetails || "",
          });

          // Set other states
          setNationality(driver.personalDetails.nationality);
          setHasUpshare(driver.personalDetails.hasUpshare);

          // Set existing files
          setExistingFiles({
            profile: driver.personalDetails.profilePicture,
            nationalId: driver.personalDetails.nationalIdDocument,
            passport: driver.passportDetails?.documentUrl || null,
            license: driver.licenseDetails.documentUrl,
            rc: driver.vehicleDetails.documentUrl,
            insurance: driver.insuranceDetails.documentUrl,
          });

          // Set existing additional documents
          if (driver.additionalDocuments?.length) {
            setExistingAttachments(driver.additionalDocuments);
          }
        } else {
          toast.error("Failed to fetch driver details");
          navigate("/driver/management");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to fetch driver details");
        navigate("/driver/management");
      }
    };

    fetchDriverData();
  }, [driverId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleAttachmentFileChange = (id, file) => {
    setAttachments((prev) =>
      prev.map((att) => (att.id === id ? { ...att, file } : att))
    );
  };

  const addAttachment = () => {
    const newId =
      attachments.length === 0
        ? 1
        : Math.max(...attachments.map((a) => a.id)) + 1;
    setAttachments([
      ...attachments,
      { id: newId, file: null, type: "", description: "" },
    ]);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };
  const handleFileChange = (sectionName, event) => {
    const file = event.target.files[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [sectionName]: file,
      }));
      setUploadProgress((prev) => ({
        ...prev,
        [sectionName]: 0,
      }));
    }
  };

  const uploadFile = async (file, section) => {
    if (!file) return null;

    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${section}-${uuidv4()}.${fileExtension}`;
      const storageRef = ref(
        storage,
        `drivers/${driverId}/${section}/${fileName}`
      );

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
    setLoading(true);

    try {
      const uploadedFiles = {};

      // Upload new files if any
      for (const [section, file] of Object.entries(files)) {
        if (file) {
          try {
            uploadedFiles[section] = await uploadFile(file, section);
          } catch (error) {
            console.error(`Error uploading ${section}:`, error);
            toast.error(`Failed to upload ${section} document`);
            setLoading(false);
            return;
          }
        }
      }

      // Prepare updated driver data
      const driverData = {
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
          profilePicture: uploadedFiles.profile || existingFiles.profile,
          nationalIdDocument:
            uploadedFiles.nationalId || existingFiles.nationalId,
        },
        passportDetails:
          nationality !== "saudi"
            ? {
                passportNumber: formData.passportNumber,
                issueDate: formData.passportIssueDate,
                expiryDate: formData.passportExpiryDate,
                issuePlace: formData.passportIssuePlace,
                documentUrl: uploadedFiles.passport || existingFiles.passport,
              }
            : undefined,
        licenseDetails: {
          licenseNumber: formData.licenseNumber,
          issueDate: formData.licenseIssueDate,
          expiryDate: formData.licenseExpiryDate,
          authority: formData.licenseAuthority,
          documentUrl: uploadedFiles.license || existingFiles.license,
        },
        vehicleDetails: {
          registrationNumber: formData.vehicleRegNumber,
          type: formData.vehicleType,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          documentUrl: uploadedFiles.rc || existingFiles.rc,
        },
        insuranceDetails: {
          insuranceNumber: formData.insuranceNumber,
          provider: formData.insuranceProvider,
          issueDate: formData.insuranceIssueDate,
          expiryDate: formData.insuranceExpiryDate,
          documentUrl: uploadedFiles.insurance || existingFiles.insurance,
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
      };

      const response = await updateDriver(driverId, driverData);

      if (response.success) {
        toast.success("Driver updated successfully!");
        navigate("/driver/management");
      } else {
        toast.error(response.error || "Failed to update driver");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const nationalities = [
    { value: "saudi", label: "Saudi Arabia" },
    { value: "uae", label: "United Arab Emirates" },
    { value: "kuwait", label: "Kuwait" },
    { value: "oman", label: "Oman" },
    { value: "bahrain", label: "Bahrain" },
    { value: "qatar", label: "Qatar" },
    { value: "india", label: "India" },
    { value: "pakistan", label: "Pakistan" },
    { value: "bangladesh", label: "Bangladesh" },
    { value: "philippines", label: "Philippines" },
    { value: "egypt", label: "Egypt" },
  ];

  const documentTypes = [
    "Identity Document",
    "Work Permit",
    "Residence Permit",
    "Medical Certificate",
    "Training Certificate",
    "Other",
  ];
  return (
    <div className="driver-registration-container">
      <ToastContainer />
      <h1 className="main-title">Update Driver Details</h1>

      <form onSubmit={handleSubmit}>
        {/* Personal Details Section */}
        <SectionCard title="Personal Details">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Nationality</label>
              <select
                name="nationality"
                required
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              >
                <option value="">Select Nationality</option>
                {nationalities.map((nat) => (
                  <option key={nat.value} value={nat.value}>
                    {nat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>National ID Number</label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>National ID Document</label>
              {existingFiles.nationalId && (
                <div className="existing-file">
                  Current file:{" "}
                  <a
                    href={existingFiles.nationalId}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </a>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("nationalId", e)}
              />
              {uploadProgress.nationalId > 0 && (
                <div className="upload-progress">
                  Upload Progress: {uploadProgress.nationalId}%
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Father's Name</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Mother's Name</label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Profile Picture</label>
              {existingFiles.profile && (
                <div className="existing-file">
                  Current file:{" "}
                  <a
                    href={existingFiles.profile}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Image
                  </a>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("profile", e)}
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={hasUpshare}
                  onChange={(e) => setHasUpshare(e.target.checked)}
                />
                Has Upshare Account
              </label>
            </div>
          </div>
          <div className="address-section">
            <div className="form-group full-width">
              <label>Current Address</label>
              <textarea
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleInputChange}
                rows="3"
                required
              ></textarea>
            </div>
            <div className="form-group full-width">
              <label>Permanent Address</label>
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
                rows="3"
                required
              ></textarea>
            </div>
          </div>
        </SectionCard>

        {/* Passport Section - Only shown if nationality is not Saudi */}
        {nationality && nationality !== "saudi" && (
          <SectionCard title="Passport Details">
            <div className="form-grid">
              <div className="form-group">
                <label>Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  name="passportIssueDate"
                  value={formData.passportIssueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="passportExpiryDate"
                  value={formData.passportExpiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Place of Issue</label>
                <input
                  type="text"
                  name="passportIssuePlace"
                  value={formData.passportIssuePlace}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Passport Document</label>
                {existingFiles.passport && (
                  <div className="existing-file">
                    Current file:{" "}
                    <a
                      href={existingFiles.passport}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange("passport", e)}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {/* Driving License Section */}
        <SectionCard title="Driving License Details">
          <div className="form-grid">
            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Issue Date</label>
              <input
                type="date"
                name="licenseIssueDate"
                value={formData.licenseIssueDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="licenseExpiryDate"
                value={formData.licenseExpiryDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Issuing Authority</label>
              <input
                type="text"
                name="licenseAuthority"
                value={formData.licenseAuthority}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>License Document</label>
              {existingFiles.license && (
                <div className="existing-file">
                  Current file:{" "}
                  <a
                    href={existingFiles.license}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </a>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("license", e)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Vehicle Registration Section */}
        <SectionCard title="Vehicle Registration Details">
          <div className="form-grid">
            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="vehicleRegNumber"
                value={formData.vehicleRegNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Vehicle Type</label>
              <input
                type="text"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="vehicleYear"
                value={formData.vehicleYear}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>RC Document</label>
              {existingFiles.rc && (
                <div className="existing-file">
                  Current file:{" "}
                  <a
                    href={existingFiles.rc}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </a>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("rc", e)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Insurance Section */}
        <SectionCard title="Insurance Details">
          <div className="form-grid">
            <div className="form-group">
              <label>Insurance Number</label>
              <input
                type="text"
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Provider Name</label>
              <input
                type="text"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Issue Date</label>
              <input
                type="date"
                name="insuranceIssueDate"
                value={formData.insuranceIssueDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="insuranceExpiryDate"
                value={formData.insuranceExpiryDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Insurance Document</label>
              {existingFiles.insurance && (
                <div className="existing-file">
                  Current file:{" "}
                  <a
                    href={existingFiles.insurance}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </a>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("insurance", e)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Bank Details Section */}
        <SectionCard title="Bank Account Details">
          <div className="form-grid">
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>IBAN Number</label>
              <input
                type="text"
                name="ibanNumber"
                value={formData.ibanNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Branch</label>
              <input
                type="text"
                name="bankBranch"
                value={formData.bankBranch}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </SectionCard>

        {/* Criminal Background Section */}
        <SectionCard title="Background Check">
          <div className="form-grid">
            <div className="form-group">
              <label>Criminal Record</label>
              <select
                name="hasCriminalRecord"
                value={formData.hasCriminalRecord}
                onChange={handleInputChange}
                required
              >
                <option value="">Select</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {formData.hasCriminalRecord === "yes" && (
              <div className="form-group full-width">
                <label>Provide details</label>
                <textarea
                  name="criminalDetails"
                  value={formData.criminalDetails}
                  onChange={handleInputChange}
                  rows="3"
                  required
                ></textarea>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Additional Documents Section */}
        <SectionCard title="Additional Documents">
          <div className="attachments-section">
            {/* Existing Attachments */}
            {existingAttachments.map((attachment, index) => (
              <div key={index} className="existing-attachment">
                <p>Type: {attachment.type}</p>
                <p>Description: {attachment.description}</p>
                <a
                  href={attachment.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </a>
              </div>
            ))}

            {/* New Attachments */}
            {attachments.map((attachment) => (
              <div key={attachment.id} className="attachment-item">
                <div className="form-group">
                  <label>Document Type</label>
                  <select
                    value={attachment.type}
                    onChange={(e) => {
                      const newAttachments = attachments.map((att) =>
                        att.id === attachment.id
                          ? { ...att, type: e.target.value }
                          : att
                      );
                      setAttachments(newAttachments);
                    }}
                    required
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Document</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      handleAttachmentFileChange(
                        attachment.id,
                        e.target.files[0]
                      );
                      handleFileChange(`additional${attachment.id}`, e);
                    }}
                    required
                  />
                  {uploadProgress[`additional${attachment.id}`] > 0 && (
                    <div className="upload-progress">
                      Upload Progress:{" "}
                      {uploadProgress[`additional${attachment.id}`]}%
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Document description"
                    value={attachment.description}
                    onChange={(e) => {
                      const newAttachments = attachments.map((att) =>
                        att.id === attachment.id
                          ? { ...att, description: e.target.value }
                          : att
                      );
                      setAttachments(newAttachments);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="remove-attachment-btn"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-attachment-btn"
              onClick={addAttachment}
            >
              + Add Document
            </button>
          </div>
        </SectionCard>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Updating...
              </>
            ) : (
              "Update Driver"
            )}
          </button>
          <button
            type="button"
            className="cancel-btn"
            disabled={loading}
            onClick={() => navigate("/driver/management")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverRegisterEdit;
