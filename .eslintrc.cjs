module.exports = {
  "env": {
    "node": true,
    "es2022": true,
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "plugins": [
    "@typescript-eslint",
    "jsdoc",
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "google",
  ],
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "no-constant-condition": ["error", { "checkLoops": false }],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],

    // jsdoc: override deprecated require-jsdoc, valid-jsdoc
    // use jsdoc plugin instead and enforce for all exported
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "jsdoc/require-jsdoc": ["error", {
      "publicOnly": true,
      "require": {
        "ArrowFunctionExpression": true,
        "ClassDeclaration": true,
        "ClassExpression": true,
        "FunctionDeclaration": true,
        "FunctionExpression": true,
        "MethodDefinition": true,
      }
    }],

    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
  },
  ignorePatterns: ["lib/templates/**/*.js"],
};
