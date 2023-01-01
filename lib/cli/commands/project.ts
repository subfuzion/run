import inquirer from 'inquirer';

import {exec, exited, readable, readableToString} from '../../client/gcloud.js';
import {Client as ProjectClient} from "../../client/project.js";
import {Client as ServiceClient} from "../../client/service.js";
import {Settings} from "../../client/settings.js";
import {Context} from '../context.js';


export function show(context: Context) {
  context.io.print(context.config.app.project);
}


/**
 * @return {Promise<string>}
 */
export async function set(context: Context) {
  const project = context.config.app.project;
  // TODO: verify that project is a valid project ID.
  // context.io.fail(`TODO: verify that ${project} is a valid project ID.`);
  return Promise.resolve();
}


export async function create(context: Context) {
  let billing = context.config.global.billingId;
  let project = context.config.app.project;

  // Create the project.
  try {

    const settings = Settings.createFromContext(context);
    const client = new ProjectClient(settings);
    await client.initialize();

    const proc = exec('gcloud', [
        'projects',
        'create',
        project,
        '--quiet',
    ]);
    const {stdout, stderr} = readable(proc);

    const out = await readableToString(stdout);
    const err = await readableToString(stderr);

    // if (out) {
    //   context.io.print('stdout:');
    //   context.io.write(out);
    //   context.io.print();
    // }

    context.io.write(err);
    context.io.print();

    const {exitCode, signalCode} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${signalCode}`);

  } catch (err: any) {
    context.io.fail(err.message || err);
  }

  // Link billing.
  try {
    const proc = exec('gcloud', [
      'beta',
      'billing',
      'projects',
      'link',
      project,
      '--billing-account',
      billing,
      '--quiet',
    ]);
    const {stdout, stderr} = readable(proc);

    const out = await readableToString(stdout);
    const err = await readableToString(stderr);

    // if (out) {
    //   context.io.print('stdout:');
    //   context.io.write(out);
    //   context.io.print();
    // }
    //
    // context.io.write(err);
    // context.io.print();

    const {exitCode, signalCode} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${signalCode}`);

  } catch (err: any) {
    context.io.fail(err.message || err);
  }

  // Enable services.
  try {
    const settings = new Settings(context.config.app.project, context.io)
    const serviceClient = new ServiceClient(settings);
    await serviceClient.enableServices(context.config.app.googleapis);

  } catch (err: any) {
    context.io.fail(err.message || err);
  }

  try {
    await execute(createDockerRepo, context, 120);
    context.io.print(`done`);
    return project;
  } catch (err: any) {
    context.io.fail(err.message || err);
  }
}


export async function update(context: Context) {
  context.io.print(context.command?.name());
  context.io.log.info(JSON.stringify({...context, command: undefined}));
}


export async function remove(context: Context) {
  const projectId = context.config.app.project;

  const proc = exec('gcloud', [
    `--project=${projectId}`,
    'projects',
    'delete',
    projectId,
    '--quiet',
  ]);

  const {stderr} = readable(proc);
  const err = await readableToString(stderr);

  try {
    const {exitCode, signalCode} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${signalCode}`);
  } catch (ignore) {
    throw (err);
  }
}


// Create Docker repo for project in Artifact Registry.
// https://cloud.google.com/sdk/gcloud/reference/artifacts/repositories/create
// gcloud artifacts repositories create docker-repo --repository-format=docker
async function createDockerRepo(context: Context) {
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
    '--repository-format=docker',
    '--quiet',
  ]);

  const {stderr} = readable(proc);
  const err = await readableToString(stderr);

  try {
    const {exitCode, signalCode} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${signalCode}`);
  } catch (ignore) {
    throw (err);
  }
}


async function execute(op: (context: Context) => void, context: Context, maxSeconds: number) {
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

async function wait(delay: number): Promise<void> {
  delay = delay || 0;
  await new Promise<void>((resolve => {
    setTimeout(() => {
      resolve();
    }, delay);
  }));
}
