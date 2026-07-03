/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a1d2e',
        'sidebar-hover': '#252840',
        accent: '#2563eb',
        'accent-hover': '#1d4ed8'
      }
    }
  },
  plugins: []
};
