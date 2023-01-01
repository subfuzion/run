import yaml from 'js-yaml';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname, join} from 'node:path';

import {IO} from '../io/io.js';


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
    let io = this.io;
    let settings;

    try {
      io.log.info(`Loading configuration: ${this.pathname}`);
      contents = readFileSync(this.pathname).toString();
    } catch (e) {
      io.log.info(`No configuration found, saving default configuration (${this.pathname})`);
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
    let io = this.io;
    try {
      const entries = Object.entries(this).filter(e => {
        const [key] = e;
        return !['_pathname', 'io'].includes(key);
      });
      const settings: any = {};
      entries.forEach(e => {
        const [key, value] = e;
        settings[key] = value;
      });
      const doc = yaml.dump(settings, {
        'styles': {
          '!!null': 'empty',
        },
        'sortKeys': true,
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


export class GlobalConfigSettings extends ConfigFile {
  billingId = '';

  constructor(pathname: string, io: IO) {
    super(pathname, io);
  }
}


export class AppConfigSettings extends ConfigFile{
  googleapis = [
    'artifactregistry',
    'cloudbuild',
    'run',
  ];
  project = '';
  region = '';
  service = '';

  constructor(pathname: string, io: IO) {
    super(pathname, io);
  }
}


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


export function loadConfig(appConfigPathname: string, io: IO) {
  const globalConfigPathname = join(homedir(), '.config', 'run', 'run.yaml');
  const config = new Config(appConfigPathname, globalConfigPathname, io);
  config.load();
  return config;
}
