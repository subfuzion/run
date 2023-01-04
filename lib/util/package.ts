import {createRequire} from "node:module";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {pkgUpSync} from "pkg-up";


/**
 * Synchronously find and parse this package's closest package.json file.
 * @return The parsed file as an object or an empty object if not found.
 */
export function getPackage(urlOrPath: string): any {
  const pathname = urlOrPath.startsWith("file://") ? fileURLToPath(urlOrPath) : urlOrPath;
  const dir = dirname(pathname);
  const pkgPath = pkgUpSync({cwd: dir});
  const require = createRequire(urlOrPath);
  return require(pkgPath!);
}


export function getPackageVersion(urlOrPath: string): string {
  return getPackage(urlOrPath).version;
}
