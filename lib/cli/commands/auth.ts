import {exec, exited, readable, readableToString} from "../../client/gcloud.js";
import {Context} from "../context.js";


export async function login(context: Context): Promise<void> {
  // TODO: remove userLogin when gcloud command wrappers are converted to
  // client API calls.
  context.io.print(`Requesting user credentials...`);
  await userLogin(context);

  // Request application default credentials to use client library.
  context.io.print(`Authorizing CLI...`);
  await appLogin(context);
}


export async function logout(context: Context): Promise<void> {
  const proc = exec("gcloud", ["auth", "revoke"]);
  const {stdout, stderr} = readable(proc);

  // Must check both stdout and stderr to catch all revoked account credentials.
  // on success: stdout -> Revoked credentials: - account(s)
  // on success: stderr -> Credentialed Accounts ... accounts(s)
  const out = await readableToString(stdout);
  const err = await readableToString(stderr);

  if (err.match(/^ERROR:.*No credentials available to revoke.$/m)) {
    context.io.print("Already logged out.");
    return;
  }

  const accountRegex = /([A-Z][A-Z0-9+_.-]+@[A-Z0-9.-]+)/gim;
  const outMatches = err.match(accountRegex);
  const errMatches = out.match(accountRegex);

  // Shouldn't be overlap, but just in case:
  const matches = Array.from(new Set([
    ...outMatches || [],
    ...errMatches || []
  ]));

  if (matches && matches.length) {
    context.io.write("Logged out: ");
    context.io.write(matches[0]);
    for (let i = 1; i < matches.length; i++) {
      context.io.write(`, ${matches[i]}`);
    }
    context.io.print();
  }

  try {
    const {exitCode, signalCode} = await exited(proc);
    context.io.log.info(`exit code: ${exitCode}, exit signal: ${signalCode}`);
  } catch (e: any) {
    if (e.message?.includes("No credentials available to revoke")) {
      context.io.print("Already logged out.");
    } else {
      context.io.log.error(e.message);
    }
  }
}

async function userLogin(context: Context): Promise<void> {
  const proc = exec("gcloud", ["auth", "login"]);
  const {stderr} = readable(proc);
  const output = await readableToString(stderr);

  const accountRegex = /You are now logged in as \[([^\]]*)\]\./m;
  const accountMatch = output.match(accountRegex);
  if (accountMatch && accountMatch.length) {
    context.io.print(`Logged in as: ${accountMatch[1]}`);
  }

  const {exitCode, signalCode} = await exited(proc);
  context.io.log.info(`exit code: ${exitCode}, exit signal: ${signalCode}`);
}


async function appLogin(context: Context): Promise<void> {
  const proc = exec("gcloud", [
    "auth", "application-default", "login", "--disable-quota-project"
  ]);
  const {stderr} = readable(proc);
  const output = await readableToString(stderr);

  const credentialsRegex = /Credentials saved to file:\s*\[([^\]]*)\]/m;
  const credentialsMatch = output.match(credentialsRegex);
  if (credentialsMatch && credentialsMatch.length) {
    context.io.print(`Credentials saved to file: ${credentialsMatch[1]}`);
  }

  const {exitCode, signalCode} = await exited(proc);
  context.io.log.info(`exit code: ${exitCode}, exit signal: ${signalCode}`);
}
