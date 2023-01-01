import {homedir} from 'node:os';
import * as path from 'node:path';
import {cwd} from 'node:process';

import {Command} from './command.js';
import {Config} from './config.js';
import {IO} from '../io/io.js';

import {getDefaultIO, LogLevel} from '../io/io.js';
import {loadConfig} from './config.js';


export class Context {
  command?: Command;
  config!: Config;
  configPath = "run.yaml";
  cwd = ".";
  io!: IO;
  verbose = false;
  version = "";

  constructor(defaults?: Context) {
    if (defaults) {
      if (defaults.command) this.command = defaults.command;
      if (defaults.config) this.config = defaults.config;
      if (defaults.configPath) this.configPath = defaults.configPath;
      if (defaults.cwd) this.cwd = defaults.cwd;
      if (defaults.io) this.io = defaults.io;
      if (defaults.verbose) this.verbose = defaults.verbose;
      if (defaults.version) this.version = defaults.version;
    }
  }
}

/**
 * Returns a command context. The context provides access to functionality
 * needed during command execution, including I/O functions. This function
 * should not be invoked until after command line arguments are parsed (due to
 * options such as config file path, command verbosity, etc.).
 */
export function getContext(command: Command, defaults?: Context): Context {
  const context = defaults ? structuredClone(defaults) : new Context();
  const opts = command.opts();
  const io = getDefaultIO(context.verbose ? LogLevel.Info : LogLevel.None);

  let configPath = opts.config || context.configPath;
  configPath = path.normalize(configPath);
  configPath = configPath.replace(/~/, homedir());
  configPath = path.resolve(configPath);

  context.configPath = configPath;
  context.config = loadConfig(configPath, io);
  context.cwd = cwd();
  context.io = io;
  context.verbose = !!(opts.verbose || context.verbose);

  return context;
}
