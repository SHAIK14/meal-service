exports.DUMMY_PHONE_NUMBER = "+919876543210";
exports.DUMMY_OTP = "123456";

exports.isOTPExpired = (otpExpires) => {
  return new Date() > otpExpires;
};

exports.getCountryFromPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("+91")) {
    return "India";
  } else if (phoneNumber.startsWith("+966")) {
    return "Saudi Arabia";
  } else {
    return "Unknown";
  }
};
