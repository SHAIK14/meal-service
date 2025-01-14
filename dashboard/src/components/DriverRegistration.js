import React, { useState } from "react";
import "../styles/DriverRegistration.css";
import { storage } from "../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { registerDriver } from "../utils/api2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
const SectionCard = ({ title, children }) => (
  <div className="section-card">
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
    </div>
    <div className="section-content">{children}</div>
  </div>
);

const DriverRegistration = () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const uploadFile = async (file, driverId, section) => {
    if (!file) return null;

    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${section}-${uuidv4()}.${fileExtension}`;
      const storageRef = ref(
        storage,
        `drivers/${driverId}/${section}/${fileName}`
      );

      // Simple upload without progress (or implement uploadTask if needed)
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
      const driverId = `DR-${uuidv4().slice(0, 8)}`;
      const uploadedFiles = {};

      // Upload all main documents
      for (const [section, file] of Object.entries(files)) {
        if (file) {
          try {
            uploadedFiles[section] = await uploadFile(file, driverId, section);
          } catch (error) {
            console.error(`Error uploading ${section}:`, error);
            alert(`Failed to upload ${section} document. Please try again.`);
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
        // Show success notification using toast
        toast.success("Driver registered successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Reset all form fields
        setFormData({
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

        // Reset file states
        setFiles({
          profile: null,
          nationalId: null,
          passport: null,
          license: null,
          rc: null,
          insurance: null,
        });

        // Reset other states
        setAttachments([]);
        setNationality("");
        setHasUpshare(false);
        setUploadProgress({});

        // Optional: Redirect to drivers list
        // navigate('/admin/drivers');
      } else {
        // Show error notification
        toast.error(response.error || "Failed to register driver", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
      <h1 className="main-title">Driver Registration</h1>

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
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("nationalId", e)}
                required
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("profile", e)}
                required
              />
              {uploadProgress.profile > 0 && (
                <div className="upload-progress">
                  Upload Progress: {uploadProgress.profile}%
                </div>
              )}
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
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange("passport", e)}
                  required
                />
                {uploadProgress.passport > 0 && (
                  <div className="upload-progress">
                    Upload Progress: {uploadProgress.passport}%
                  </div>
                )}
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
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("license", e)}
                required
              />
              {uploadProgress.license > 0 && (
                <div className="upload-progress">
                  Upload Progress: {uploadProgress.license}%
                </div>
              )}
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
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("rc", e)}
                required
              />
              {uploadProgress.rc > 0 && (
                <div className="upload-progress">
                  Upload Progress: {uploadProgress.rc}%
                </div>
              )}
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
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange("insurance", e)}
                required
              />
              {uploadProgress.insurance > 0 && (
                <div className="upload-progress">
                  Upload Progress: {uploadProgress.insurance}%
                </div>
              )}
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
                Registering...
              </>
            ) : (
              "Register Driver"
            )}
          </button>
          <button
            type="button"
            className="cancel-btn"
            disabled={loading}
            onClick={() => {
              // Add your cancel logic here
              console.log("Operation cancelled");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverRegistration;
