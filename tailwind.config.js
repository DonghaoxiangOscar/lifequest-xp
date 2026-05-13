/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#f7f8f2",
        moss: "#5d8b55",
        bolt: "#e5ff4f",
        tide: "#287c8f",
        ember: "#f0714d",
        bruise: "#5a5f86",
      },
      boxShadow: {
        hard: "4px 4px 0 #151515",
        soft: "0 20px 60px rgba(21, 21, 21, 0.12)",
      },
      fontFamily: {
        display: ['"Trebuchet MS"', "Verdana", "sans-serif"],
        body: ['"Segoe UI"', "Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [],
};
