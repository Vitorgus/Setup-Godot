import * as core from '@actions/core';
import {getGodot} from 'get-tools';

async function run(): Promise<void> {
  try {
    const godotVersion: string = core.getInput('godot-version');

    const godotPath = await getGodot(godotVersion);

    core.info('Adding to path...');
    core.addPath(godotPath);
    core.info(`Godot ${godotVersion} added to path!`);

    core.info(`Godot ${godotVersion} is ready to use!`);

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
