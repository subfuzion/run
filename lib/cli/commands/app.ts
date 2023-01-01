import {readdir} from "node:fs/promises";
import {join} from "path";

import {Generator} from "../../templates/generator.js";
import {Context} from "../context.js";
import {appNamePrompt, featurePrompt, projectTemplatePrompt} from "./prompts.js";


export async function create(context: Context, options: any) {
  const dest = context.cwd;

  const ok = await isTargetDirectorySafe(dest, context.configPath);
  if (!ok) context.io.fail("Directory is not empty.");

  const generator = new Generator();

  const appName = await appNamePrompt(dest);
  if (!appName) context.io.fail("App name is required.");

  const template = await projectTemplatePrompt(generator);
  if (!template) return;

  await generator.generate(dest, template, {
    app: appName,
  });

  if (options.enableIntegrations) {
    await featurePrompt();
  }

  context.io.print(`✅  Created app: ${appName}`);
  context.io.print();

  if (template.needsInstall) {
    context.io.print("🖥️ For local development, enter:");
    context.io.print("  npm install");
    context.io.print("  npm start");
  }

  context.io.print("🚀 To launch on Cloud Run, enter:");
  context.io.print("  run deploy");
}


/**
 * Ensure directory is empty except for auto-generated configuration file.
 */
async function isTargetDirectorySafe(
    dest: string,
    configPath: string): Promise<boolean> {
  const files = await readdir(dest);
  return (!(files.length > 1 ||
            (files.length === 1 && join(dest, files[0]) != configPath)));
}


