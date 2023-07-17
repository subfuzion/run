import {Command as BaseCommand, Help, Option} from "commander";

import {Context} from "./context.js";

export
type CommandFn
    = ((context: Context, ...args: any[]) => void | Promise<void>) | undefined;

/**
 * Light wrapper for Commander command that invokes commands with context.
 */
export class Command extends BaseCommand {
  contextFn: () => Context;

  constructor(name: string, contextFn: () => Context, commandFn?: CommandFn) {
    super(name);
    this.contextFn = contextFn;

    if (commandFn) {
      this.action(async function(options: any, command: Command) {
        const context = contextFn();
        try {
          await commandFn(context, options, command);
        } catch (e: any) {
          context.io.fail(e.message || e);
        }
      });
    }
  }


  createHelp(): Help {
    return new RunHelp();
  }
}

class RunHelp extends Help {
  showHidden: boolean;

  constructor(showHidden: boolean = false) {
    super();
    this.showHidden = showHidden;
    this.sortOptions = true;
  }

  visibleOptions(cmd: Command): Option[] {
    // Hook into the global option for "-a, --all" to show hidden commands/opts.
    if (!cmd.parent) {
      if (cmd.getOptionValue("all")) this.showHidden = true;
    }

    if (this.showHidden) {
      for (const c of cmd.commands) {
        // @ts-ignore
        for (const o of c.options) {
          o.hidden = false;
        }
      }
    }

    let opts = super.visibleOptions(cmd);

    // Unless this.showHidden is set, hide the help option by default.
    if (!this.showHidden) {
      const help = opts.find((opt) => opt.short === "-h");
      if (help) {
        help.hidden = true;
        opts = opts.filter((opt) => opt.short != "-h");
      }
    }

    return opts;
  }


  visibleCommands(cmd: Command): Command[] {
    // Hook into the global option for "-a, --all" to show hidden commands/opts.
    if (!cmd.parent) {
      if (cmd.getOptionValue("all")) this.showHidden = true;
    }

    if (this.showHidden) {
      for (const c of cmd.commands) {
        c.setOptionValue("hidden", false);
        // TODO: this is a hack, try to find another way that works.
        // @ts-ignore
        c._hidden = false;
      }
    }

    let cmds = super.visibleCommands(cmd);

    // Unless this.showHidden is set, hide the help command by default.
    if (!this.showHidden) {
      const help = cmds.find((cmd) => cmd.name() === "help");
      if (help) {
        cmd.setOptionValue("hidden", true);
        // TODO: this is a hack, try to find another way that works.
        // @ts-ignore
        cmd._hidden = true;
        cmds = cmds.filter((cmd) => cmd.name() != "help");
      }
    }

    return cmds as Command[];
  }

  formatHelp(cmd: Command, helper: Help): string {
    let help = super.formatHelp(cmd, helper);

    if (!cmd.parent) {
      const name = cmd.name();
      const version = cmd.contextFn().version;
      const lines = help.split("\n");
      const usage = lines[0];
      const descr = lines[2];
      help = [`${name} ${version}\n`, `${descr}\n`, usage,
        ...lines.slice(3)].join("\n");
    }

    return help + "\n";
  }

  commandUsage(cmd: Command): string {
    let usage = super.commandUsage(cmd);
    // @ts-ignore
    if (!cmd.options?.length) {
      usage = usage.replace(" [options]", "");
    }
    return usage;
  }
}
