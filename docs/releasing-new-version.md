# Releasing a new version.

1. Run `npm run lint`.
2. Generate a new build (create `dist` directory): `npm run build`.
3. Update `CHANGELOG.md`.
4. Bump version in `package.json`.
5. Push/merge to `main`
6. Tag the release: `git tag -a vX.Y.Z -m vX.Y.Z`
7. Push/merge to main: `git push origin vX.Y.Z`
8. Publish to npm: `npm publish --access public`
