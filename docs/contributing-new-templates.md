# Contributing a new template

1. Only use ECMAScript 2022 or the latest TypeScript (currently 4.9).

2. The template must have a package.json with the following fields:

```json
{
  "name": "{{app}}",
  "private": true,
  "version": "0.0.0",
  "description": "THIS DESCRIPTION WILL SHOW UP IN THE CLI GENERATOR PROMPT",
  "type": "module",
  "license": "Apache-2.0",
  "scripts": {
    "lint": "eslint src/ --fix",
    "start": "node src/server.js",
    "test": "echo \"No tests\" && exit 0"
  },
  "dependencies": {
    "@google-cloud/logging": "^10.1.0",
  },
  "devDependencies": {
    "eslint": "^8.19.0",
    "eslint-config-google": "^0.14.0",
    "eslint-plugin-jsdoc": "^39.3.3"
  }
}

```

The `start` script must be valid. This is used as the container entrypoint by
the cloud buildpack.

The `test` script should exit 0 if no tests, otherwise exit with an appropriate
tests result code.

3. Ensure package includes appropriate files

- .gitignore
- .npmignore
- lint configuration, etc., and appropriate run scripts.

4. Installation

`npm install` must be run to confirm that:

- The package installs without audit errors.
- `package.json` and `package-lock.json` are in sync (or Cloud Build will fail).

4. Test the package and clean up

Ensure the package has `test` and `clean` scripts.

Make sure that any artifacts that are generated during testing are actually
cleaned up with `npm run clean`.
