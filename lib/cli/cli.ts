import {getPackageVersion} from "../util/package.js";
import {Command, CommandFn} from "./command.js";
import * as cloud from "./commands/cloud.js";
import * as auth from "./commands/auth.js";
import * as configure from "./commands/configure.js";
import * as app from "./commands/app.js";
import * as runtime from "./commands/runtime.js";
import {Context, getContext} from "./context.js";


const version = getPackageVersion(import.meta.url);


export function createCLI(defaults?: Context) {
  defaults ||= new Context();
  defaults.version ||= version;

  // `contextFn` is not invoked until a command's `action` method. This ensures
  // that all settings, including command-line options, are fully processed.
  const contextFn = (): Context => getContext(cli, defaults);

  const cli = new Command("run", contextFn)
      .description("Easy create and deploy for Cloud Run apps.")
      .option("-a, --all", "Print all commands and options (use with --help or help).")
      .option("-c, --config <name>", "Set pathname for configuration file.")
      .option("-v, --verbose", "Print command execution logs.")
      .helpOption("-h, --help", "Display help.")
      .addHelpCommand("help [command]", "Display help for command.")
  ;

  const addCommand = (
      parent: Command,
      name: string,
      commandFn?: CommandFn,
      opts?: {}): Command => {
    const cmd = new Command(name, contextFn, commandFn);
    cmd.copyInheritedSettings(parent);
    parent.addCommand(cmd, opts);
    return cmd;
  };

  addCommand(cli, "login", auth.login)
      .description("Use login/logout to authorize or revoke access.")
  ;

  addCommand(cli, "logout", auth.logout, {hidden: true})
      .description("Revoke access.")
  ;

  addCommand(cli, "create", app.create)
      .description("Create a new app.")
      .aliases(["new", "init"])
      .option("--enable-integrations", "Add app integration features (currently demo only).")
  ;

  addCommand(cli, "deploy", cloud.deploy)
      .description("Use deploy/undeploy to serve or stop serving the app.")
  ;

  addCommand(cli, "undeploy", cloud.undeploy, {hidden: true})
      .description("Stop serving the app and delete resources.")
  ;

  addCommand(cli, "logs", cloud.logs)
      .description("Print app logs.")
  ;

  addCommand(cli, "check", configure.check, {hidden: true})
      .description("Check configuration settings.")
  ;

  addCommand(cli, "configure", configure.configure, {hidden: true})
      .description("Configure settings.")
  ;

  addCommand(cli, "version", runtime.version, {hidden: true})
      .description("Print current version.")
  ;

  return cli;
}


