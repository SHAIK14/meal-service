const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema(
  {
    driverId: {
      type: String,
      required: true,
      unique: true,
    },
    personalDetails: {
      fullName: { type: String, required: true },
      dob: { type: Date, required: true },
      mobile: { type: String, required: true },
      nationality: { type: String, required: true },
      nationalId: { type: String, required: true, unique: true },
      fatherName: { type: String, required: true },
      motherName: { type: String, required: true },
      joiningDate: { type: Date, required: true },
      currentAddress: { type: String, required: true },
      permanentAddress: { type: String, required: true },
      hasUpshare: { type: Boolean, default: false },
      profilePicture: { type: String, required: true },
      nationalIdDocument: { type: String, required: true },
    },
    passportDetails: {
      passportNumber: { type: String },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      issuePlace: { type: String },
      documentUrl: { type: String },
    },
    licenseDetails: {
      licenseNumber: { type: String, required: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date, required: true },
      authority: { type: String, required: true },
      documentUrl: { type: String, required: true },
    },
    vehicleDetails: {
      registrationNumber: { type: String, required: true },
      type: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      documentUrl: { type: String, required: true },
    },
    insuranceDetails: {
      insuranceNumber: { type: String, required: true },
      provider: { type: String, required: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date, required: true },
      documentUrl: { type: String, required: true },
    },
    bankDetails: {
      accountNumber: { type: String, required: true },
      accountName: { type: String, required: true },
      ibanNumber: { type: String, required: true },
      bankName: { type: String, required: true },
      branch: { type: String, required: true },
    },
    backgroundCheck: {
      hasCriminalRecord: {
        type: String,
        enum: ["yes", "no"],
        required: true,
      },
      criminalDetails: {
        type: String,
        required: function () {
          return this.backgroundCheck.hasCriminalRecord === "yes";
        },
      },
    },
    additionalDocuments: [
      {
        type: {
          type: String,
          enum: [
            "Identity Document",
            "Work Permit",
            "Residence Permit",
            "Medical Certificate",
            "Training Certificate",
            "Other",
          ],
          required: true,
        },
        description: { type: String },
        documentUrl: { type: String, required: true },
      },
    ],
    authDetails: {
      username: { type: String },
      password: { type: String },
      temporaryPassword: { type: String },
      isFirstLogin: { type: Boolean, default: true },
      lastLogin: { type: Date },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "inactive"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvalDate: { type: Date },
  },
  { timestamps: true }
);

DriverSchema.pre("save", function (next) {
  if (
    this.personalDetails.nationality !== "saudi" &&
    !this.passportDetails.passportNumber
  ) {
    const err = new Error(
      "Passport details are required for non-Saudi nationals"
    );
    next(err);
  }
  next();
});

module.exports = mongoose.model("Driver", DriverSchema);
