import {Context} from "../context.js";


/**
 *
 */
export function version(context: Context) {
  context.io.print(context.version);
}
