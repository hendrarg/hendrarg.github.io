/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./index.html", "./src/js/**/*.mjs"],
  theme: {
    container: {
      center: true,
      padding: "16px",
    },
    extend: {
      colors: {
        ink: "#100c24",
        panel: "#1b1436",
        violet: "#8b5cf6",
        magenta: "#d946ef",
        coral: "#fb7185",
        electric: "#38bdf8",
        mist: "#d8d3ec",
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px rgba(139, 92, 246, 0.24)",
      },
      screens: {
        "2xl": "1320px",
        "iphone-se": "320px", // iPhone SE
        "iphone-xr": "414px", // iPhone XR, XS Max, 11, 11 Pro Max
      },
    },
  },
  plugins: [],
};
