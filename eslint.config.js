// eslint.config.js

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    files: [
      "client/**/*.{js,ts,jsx,tsx}",
      "server/**/*.{js,ts,jsx,tsx}",
      "shared/**/*.{js,ts,jsx,tsx}",
      "config/**/*.{js,ts,jsx,tsx}",
      "scripts/**/*.{js,ts,jsx,tsx}"
    ],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: pluginReact
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended[0].rules,
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off"
    }
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**"]
  }
];
