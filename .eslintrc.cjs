module.exports = {
  "env": {
    "node": true,
    "es2022": true,
  },
  "extends": [
    "eslint:recommended",
    "google",
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "plugins": [
    "jsdoc",
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
  },
};
