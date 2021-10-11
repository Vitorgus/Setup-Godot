import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

export async function getGodot(version: string): Promise<string> {
  let godotPath = tc.find('godot', version, process.platform);

  if (godotPath) {
    core.info(`Godot ${version} found in cache! Path: ${godotPath}`);
    return godotPath;
  }

  let godot_exec = '';

  if (process.platform === 'win32') {
    core.info(`Attempting to download Godot ${version} for windows...`);
    godot_exec = 'win32.exe';
  } else if (process.platform === 'linux') {
    core.info(`Attempting to download Godot ${version} headless for linux...`);
    godot_exec = 'linux_headless.64';
  } else {
    throw Error(`Unsuported OS: ${process.platform}`);
  }

  const godotFileName = `Godot_v${version}-stable_${godot_exec}`;

  const godotDownloadPath = await tc.downloadTool(`https://downloads.tuxfamily.org/godotengine/${version}/${godotFileName}.zip`);
  core.info(`Godot ${version} donwload sucessfull!`);

  core.info(`Attempting to extracting Godot ${version}`);
  const godotExtractPath = await tc.extractZip(godotDownloadPath, undefined);
  core.info(`Godot ${version} extracted to ${godotExtractPath}`);

  core.info('Adding to cache...');
  godotPath = await tc.cacheFile(`${godotExtractPath}/${godotFileName}`, 'godot', 'godot', version, process.platform);
  core.info(`Godot ${version} cached!`);

  return godotPath;
}