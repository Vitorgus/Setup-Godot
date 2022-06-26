import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";
import path from "path";

export async function getGodot(version: string, mono: boolean): Promise<string> {
  const godotLabel = "Godot " + version + (mono ? " Mono" : "");
  const godotCacheVersion = version + (mono ? "-mono" : "");

  let godotPath = tc.find("godot", godotCacheVersion);

  if (godotPath) {
    core.info(`${godotLabel} found in cache! Path: ${godotPath}`);
    return godotPath;
  }

  const platformTag = process.platform === "win32" ? "windows" : "linux";

  const godotDownloadFile = getFileName(version, mono);

  const baseUrl = "https://downloads.tuxfamily.org/godotengine";
  const monoUrl = mono ? "mono/" : "";
  const downloadUrl = `${baseUrl}/${version}/${monoUrl}${godotDownloadFile}.zip`;

  core.info(`Attempting to download ${godotLabel} for ${platformTag} from ${downloadUrl}`);
  const godotDownloadPath = await tc.downloadTool(downloadUrl);
  core.info(`${godotLabel} donwloaded sucessfully!`);

  core.info(`Attempting to extract ${godotLabel}...`);
  const godotExtractPath = await tc.extractZip(godotDownloadPath);
  core.info(`${godotLabel} extracted to ${godotExtractPath}`);

  core.info("Adding to cache...");
  if (mono) {
    await io.mv(
      path.normalize(
        `${godotExtractPath}/${godotDownloadFile}/${getFileName(version, mono, true)}`
      ),
      path.normalize(`${godotExtractPath}/${godotDownloadFile}/godot`)
    );
    godotPath = await tc.cacheDir(
      path.normalize(`${godotExtractPath}/${godotDownloadFile}`),
      "godot",
      godotCacheVersion
    );
  } else {
    godotPath = await tc.cacheFile(
      path.normalize(`${godotExtractPath}/${godotDownloadFile}`),
      "godot",
      "godot",
      godotCacheVersion
    );
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

    const downloadUrl = `https://downloads.tuxfamily.org/godotengine/${version}/${
      mono ? "mono/" : ""
    }${templatesFileName}.tpz`;

    core.info(`Attempting to download ${templatesLabel} export templates from ${downloadUrl}`);
    const templatesDownloadPath = await tc.downloadTool(downloadUrl);
    core.info(`${templatesLabel} donwloaded sucessfully!`);

    core.info(`Attempting to extract ${templatesLabel}`);
    const templatesExtractPath = await tc.extractZip(templatesDownloadPath);
    core.info(`${templatesLabel} extracted to ${templatesExtractPath}`);

    core.info("Adding to cache...");
    templatesCachePath = await tc.cacheDir(
      path.normalize(`${templatesExtractPath}/templates`),
      "godot-export-templates",
      tenplatesCacheVersion
    );
    core.info(`${templatesLabel} cached!`);
  }

  const basePath =
    process.platform === "win32"
      ? `${process.env.APPDATA}/Godot`
      : `${process.env.HOME}/.local/share/godot`;
  const templatesPath = path.normalize(
    `${basePath}/templates/${version}.stable${mono ? ".mono" : ""}`
  );

  await io.rmRF(templatesPath);
  await io.cp(templatesCachePath, templatesPath, { recursive: true });

  core.info(`${templatesLabel} copied to folder ${templatesPath}!`);
}

function getFileName(version: string, mono: boolean, monoFile = false): string {
  const basePath = `Godot_v${version}-stable_`;
  const monoPath = mono ? "mono_" : "";
  const archPath = process.arch === "x64" ? "64" : "32";
  const winExeExtension = process.platform === "win32" && !mono ? ".exe" : "";

  let osPath: string;

  if (process.platform === "win32") {
    osPath = "win";
  } else {
    osPath = "linux_headless" + (mono && !monoFile ? "_" : ".");
  }

  return basePath + monoPath + osPath + archPath + winExeExtension;
}
