import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
// import {wait} from './wait';

async function run(): Promise<void> {
  try {
    // const ms: string = core.getInput('milliseconds');

    const godotPath = await tc.downloadTool(
      'https://downloads.tuxfamily.org/godotengine/3.3.4/Godot_v3.3.4-stable_linux_headless.64.zip'
    );
    core.info(`Godot donwloaded to ${godotPath}`);

    // core.info('This is an info message.');
    // console.log('This is a console.log message');

    core.info(`The plataform is ${process.platform}`);

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
