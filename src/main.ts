import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

async function run(): Promise<void> {
  try {
    const godotVersion: string = core.getInput('godot-version');

    core.startGroup("Here's the process.env");
    core.info(JSON.stringify(process.env));
    core.endGroup();

    core.info(`Downloading Godot ${godotVersion}`);

    const godotPath = await tc.downloadTool(
      `https://downloads.tuxfamily.org/godotengine/${godotVersion}/Godot_v${godotVersion}-stable_linux_headless.64.zip`
    );
    core.info(`Godot ${godotVersion} donwloaded to ${godotPath}`);

    core.info(`The plataform is ${process.platform} by process.platform`);
    core.info(`The plataform is ${process.env['RUNNER_OS']} by runner os`);

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
