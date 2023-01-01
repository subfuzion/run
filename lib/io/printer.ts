import {stdout} from "node:process";
import {Writable} from "node:stream";
import {format} from "node:util";


export interface Printer {
  /**
   * Basic print function that does not append a newline to output.
   */
  write(s: string): void;

  /**
   * Basic print function that appends a newline to output.
   */
  print(...args: any[]): void;

  /**
   * Print a decorated status message.
   * Ex: ︎▸ uploading...
   */
  status(...args: any[]): void;

  /**
   * Prints a decorated fail message.
   */
  fail(...args: any[]): void;

  /**
   * Prints a decorated success message.
   * Ex: ✅operation succeeded.
   */
  success(...args: any[]): void;
}


abstract class AbstractPrinter implements Printer {
  /**
   * Basic print function that does not append a newline to output.
   */
  abstract write(s: string): void;

  /**
   * Basic print function that appends a newline to output.
   */
  abstract print(...args: any[]): void;

  /**
   * Print a decorated status message.
   * Ex: ︎STATUS: uploading...
   */
  status(...args: any[]): void {
    this.print(...args);
  }

  /**
   * Prints a decorated fail message.
   * Ex: FAIL: operation failed.
   */
  fail(...args: any[]): void {
    this.print(...args);
  }

  /**
   * Prints a decorated success message.
   * Ex: SUCCESS: operation succeeded.
   */
  success(...args: any[]): void {
    this.print(...args);
  }
}


export class TextPrinter extends AbstractPrinter implements Printer {
  out: Writable = stdout;

  constructor(out?: Writable) {
    super();
    this.out = out || stdout;
  }

  /**
   * Basic print function that does not append a newline to output.
   */
  write(s: string): void {
    this.out.write(s);
  }

  /**
   * Basic print function that appends a newline to output.
   */
  print(...args: any[]): void {
    this.out.write(format(...args) + "\n");
  }

  /**
   * Print a decorated status message.
   * Ex: ︎STATUS: uploading...
   */
  status(...args: any[]): void {
    super.status("STATUS: ", ...args);
  }

  /**
   * Prints a decorated error message.
   * Ex: FAIL: operation.
   */
  fail(...args: any[]): void {
    super.fail("FAIL: ", ...args);
    process.exit(1);
  }

  /**
   * Prints a decorated success message.
   * Ex: SUCCESS: operation.
   */
  success(...args: any[]): void {
    super.success("SUCCESS: ", ...args);
  }
}


export class TerminalPrinter extends AbstractPrinter implements Printer {
  out: Writable = stdout;

  constructor(out?: Writable) {
    super();
    this.out = out || stdout;
  }

  /**
   * Basic print function that does not append a newline to output.
   */
  write(s: string): void {
    this.out.write(s);
  }

  /**
   * Basic print function that appends a newline to output.
   */
  print(...args: any[]): void {
    this.out.write(format(...args) + "\n");
  }

  /**
   * Print a decorated status message.
   * Ex: ︎▸ uploading...
   */
  status(...args: any[]): void {
    super.status("▸ ", ...args);
  }

  /**
   * Prints a decorated error message.
   */
  fail(...args: any[]): void {
    super.fail("❌ ", ...args);
    process.exit(1);
  }

  /**
   * Prints a decorated success message.
   * Ex: ✅operation succeeded.
   */
  success(...args: any[]): void {
    super.success("✅ ", ...args);
  }
}
