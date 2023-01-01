import { EventEmitter } from 'node:events';

import {Printer} from "../io/printer.js";
import {Settings} from "./settings.js";


export abstract class CloudClient extends EventEmitter {
  readonly settings: Settings;
  readonly projectParent;

  protected constructor(settings: Settings) {
    super();
    this.settings = settings;
    this.projectParent = "projects/" + settings.project;
  }

  get printer(): Printer {
    return this.settings.out;
  }

  protected write(s: string): void {
    this.settings.out.write(s);
  }

  protected print(...args: any[]): void {
    this.settings.out.print(...args);
  }

  protected fail(...args: any[]): void {
    this.settings.out.fail(...args);
  }

  protected success(...args: any[]): void {
    this.settings.out.success(...args);
  }
}
