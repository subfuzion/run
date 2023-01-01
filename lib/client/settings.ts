import {Context} from "../cli/context.js";
import {Printer} from "../io/printer.js";


export class Settings {
  project: string;
  out: Printer;

  constructor(project: string, out: Printer) {
    this.project = project;
    this.out = out;
  }

  static createFromContext(context: Context): Settings {
    return new Settings(context.config.app.project, context.io);
  }
}
