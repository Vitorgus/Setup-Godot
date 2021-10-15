import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";

export async function getGodot(version: string, mono: boolean): Promise<string> {
  const godotLabel = "Godot " + version + (mono ? " Mono" : "");
  const godotCacheVersion = version + (mono ? "-mono" : "");

  let godotPath = tc.find("godot", godotCacheVersion, process.platform);

  if (godotPath) {
    core.info(`${godotLabel} found in cache! Path: ${godotPath}`);
    return godotPath;
  }

  core.info(`Attempting to download ${godotLabel} headless for linux...`);

  const godotFileName = `Godot_v${version}-stable_${mono ? "mono_" : ""}linux_headless${mono ? "_" : "."}64`;

  const godotDownloadPath = await tc.downloadTool(`https://downloads.tuxfamily.org/godotengine/${version}/${mono ? "mono/" : ""}${godotFileName}.zip`);
  core.info(`${godotLabel} donwload sucessfull!`);

  core.info(`Attempting to extract ${godotLabel}`);
  const godotExtractPath = await tc.extractZip(godotDownloadPath, undefined);
  core.info(`${godotLabel} extracted to ${godotExtractPath}`);

  core.info("Adding to cache...");
  godotPath = await tc.cacheFile(`${godotExtractPath}/${godotFileName}`, "godot", "godot", godotCacheVersion, process.platform);
  core.info(`${godotLabel} cached!`);

  return godotPath;
}

export async function getTemplates(version: string, mono: boolean): Promise<void> {
  const templatesLabel = "Export Templates for " + version + (mono ? " Mono" : "");
  const tenplatesCacheVersion = version + (mono ? "-mono" : "");

  let templatesCachePath = tc.find("godot-export-templates", tenplatesCacheVersion, process.platform);

  if (templatesCachePath) {
    core.info(`${templatesLabel} found in cache! Path: ${templatesCachePath}`);
  } else {
    const templatesFileName = `Godot_v${version}-stable_${mono ? "mono_" : ""}export_templates`;

    core.info(`Attempting to download ${templatesLabel} export templates...`);
    const templatesDownloadPath = await tc.downloadTool(
      `https://downloads.tuxfamily.org/godotengine/${version}/${mono ? "mono/" : ""}${templatesFileName}.tpz`
    );
    core.info(`${templatesLabel} donwload sucessfull!`);

    core.info(`Attempting to extract ${templatesLabel}`);
    const templatesExtractPath = await tc.extractZip(templatesDownloadPath, undefined);
    core.info(`${templatesLabel} extracted to ${templatesExtractPath}`);

    core.info("Adding to cache...");
    templatesCachePath = await tc.cacheDir(`${templatesExtractPath}/templates`, "godot-export-templates", tenplatesCacheVersion, process.platform);
    core.info(`${templatesLabel} cached!`);
  }

  const templatesPath = `/home/runner/.local/share/godot/templates/${version}.stable${mono ? ".mono" : ""}`;

  await io.rmRF(templatesPath);
  await io.cp(templatesCachePath, templatesPath, { recursive: true });

  core.info(`${templatesLabel} copied to folder ${templatesPath}!`);
}
