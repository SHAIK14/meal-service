const { heroui } = require("@heroui/theme");
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/components/(date-picker|select|button|ripple|spinner|calendar|date-input|form|popover|listbox|divider|scroll-shadow).js",
  ],
  theme: {
    extend: {},
  },
  plugins: [heroui()],
};
