import inquirer from 'inquirer';

import {exec, exited, readable, readableToString} from '../../client/gcloud.js';
import {Client as ServiceClient} from '../../client/service.js';


export function show(context) {
  context.io.print(context.config.project);
}


/**
 * @return {Promise<string>}
 */
export async function set(context) {
  const projectId = context.config.app.project;
  context.io.fail(`TODO: verify that ${projectId} is a valid project ID`);
  return Promise.resolve();
}


export async function create(context) {
  let billingId, projectId, region;

  // Prompt for required info: billing id, project id
  try {
    billingId = context.config.global.billingId;
    if (!billingId) {
      const question = {
        name: 'billingId',
        message: 'Enter billing ID (https://console.cloud.google.com/billing):',
      };
      const answer = await inquirer.prompt(question);
      if (!answer.billingId) {
        context.io.fail('billing ID is required');
      }
      context.config.global.billingId = billingId = answer.billingId;
      context.config.global.save();
    }

    projectId = context.config.app.project;
    if (!projectId) {
      const question = {
        name: 'projectId',
        message: 'Enter a globally unique identifier for your project ID:'
      };
      const answer = await inquirer.prompt(question);
      if (!answer.projectId) {
        context.io.fail('project ID is required');
      }
      context.config.app.project = projectId = answer.projectId;
      context.config.app.save();
    }

    region = context.config.app.region;
    if (!region) {
      const question = {
        name: 'region',
        message: 'Enter the region to use for your project:'
      };
      const answer = await inquirer.prompt(question);
      if (!answer.region) {
        context.io.fail(`region is required`);
      }
      context.config.app.region = answer.region;
      context.config.app.save();
    }

  } catch (err) {
    context.io.fail(err.message);
  }

  // Create the project.
  try {
    const proc = exec('gcloud', ['projects', 'create', projectId]);
    const {stdout, stderr} = readable(proc);

    const out = await readableToString(stdout);
    const err = await readableToString(stderr);

    if (out) {
      context.io.print('stdout:');
      context.io.write(out);
      context.io.print();
    }

    context.io.print('-----');
    context.io.write(err);
    context.io.print();

    const {exitCode, exitSignal} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${exitSignal}`);

  } catch (err) {
    context.io.fail(err.message);
  }

  // Link billing.
  try {
    const proc = exec('gcloud', [
      'beta', 'billing', 'projects', 'link', projectId, '--billing-account',
      billingId
    ]);
    const {stdout, stderr} = readable(proc);

    const out = await readableToString(stdout);
    const err = await readableToString(stderr);

    if (out) {
      context.io.print('stdout:');
      context.io.write(out);
      context.io.print();
    }

    context.io.print('-----');
    context.io.write(err);
    context.io.print();

    const {exitCode, exitSignal} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${exitSignal}`);

  } catch (err) {
    context.io.fail(err.message);
  }

  // Enable services.
  try {
    const serviceClient = new ServiceClient(context);
    await serviceClient.enableServices();

  } catch (err) {
    context.io.fail(err.message);
  }

  try {
    await execute(createDockerRepo, context, 120);
    context.io.print(`done.`);
    return projectId;
  } catch (err) {
    context.io.fail(err.message);
  }
}


export async function update(context) {
  context.io.print(context.command.name());
  context.io.log.info(JSON.stringify({...context, command: undefined}));
}


export async function remove(context) {
  const projectId = context.config.app.project;

  const proc = exec('gcloud', [
    `--project=${projectId}`,
    'projects',
    'delete',
    projectId,
  ]);

  const {stderr} = readable(proc);
  const err = await readableToString(stderr);

  try {
    const {exitCode, exitSignal} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${exitSignal}`);
  } catch (ignore) {
    throw (err);
  }
}


// Create Docker repo for project in Artifact Registry.
// https://cloud.google.com/sdk/gcloud/reference/artifacts/repositories/create
// gcloud artifacts repositories create docker-repo --repository-format=docker
async function createDockerRepo(context) {
  const repo = 'docker-repo';
  const projectId = context.config.app.project;
  const region = context.config.app.region;

  const proc = exec('gcloud', [
    `--project=${projectId}`,
    'artifacts',
    'repositories',
    'create',
    repo,
    `--location=${region}`,
    '--repository-format=docker'
  ]);
  const {stderr} = readable(proc);

  const err = await readableToString(stderr);

  try {
    const {exitCode, exitSignal} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${exitSignal}`);
  } catch (ignore) {
    throw (err);
  }
}


async function execute(op, context, maxSeconds) {
  const startTime = Date.now();
  let delay = 5000;
  // let count = 0;

  while (true) {
    try {
      return await op(context);
    } catch (e) {
      if ((Date.now() - startTime) / 1000 > maxSeconds) throw e;
      // delay += Math.min(Math.floor(count++ * delay * Math.random()), 30000);
      context.io.print(`waiting for services to settle...`);
      await wait(delay);
    }
  }
}

async function wait(delay) {
  delay = delay || 0;
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}
