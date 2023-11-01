/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  purge: {
    options: {
      safelist: [
        {
          pattern: /(fill|bg)-(yellow|purple)-(500|600|700)/,
        },
        {
          pattern: /border-pink-800/,
        },
      ],
    },
  },
  extend: {
    transitionProperty: {
      "max-height": "max-height",
    },
  },
  plugins: [],
};
