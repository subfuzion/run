import {exec, exited, readable, readableToString} from '../../client/gcloud.js';

import {check} from './configure.js';
import {Context} from '../context.js';


export async function deploy(context: Context) {
  await check(context);
  const project = context.config.app.project;
  const region = context.config.app.region;
  const service = context.config.app.service;
  const source = ".";

  const proc = exec('gcloud', [
    '--project', project,
    'run',
    'deploy',
    service,
    `--source=${source}`,
    '--allow-unauthenticated',
    `--region=${region}`,
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
  // context.io.print('-----');
  context.io.write(err);
  context.io.print();

  const {exitCode, signalCode} = await exited(proc);
  context.io.log.info(`exit code: ${exitCode}, exit signal: ${signalCode}`);
}


export async function undeploy(context: Context) {
  context.io.print(context.command?.name());
  context.io.log.info(JSON.stringify({...context, command: undefined}));
}


export async function logs(context: Context) {
  const region = context.config.app.region;
  const service = context.config.app.service;
  const project = context.config.app.project;
  const url = `https://console.cloud.google.com/run/detail/${region}/${service}/logs?project=${project}`;

  if (region && service && project) {
    context.io.print("Open the following link in your browser:");
    context.io.print(url);
  } else {
    context.io.fail("Current project is not configured yet (try `run configure`).");
  }
}
