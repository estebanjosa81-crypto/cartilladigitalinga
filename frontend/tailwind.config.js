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
  ],
}
