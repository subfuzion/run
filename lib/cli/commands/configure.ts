import inquirer from "inquirer";

import {Context} from "../context.js";
import * as project from "./project.js";
import {
  billingPrompt, newBillingPrompt, enterProjectPrompt, projectPrompt,
} from "./prompts.js";


export type BillingId = string;
export type ProjectId = string;
export type RegionId = string;
export type ServiceId = string;


/**
 * Check that required settings are configured and only prompt for missing ones.
 */
export async function check(context: Context, requireBilling = true) {
  if (!context.config.global.billingId && requireBilling) {
    await configureBilling(context);
    if (!context.config.global.billingId) {
      context.io.fail("Billing ID is required.");
    }
  }

  if (!context.config.app.service) {
    await configureService(context);
  }

  if (!context.config.app.project) {
    await configureProject(context);
  }

  if (!context.config.app.region) {
    await configureRegion(context);
  }
}


/**
 * Have user confirm (and potentially update) configuration settings.
 */
export async function configure(context: Context, requireBilling = false) {
  await configureBilling(context);
  if (requireBilling && !context.config.global.billingId) {
    context.io.fail("Billing ID is required.");
  }
  await configureService(context);
  await configureProject(context);
  await configureRegion(context);
}


/**
 *
 */
export async function configureBilling(context: Context) {
  let billingId: BillingId = context.config.global.billingId;

  if (billingId) {
    const choice = await billingPrompt(billingId);
    switch (choice) {
    case "continue":
      return;
    case "enter":
      break;
    case "remove":
      context.config.global.billingId = "";
      context.config.global.save();
      return;
    default:
      context.io.fail(`Invalid choice: ${choice}`);
    }
  }

  billingId = await newBillingPrompt();
  if (!billingId) context.io.fail("billing ID is required");
  context.config.global.billingId = billingId;
  context.config.global.save();
}


/**
 *
 */
export async function configureProject(context: Context) {
  const projectId: ProjectId = context.config.app.project;
  const choice = await projectPrompt(projectId);
  switch (choice) {
  case "continue":
    return;
  case "create":
    return await createProject(context);
  case "enter":
    return await enterProject(context);
  case "choose":
    return await chooseProject(context);
  default:
    context.io.fail(`Invalid choice: ${choice}`);
  }
}


/**
 * Enter an existing project ID.
 * TODO: verify that project ID refers to a valid project.
 * @param context
 */
async function enterProject(context: Context) {
  const projectId = await enterProjectPrompt();
  if (!projectId) context.io.fail("Project ID is required.");
  context.config.app.project = projectId;
  context.config.app.save();
  await project.set(context);
}


/**
 * Choose an existing project ID from a list of projects for the account.
 * @param context
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function chooseProject(context: Context) {
  throw new Error("TODO: implement chooseProject.");
  // context.config.app.project = projectId;
  // context.config.app.save();
}


async function createProject(context: Context) {
  const {projectId} = await inquirer.prompt({
    name: "projectId",
    message: "Enter a new globally unique project ID:",
  });
  if (!projectId) context.io.fail("Project ID is required.");
  context.config.app.project = projectId;
  context.config.app.save();
  await configureRegion(context);
  await project.create(context);
}


/**
 *
 */
export async function configureRegion(context: Context) {
  const region: RegionId = context.config.app.region;

  const alreadyConfigured = [
    `Continue using this region (${region})`,
  ];

  let choices: (string | inquirer.Separator)[] = [
    "Enter region for service deployment",
    "TODO: Choose from a list",
  ];

  let message = "Region";

  if (region) {
    message = `Current region: ${region}`;
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
    },
  });

  switch (choice) {
  case "continue":
    return;
  case "enter":
    return await enterRegion(context);
  case "choose":
    return await chooseRegion(context);
  default:
    context.io.fail(`Invalid choice: ${choice}`);
  }
}


async function enterRegion(context: Context) {
  const {region} = await inquirer.prompt({
    name: "region",
    message: "Enter region:",
  });
  if (!region) context.io.fail("Region is required.");
  context.config.app.region = region;
  context.config.app.save();
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function chooseRegion(context: Context) {
  throw new Error("TODO: implement chooseRegion");
}


/**
 *
 */
export async function configureService(context: Context) {
  const service: RegionId = context.config.app.service;

  if (!service) return await enterService(context);

  const alreadyConfigured = [
    `Continue using this service name (${service})`,
  ];

  let choices: (string | inquirer.Separator)[] = [
    "Update service name",
  ];

  let message = "Service name";

  if (service) {
    message = `Current service name: ${service}`;
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
    },
  });

  switch (choice) {
  case "continue":
    return;
  case "update":
    return await enterService(context);
  default:
    context.io.fail(`invalid choice: ${choice}`);
  }
}


async function enterService(context: Context) {
  const {service} = await inquirer.prompt({
    name: "service",
    message: "Enter a name to identify the deployed service:",
  });
  if (!service) context.io.fail("Service name is required.");
  context.config.app.service = service;
  context.config.app.save();
}
