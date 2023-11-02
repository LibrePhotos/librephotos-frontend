module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  extends: ["airbnb", "airbnb-typescript", "airbnb/hooks", "prettier"],
  plugins: ["prettier"],
  rules: {
    "no-await-in-loop": "warn",
    "no-restricted-syntax": "warn",
    "no-param-reassign": "warn",
    "no-underscore-dangle": "warn",
    "no-return-assign": "warn",
    "no-var": "warn",
    "no-nested-ternary": "warn",
    "import/no-named-as-default": "warn",
    "import/prefer-default-export": "off",
    "import/no-cycle": "warn",
    "import/no-mutable-exports": "warn",
    "react/prop-types": "warn",
    "react/destructuring-assignment": "warn",
    "react/jsx-filename-extension": "warn",
    "react/sort-comp": "warn",
    "react/no-access-state-in-setstate": "warn",
    "react/jsx-props-no-spreading": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unused-class-component-methods": "warn",
    "react/no-array-index-key": "warn",
    "react/require-default-props": "warn",
    "react/no-unstable-nested-components": "warn",
    "@typescript-eslint/no-use-before-define": "warn",
    "@typescript-eslint/default-param-last": "warn",
    "@typescript-eslint/naming-convention": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-shadow": "warn",
  },
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
};
