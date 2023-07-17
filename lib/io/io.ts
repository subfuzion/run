import {stderr, stdout} from "node:process";
import {Writable} from "node:stream";

import {Logger, LogLevel, StdLogger} from "./logger.js";
import {Printer, TerminalPrinter, TextPrinter} from "./printer.js";


export {LogLevel} from "./logger.js";


export interface IO extends Printer {
  get log(): Logger;
}


/**
 * TextIO provides all the input, output, and logging support needed by the CLI.
 */
export class TextIO extends TextPrinter {
  private readonly logger: Logger;

  constructor(
    out?: Writable,
    errOrLogger?: Writable | Logger,
    logLevel = LogLevel.None) {
    super(out);

    if (errOrLogger instanceof Writable) {
      this.logger = new StdLogger(logLevel, errOrLogger);
    } else {
      this.logger = errOrLogger as Logger;
    }
  }

  get log() {
    return this.logger;
  }

  override fail(...args: never[]): void {
    this.log.error(...args);
    super.fail(...args);
  }
}


/**
 * IO provides all the input, output, and logging support needed by the CLI when
 * connected to a TTY.
 */
export class TerminalIO extends TerminalPrinter {
  private readonly logger: Logger;

  constructor(
    out?: Writable,
    errOrLogger?: Writable | Logger,
    logLevel = LogLevel.None) {
    super(out);

    if (errOrLogger instanceof Writable) {
      this.logger = new StdLogger(logLevel, errOrLogger);
    } else {
      this.logger = errOrLogger as Logger;
    }
  }

  get log() {
    return this.logger;
  }

  override fail(...args: never[]): void {
    this.log.error(...args);
    super.fail(...args);
  }
}


/**
 *
 */
export function getDefaultIO(logLevel = LogLevel.None): IO {
  return process.stdin.isTTY ?
    new TerminalIO(stdout, stderr, logLevel) :
    new TextIO(stdout, stderr, logLevel);
}
