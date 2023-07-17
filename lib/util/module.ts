import {pathToFileURL} from "node:url";


/**
 * Returns true if url is the main module file url.
 * If url is not provided, isMainModule will use the file url of the caller.
 * @param url
 * @return {boolean}
 */
export function isMainModule(url: URL): boolean {
  if (url) {
    return url.href === pathToFileURL(process.argv[1]).href;
  } else {
    const prevLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = 1;
    const target = {} as any;
    Error.captureStackTrace(target, isMainModule);
    Error.stackTraceLimit = prevLimit;
    const match = target.stack.match(/(file:\/{3}.*):\d+:\d+/m);
    return match[1] === pathToFileURL(process.argv[1]).href;
  }
}
