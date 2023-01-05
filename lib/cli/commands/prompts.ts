import {basename} from "node:path";
import Separator = inquirer.Separator;
import inquirer from "inquirer";

import {Generator, Template} from "../../templates/generator.js";


type Choices = (string | Separator | { name: string, short: string })[];

/**
 * Prompt for name when creating a new app.
 * @param defaultName The default name to use (same as the directory name).
 */
export async function appNamePrompt(defaultName: string): Promise<string | undefined> {
  const {appName} = await inquirer.prompt({
    name: "appName",
    message: "Enter a name for the new app:",
    default: basename(defaultName),
  });
  return appName;
}


/**
 * Prompt for project template when creating a new app.
 * @param generator The project template generator.
 */
export async function projectTemplatePrompt(generator: Generator): Promise<Template | undefined> {
  const templates = await generator.getTemplates();

  const noneChoice = "None";

  const t = templates.find(t => t.defaultTemplate);
  const defaultTemplate = {
    name: `${t!.name} (default)`,
    short: t!.description,
  };

  const templateChoices = templates.filter(t => !t.defaultTemplate).map(t => {
    return {
      name: t.name,
      short: t.description,
    };
  });

  const choices: Choices = [
    defaultTemplate,
    ...templateChoices,
    new Separator(),
    noneChoice,
  ];

  let {template} = await inquirer.prompt({
    type: "list",
    name: "template",
    message: "Choose a template:",
    choices: choices,
  });

  if (template === noneChoice) return;
  template = template.replace(" (default)", "");
  return templates.find(t => t.name === template);
}


/**
 * Prompt for additional templated features to add to a new app.
 */
export async function featurePrompt() {
  const {features} = await inquirer.prompt({
    type: "checkbox",
    name: "features",
    message: "Add additional features?",
    choices: [
      "Skip",
      new inquirer.Separator(),
      {
        name: "Pub/Sub",
        short: "",
      },
      {
        name: "Redis (Memorystore)",
        short: "",
      },
      {
        name: "Cloud SQL (PostgreSQL)",
        short: "",
      },
      {
        name: "Firebase",
        short: "",
      },
      {
        name: "MongoDB Atlas support",
        short: "",
      },
    ]
  });
  return features;
}


export type BillingPromptChoice = "continue" | "enter" | "remove";


/**
 * Prompt to use current or enter a new billing ID.
 * @param billingId The current billing ID.
 */
export async function billingPrompt(billingId: string): Promise<BillingPromptChoice> {
  const {choice} = await inquirer.prompt({
    type: "list",
    name: "choice",
    message: `Current billing ID: ${billingId}`,
    choices: [
      "Continue using this billing ID",
      new inquirer.Separator(),
      "Enter a new billing ID",
      "Remove billing ID",
    ],
    filter(val) {
      return val.split(" ")[0].toLowerCase();
    }
  });
  return choice as BillingPromptChoice;
}


/**
 * Prompt for the billing ID to use.
 */
export async function newBillingPrompt(): Promise<string> {
  const {newBillingId} = await inquirer.prompt({
    name: "newBillingId",
    message: "Enter billing ID (https://console.cloud.google.com/billing):",
  });
  return newBillingId;
}


export type ProjectPromptChoice = "continue" | "enter" | "choose" | "create";

export async function projectPrompt(projectId: string): Promise<ProjectPromptChoice> {
  const alreadyConfigured = [
    `Continue using this project (${projectId})`,
  ];

  let choices: (string | inquirer.Separator)[] = [
    "Create a new cloud project to host the service",
    "Enter an existing project to host the service",
    "Choose from a list of existing projects",
  ];

  let message = "Project ID";

  if (projectId) {
    message = `Current project: ${projectId}`;
    choices = [
      ...alreadyConfigured,
      new inquirer.Separator,
      ...choices,
    ];
  }

  const {choice} = await inquirer.prompt({
    type: "list",
    name: "choice",
    message: message,
    choices: choices,
    filter(val) {
      return val.split(" ")[0].toLowerCase();
    }
  });

  return choice;
}


export async function enterProjectPrompt(): Promise<string> {
  const {projectId} = await inquirer.prompt({
    name: "projectId",
    message: "Enter project ID:",
  });
  return projectId;
}
