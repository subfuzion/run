import {ServiceUsageClient} from "@google-cloud/service-usage";
import {google} from "@google-cloud/service-usage/build/protos/protos.js";

import IBatchEnableServicesResponse = google.api.serviceusage.v1.IBatchEnableServicesResponse;
import IService = google.api.serviceusage.v1.IService;

import {CloudClient} from "./cloud.js";
import {Settings} from "./settings.js";

export class Client extends CloudClient {
  serviceUsageClient;

  constructor(settings: Settings) {
    super(settings);
    this.serviceUsageClient = new ServiceUsageClient();
  }

  async listServices(filter: string) {
    const services = [];
    const client = this.serviceUsageClient;
    const parent = this.projectParent;

    // see CallOptions
    for await (const service of client.listServicesAsync({parent, filter})) {
      services.push(service);
    }
    return services;
  }

  async enableServices(services: string[]) {
    const printer = this.printer;
    const client = this.serviceUsageClient;
    const parent = this.projectParent;
    let serviceIds = services;

    const suffix = ".googleapis.com";
    serviceIds = serviceIds.map(id => id.endsWith(suffix) ? id : id + suffix);

    const request = {
      parent: parent,
      serviceIds: serviceIds,
    };

    try {
      const [operation] = await client.batchEnableServices(request);
      const timeout = 1000 * 60 * 5;
      const timer = setTimeout(() => {
        operation.cancel();
        throw new Error(`operation timed out (${operation.name})`);
      }, timeout);

      const result = await new Promise(async (resolve) => {
        async function check(operation: any, resolve: any) {
          const op = await client.checkBatchEnableServicesProgress(operation.name);
          printer.print("checking operation status...");
          if (!op.done) {
            // console.log(op.metadata);
            setTimeout(() => check(operation, resolve), 1000);
          } else {
            clearTimeout(timer);
            printer.print("done");
            // console.log(op.result);
            resolve(op.result);
          }
        }

        await check(operation, resolve);
      });

      // google.api.serviceusage.v1.IService[]
      const services = (result as IBatchEnableServicesResponse).services;
      return services?.sort()
                     .map((s: IService) => printer.print("- " +
                                                     s.name!.split("/")!.at(-1)!.replace(
                                                         suffix,
                                                         "")));

      // async function check(operation) {
      //   return await new Promise(async resolve => {
      //     console.log("await");
      //     setTimeout(async () => {
      //       const op = await
      // client.checkBatchEnableServicesProgress(operation.name); resolve(op);
      // }, 1000); }); }  let done = false; const start = Date.now(); const
      // timeout = 1000 * 60 * 5; while (!done) { const elapsed = Date.now() -
      // start; if (elapsed >= timeout) { throw new Error(`operation timed out
      // (${operation.name})`); } const op = await check(operation); done =
      // op.done; if (!done) { console.log(op.metadata); } else {
      // console.log("done"); console.log(op.result); } }

      // console.log("await again?")
      // const [response] = await operation.promise();
      // return response.services;
    } catch (e: any) {
      throw new Error(`${e.details?.split("\n")[0] || e.message}`);
    }
  }

}


