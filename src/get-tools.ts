import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";

export async function getGodot(version: string, mono: boolean): Promise<string> {
  const godotLabel = "Godot " + version + (mono ? " Mono" : "");
  const godotCacheVersion = version + (mono ? "-mono" : "");

  let godotPath = tc.find("godot", godotCacheVersion);

  if (godotPath) {
    core.info(`${godotLabel} found in cache! Path: ${godotPath}`);
    return godotPath;
  }

  core.info(`Attempting to download ${godotLabel} headless for linux...`);

  const godotFileName = getFileName(version, mono);

  const baseUrl = "https://downloads.tuxfamily.org/godotengine";
  const monoUrl = mono ? "mono/" : "";
  const extension = process.platform === "win32" ? "exe.zip" : "zip";

  const godotDownloadPath = await tc.downloadTool(`${baseUrl}/${version}/${monoUrl}${godotFileName}.${extension}`);
  core.info(`${godotLabel} donwload sucessfull!`);

  core.info(`Attempting to extract ${godotLabel}`);
  const godotExtractPath = await tc.extractZip(godotDownloadPath);
  core.info(`${godotLabel} extracted to ${godotExtractPath}`);

  core.info("Adding to cache...");
  if (mono) {
    await io.mv(`${godotExtractPath}/${godotFileName}/${godotFileName}`, `${godotExtractPath}/${godotFileName}/godot`);
    godotPath = await tc.cacheDir(`${godotExtractPath}/${godotFileName}`, "godot", godotCacheVersion);
  } else {
    godotPath = await tc.cacheFile(`${godotExtractPath}/${godotFileName}`, "godot", "godot", godotCacheVersion);
  }

  core.info(`${godotLabel} cached!`);

  return godotPath;
}

export async function getTemplates(version: string, mono: boolean): Promise<void> {
  const templatesLabel = "Export Templates for " + version + (mono ? " Mono" : "");
  const tenplatesCacheVersion = version + (mono ? "-mono" : "");

  let templatesCachePath = tc.find("godot-export-templates", tenplatesCacheVersion);

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
    const templatesExtractPath = await tc.extractZip(templatesDownloadPath);
    core.info(`${templatesLabel} extracted to ${templatesExtractPath}`);

    core.info("Adding to cache...");
    templatesCachePath = await tc.cacheDir(`${templatesExtractPath}/templates`, "godot-export-templates", tenplatesCacheVersion);
    core.info(`${templatesLabel} cached!`);
  }

  const templatesPath = `/home/runner/.local/share/godot/templates/${version}.stable${mono ? ".mono" : ""}`;

  await io.rmRF(templatesPath);
  await io.cp(templatesCachePath, templatesPath, { recursive: true });

  core.info(`${templatesLabel} copied to folder ${templatesPath}!`);
}

function getFileName(version: string, mono: boolean): string {
  const basePath = `Godot_v${version}-stable_`;
  const monoPath = mono ? "mono_" : "";
  const archPath = process.arch === "x64" ? "64" : "32";
  const osPath = "linux_headless" + (mono ? "_" : ".");

  return basePath + monoPath + osPath + archPath;
}
