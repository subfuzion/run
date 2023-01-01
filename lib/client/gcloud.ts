import {
  ChildProcessWithoutNullStreams, spawn, SpawnOptionsWithoutStdio
} from "node:child_process";
import {Readable} from "node:stream";
import * as streamWeb from "node:stream/web";


export function exec(
    cmd: string,
    args?: readonly string[],
    opts?: SpawnOptionsWithoutStdio,
    abortController?: AbortController): ChildProcessWithoutNullStreams {
  opts = opts || {
    stdio: ["ignore", "pipe", "pipe"],
  } as SpawnOptionsWithoutStdio;
  if (abortController) opts.signal = abortController.signal;
  return spawn(cmd, args, opts);
}


/**
 * Returns web streams for `stdout` and `stderr`. For this to work, process must
 * be spawned with options for `stdio` to pipe to either `stdout`, `stderr`, or
 * both.
 */
export function readable(proc: ChildProcessWithoutNullStreams): {stdout: streamWeb.ReadableStream, stderr: streamWeb.ReadableStream} {
  const streams = {} as any;
  if (proc.stdout) streams.stdout = Readable.toWeb(proc.stdout.setEncoding(
      "utf-8"));
  if (proc.stderr) streams.stderr = Readable.toWeb(proc.stderr.setEncoding(
      "utf-8"));
  return streams;
}


export async function readableToString(readableStream: streamWeb.ReadableStream) {
  const reader = readableStream.getReader();
  try {
    let buf = "";
    while (true) {
      const {done, value} = await reader.read();
      if (done) {
        return buf;
      }
      buf += value;
    }
  } finally {
    reader.releaseLock();
  }
}


export async function exited(proc: ChildProcessWithoutNullStreams): Promise<{exitCode:number, signalCode:NodeJS.Signals|null}> {
  return new Promise((resolve, reject) => {
    proc.once("exit", (exitCode, signalCode) => {
      if (exitCode === 0) {
        resolve({exitCode, signalCode});
      } else {
        reject(new Error(`child process returned with exit code: ${exitCode}, signal code: ${signalCode}`));
      }
    });
    proc.once("error", err => {
      reject(err);
    });
  });
}


