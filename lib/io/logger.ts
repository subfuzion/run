import {stderr} from "node:process";
import {Writable} from "node:stream";
import {format} from "node:util";


export enum LogLevel {
  None = "NONE",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
}


export interface Logger {
  /**
   * Logs a `LogLevel.Info` message.
   */
  info(...args: any[]): void;

  /**
   * Logs a `LogLevel.Warn` message.
   */
  warn(...args: any[]): void;

  /**
   * Logs a `LogLevel.Error` message.
   */
  error(...args: any[]): void;
}


abstract class AbstractLogger implements Logger {
  logLevel: LogLevel = LogLevel.None;

  /**
   * Basic print function that appends a newline to output.
   */
  abstract printErr(...args: any[]): void;

  /**
   * Logs a `LogLevel.Info` message.
   * Ex: INFO: operation started.
   */
  info(...args: any[]): void {
    if (this.logLevel === LogLevel.Info) {
      this.printErr(...args);
    }
  }

  /**
   * Logs a `LogLevel.Warn` message.
   * Ex: WARN: operation taking too long.
   */
  warn(...args: any[]): void {
    if (this.logLevel === LogLevel.Info || this.logLevel === LogLevel.Warn) {
      this.printErr(...args);
    }
  }

  /**
   * Logs a `LogLevel.Error` message.
   * Ex: ERROR: operation finished with errors.
   */
  error(...args: any[]): void {
    if (this.logLevel != LogLevel.None) {
      this.printErr(...args);
    }
  }
}


/**
 *
 */
export class StdLogger extends AbstractLogger implements Logger {
  err: Writable = stderr;

  constructor(
    logLevel: LogLevel = LogLevel.None,
    err?: Writable) {
    super();
    this.logLevel = logLevel;
    this.err = err || stderr;
  }

  /**
   * Basic print function that appends a newline to output.
   */
  printErr(...args: any[]): void {
    this.err.write(format(...args) + "\n");
  }

  /**
   * Logs an 'info" message to err stream.
   */
  info(...args: any[]): void {
    super.info(`${LogLevel.Info} : `, ...args);
  }

  /**
   * Logs a 'warn' message to err stream.
   */
  warn(...args: any[]): void {
    super.warn(`${LogLevel.Warn} : `, ...args);
  }

  /**
   * Logs an 'error' message to err stream.
   */
  error(...args: any[]): void {
    super.error(`${LogLevel.Error}: `, ...args);
  }
}
