# Releasing a new version.

1. Run `npm run lint`.
2. Generate a new build (create `dist` directory): `npm run build`.
2. Update `CHANGELOG.md`.
2. Bump version in `package.json`.
3. Push/merge to `main`
4. Tag the release: `git tag -a vX.Y.Z -m vX.Y.Z`
5. Push/merge to main: `git push origin vX.Y.Z`
6. Publish to npm: `npm publish --access public`
