import {ProjectsClient} from "@google-cloud/resource-manager";

import {CloudClient} from "./cloud.js";
import {Settings} from "./settings.js";

/**
 *
 */
export class Client extends CloudClient {
  projectsClient;

  constructor(settings: Settings) {
    super(settings);
    this.projectsClient = new ProjectsClient();
  }

  async initialize(): Promise<void> {
    // const result = await this.projectsClient.initialize();
    // console.log(result);
    await this.projectsClient.initialize();
  }
}
