const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode:true,
  content: [
    "./src/components/**/*.{vue,js,ts,jsx,tsx}",
    "./sandbox/**/*.{vue,js,ts,jsx,tsx}",
  ]
}
