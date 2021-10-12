import * as core from "@actions/core";
import { getGodot, getTemplates } from "get-tools";

async function run(): Promise<void> {
  try {
    if (process.platform !== "linux") {
      throw Error(`Setup Godot is only available for linux runners. Current platform: ${process.platform}`);
    }

    const godotVersion: string = core.getInput("godot-version");

    const versionRegex = /^\d{1,2}\.\d{1,2}(\.\d{1,2})?$/;

    if (!versionRegex.test(godotVersion)) {
      throw Error(`INVALID VERSION: ${godotVersion} is not a valid version number`);
    }

    const godotPath = await getGodot(godotVersion);

    core.info("Adding to path...");
    core.addPath(godotPath);
    core.info(`Godot ${godotVersion} added to path!`);

    const templates: string = core.getInput("download-templates");

    if (templates) {
      await getTemplates(godotVersion);
    }

    // core.setOutput('time', new Date().toTimeString());

    core.info(`Godot ${godotVersion} is ready to use!`);
  } catch (e) {
    const error = e as Error;
    core.setFailed(error.message);
  }
}

run();
