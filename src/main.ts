import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

async function run(): Promise<void> {
  try {
    const godotVersion: string = core.getInput('godot-version');

    let godot_exec = '';

    if (process.platform === 'win32') {
      core.info(`Downloading Godot ${godotVersion} for windows`);
      godot_exec = 'win32.exe';
    } else if (process.platform === 'linux') {
      core.info(`Downloading Godot ${godotVersion} headless for linux`);
      godot_exec = 'linux_headless.64';
    } else {
      throw Error(`Unsuported OS: ${process.platform}`);
    }

    const godotPath = await tc.downloadTool(
      `https://downloads.tuxfamily.org/godotengine/${godotVersion}/Godot_v${godotVersion}-stable_${godot_exec}.zip`
    );
    core.info(`Godot ${godotVersion} donwloaded sucessfull!`);

    core.info(`Extracting Godot ${godotVersion}`);
    const godotExtractPath = await tc.extractZip(godotPath, undefined);
    core.info(`Godot ${godotVersion} extracted to ${godotExtractPath}`);

    core.info('Adding to cache and path');
    const godotCachedPath = await tc.cacheDir(
      godotExtractPath,
      'godot',
      godotVersion
    );
    core.addPath(godotCachedPath);
    core.info('Done!');

    core.info(`Godot ${godotVersion} is ready to use!`);

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
