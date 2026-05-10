const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    require.resolve("./base.js"),
    "plugin:@next/eslint-plugin-next/core-web-vitals",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  settings: {
    "import/resolver": {
      typescript: { project },
    },
  },
  rules: {
    // RSC / Server Component kuralları
    "react/display-name": "off",
    "@next/next/no-html-link-for-pages": "off",
    // Hardcoded renk kullanımını uyarıyla işaretle
    "no-restricted-syntax": [
      "warn",
      {
        selector: "Literal[value=/\\b(red|blue|green|yellow|gray|grey|purple|pink|orange|indigo|violet|teal|cyan|lime|amber|rose|sky|emerald|slate|zinc|stone|neutral)-\\d{2,3}\\b/]",
        message: "Hardcoded Tailwind renk sınıfı kullanmayın. globals.css CSS değişkenlerini kullanın.",
      },
    ],
  },
};
