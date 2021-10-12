import * as core from '@actions/core';
import {getGodot, getTemplates} from 'get-tools';

async function run(): Promise<void> {
  try {
    if (process.platform !== 'linux') {
      throw Error(`Setup Godot is only available for linux runners. Current platform: ${process.platform}`);
    }
    const godotVersion: string = core.getInput('godot-version');

    const godotPath = await getGodot(godotVersion);

    core.info('Adding to path...');
    core.addPath(godotPath);
    core.info(`Godot ${godotVersion} added to path!`);

    const templates: string = core.getInput('download-templates');

    let templatesPath = '';

    if (templates) {
      templatesPath = await getTemplates(godotVersion);
    }

    // core.setOutput('time', new Date().toTimeString());
    core.setOutput('templates', templatesPath);

    core.info(`Godot ${godotVersion} is ready to use!`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
