/** @type {import('tailwindcss').Config} */
// TailwindCSS 配置文件
export default {
  // 扫描 Vue 和 JS 文件中的 class
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // 品牌色：翡翠绿
      colors: {
        brand: {
          50: '#effdf5',
          100: '#d7fae6',
          200: '#b1f3cf',
          300: '#7ce6ac',
          400: '#44d183',
          500: '#18b164',
          600: '#0d8f4f',
          700: '#0a7241',
          800: '#0b5a35',
          900: '#0a4a2d',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
