// Function to generate a random password with specific requirements
const generatePassword = () => {
  // Define character sets
  const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excluded I, O
  const lowercaseChars = "abcdefghijkmnpqrstuvwxyz"; // Excluded l, o
  const numberChars = "23456789"; // Excluded 0, 1
  const specialChars = "@#$%^&*";

  // Ensure at least one character from each set
  let password = "";
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Add additional random characters to reach desired length (8 characters total)
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  for (let i = password.length; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password string
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};

module.exports = {
  generatePassword,
};
