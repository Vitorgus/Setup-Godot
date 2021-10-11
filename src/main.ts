import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

async function run(): Promise<void> {
  try {
    const godotVersion: string = core.getInput('godot-version');

    let godotPath = tc.find('godot', godotVersion, process.platform);

    if (godotPath) {
      core.info(`Godot ${godotVersion} found in cache! Path: ${godotPath}`);
    } else {
      let godot_exec = '';

      if (process.platform === 'win32') {
        core.info(`Attempting to download Godot ${godotVersion} for windows...`);
        godot_exec = 'win32.exe';
      } else if (process.platform === 'linux') {
        core.info(`Attempting to download Godot ${godotVersion} headless for linux...`);
        godot_exec = 'linux_headless.64';
      } else {
        throw Error(`Unsuported OS: ${process.platform}`);
      }

      const godotFileName = `Godot_v${godotVersion}-stable_${godot_exec}`;

      const godotDownloadPath = await tc.downloadTool(`https://downloads.tuxfamily.org/godotengine/${godotVersion}/${godotFileName}.zip`);
      core.info(`Godot ${godotVersion} donwload sucessfull!`);

      core.info(`Attempting to extracting Godot ${godotVersion}`);
      const godotExtractPath = await tc.extractZip(godotDownloadPath, undefined);
      core.info(`Godot ${godotVersion} extracted to ${godotExtractPath}`);

      core.info('Adding to cache...');
      godotPath = await tc.cacheFile(`${godotExtractPath}/${godotFileName}`, 'godot', 'godot', godotVersion, process.platform);
      core.info(`Godot ${godotVersion} cached!`);
    }

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
