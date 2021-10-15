import * as core from "@actions/core";
import { getGodot, getTemplates } from "get-tools";

async function run(): Promise<void> {
  try {
    if (process.platform !== "linux") {
      throw Error(`Setup Godot is only available for linux runners. Current platform: ${process.platform}`);
    }

    const godotVersion: string = core.getInput("godot-version", { required: true });
    const isMono: boolean = core.getBooleanInput("mono", { required: false });
    const templates: boolean = core.getBooleanInput("download-templates", { required: false });

    const versionRegex = /^\d{1,2}\.\d{1,2}(\.\d{1,2})?$/;

    if (!versionRegex.test(godotVersion)) {
      throw Error(`INVALID VERSION: ${godotVersion} is not a valid version number`);
    }

    const godotPath = await getGodot(godotVersion, isMono);

    core.info("Adding to path...");
    core.addPath(godotPath);
    core.info(`Godot ${godotVersion}${isMono ? " Mono" : ""} added to path!`);

    if (templates) {
      await getTemplates(godotVersion, isMono);
    }

    core.info(`Godot ${godotVersion}${isMono ? " Mono" : ""} is ready to use!`);
  } catch (e) {
    const error = e as Error;
    core.setFailed(error.message);
  }
}

run();
