import {existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {homedir} from "node:os";
import {dirname, join} from "node:path";
import yaml from "js-yaml";

import {IO} from "../io/io.js";


abstract class ConfigFile {
  private readonly _pathname: string;
  readonly io: IO;

  get pathname(): string {
    return this._pathname;
  }

  protected constructor(pathname: string, io: IO) {
    this._pathname = pathname;
    this.io = io;
  }

  /**
   * Load configuration from a file.
   * If there is no configuration, then a default one will be saved.
   */
  load() {
    let contents: string;
    const io = this.io;
    let settings;

    try {
      io.log.info(`Loading configuration: ${this.pathname}`);
      contents = readFileSync(this.pathname).toString();
    } catch (e) {
      io.log.info(`No configuration found, creating: (${this.pathname})`);
      this.save();
      contents = readFileSync(this.pathname).toString();
    }

    try {
      settings = yaml.load(contents) as object;
      for (const [key, value] of Object.entries(settings)) {
        if (Object.hasOwn(this, key)) {
          this[key as keyof typeof this] = value;
        } else {
          // io.log.warn(`unrecognized key: ${key}`);
          io.fail(`unrecognized key: ${key}`);
        }
      }
    } catch (e: any) {
      io.fail(`parsing ${this.pathname}:`, e.message || e);
    }
  }

  /**
   * Save configuration to file.
   */
  save() {
    const io = this.io;
    try {
      const entries = Object.entries(this).filter((e) => {
        const [key] = e;
        return !["_pathname", "io"].includes(key);
      });
      const settings: any = {};
      entries.forEach((e) => {
        const [key, value] = e;
        settings[key] = value;
      });
      const doc = yaml.dump(settings, {
        "styles": {
          "!!null": "empty",
        },
        "sortKeys": true,
      });
      const dir = dirname(this.pathname);
      if (!existsSync(dir)) mkdirSync(dir, {recursive: true});
      writeFileSync(this.pathname, doc);
      io.log.info(`Saved configuration: ${this.pathname}`);
    } catch (e: any) {
      io.fail(e.message || e);
    }
  }
}


/**
 *
 */
export class GlobalConfigSettings extends ConfigFile {
  // Billing ID (https://console.cloud.google.com/billing)
  billingId = "";

  constructor(pathname: string, io: IO) {
    super(pathname, io);
  }
}


/**
 *
 */
export class AppConfigSettings extends ConfigFile {
  // Google APIs to enable (defaults include APIs to build/deploy Cloud Run app)
  googleapis = [
    "artifactregistry",
    "cloudbuild",
    "run",
  ];

  // The Project ID (not necessarily the same as the project name)
  project = "";

  // Cloud Run region (https://cloud.google.com/run/docs/locations)
  region = "";

  // The hosted service name to use with Cloud Run
  service = "";

  constructor(pathname: string, io: IO) {
    super(pathname, io);
  }
}


/**
 *
 */
export class Config {
  app: AppConfigSettings;
  global: GlobalConfigSettings;
  io: IO;

  constructor(appConfigPathname: string, globalConfigPathname: string, io: IO) {
    this.app = new AppConfigSettings(appConfigPathname, io);
    this.global = new GlobalConfigSettings(globalConfigPathname, io);
    this.io = io;
  }


  /**
   * Load configuration.
   */
  load() {
    this.global.load();
    this.app.load();
  }

  /**
   * Save configuration.
   */
  save() {
    this.global.save();
    this.app.save();
  }
}


/**
 *
 */
export function loadConfig(appConfigPathname: string, io: IO) {
  const globalConfigPathname = join(homedir(), ".config", "run", "run.yaml");
  const config = new Config(appConfigPathname, globalConfigPathname, io);
  config.load();
  return config;
}
