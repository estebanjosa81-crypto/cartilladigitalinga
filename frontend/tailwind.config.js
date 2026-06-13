/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '400px',
      },
      colors: {
        gov: {
          green:        '#00833E',
          'green-dark': '#005C2A',
          'green-light':'#E6F4ED',
          yellow:       '#F0A500',
          'yellow-light':'#FFF8E7',
          gray:         '#F5F5F5',
          border:       '#D9D9D9',
          dark:         '#1B2B1E',
          text:         '#1A1A1A',
          muted:        '#6B6B6B',
        }
      }
    },
  },
  plugins: [],
  safelist: [
    // Colores dinámicos usados en los módulos
    {
      pattern: /bg-(emerald|green|amber|purple|pink)-(50|100|200|300|400|500|600|700)/,
    },
    {
      pattern: /text-(emerald|green|amber|purple|pink)-(50|100|200|300|400|500|600|700|800)/,
    },
    {
      pattern: /border-(emerald|green|amber|purple|pink)-(200|300|400|500)/,
    },
    {
      pattern: /from-(emerald|green|amber|purple|pink|yellow|orange|red|gray|slate)-(300|400|500|600|700)/,
    },
    {
      pattern: /to-(emerald|green|amber|purple|pink|teal|yellow|orange|red|gray|slate)-(300|400|500|600|700)/,
    },
    {
      pattern: /via-(emerald|green|amber|purple|pink|orange)-(400|500|600)/,
    },
    // Colores institucionales GOV
    {
      pattern: /bg-gov-(green|yellow|gray|dark|text|muted|border)/,
      variants: ['hover', 'group-hover'],
    },
    {
      pattern: /text-gov-(green|yellow|dark|text|muted)/,
      variants: ['hover'],
    },
    {
      pattern: /border-gov-(green|yellow|border)/,
    },
  ],
}
