import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";

import { getGodot, getTemplates } from "../src/get-tools";

jest.mock("@actions/core");
jest.mock("@actions/tool-cache");
jest.mock("@actions/io");

const mockTcFind = jest.mocked(tc.find);
const mockTcDownloadTool = jest.mocked(tc.downloadTool);
const mockTcExtrackZip = jest.mocked(tc.extractZip);
const mockTcCacheFile = jest.mocked(tc.cacheFile);
const mockTcCacheDir = jest.mocked(tc.cacheDir);

const mockIoMv = jest.mocked(io.mv);
const mockIoRmRF = jest.mocked(io.rmRF);
const mockIoCp = jest.mocked(io.cp);

describe("getGodot tests", () => {
  test("Cache test standard", async () => {
    mockTcFind.mockReturnValue("/path/to/existing/cached/godot");

    const result = await getGodot("3.3.2", false);

    expect(mockTcFind).toHaveBeenCalledWith("godot", "3.3.2");
    expect(result).toBe("/path/to/existing/cached/godot");
  });

  test("Download test standard", async () => {
    mockTcFind.mockReturnValue("");
    mockTcDownloadTool.mockResolvedValue("/path/to/downloaded/godot");
    mockTcExtrackZip.mockResolvedValue("/path/to/extracted/godot");
    mockTcCacheFile.mockResolvedValue("/path/to/cached/godot");

    const result = await getGodot("3.1.1", false);

    expect(mockTcDownloadTool).toHaveBeenCalledWith(
      "https://downloads.tuxfamily.org/godotengine/3.1.1/Godot_v3.1.1-stable_linux_headless.64.zip"
    );
    expect(mockTcCacheFile).toHaveBeenCalledWith(
      "/path/to/extracted/godot/Godot_v3.1.1-stable_linux_headless.64",
      "godot",
      "godot",
      "3.1.1"
    );
    expect(result).toBe("/path/to/cached/godot");
  });

  test("Cache test mono", async () => {
    mockTcFind.mockReturnValue("/path/to/existing/cached/godot-mono");

    const result = await getGodot("3.2.3", true);

    expect(mockTcFind).toHaveBeenCalledWith("godot", "3.2.3-mono");
    expect(result).toBe("/path/to/existing/cached/godot-mono");
  });

  test("Download test mono", async () => {
    mockTcFind.mockReturnValue("");
    mockTcDownloadTool.mockResolvedValue("/path/to/downloaded/godot-mono");
    mockTcExtrackZip.mockResolvedValue("/path/to/extracted/godot-mono");
    mockTcCacheDir.mockResolvedValue("/path/to/cached/godot-mono");

    const result = await getGodot("3.3.3", true);

    expect(mockTcDownloadTool).toHaveBeenCalledWith(
      "https://downloads.tuxfamily.org/godotengine/3.3.3/mono/Godot_v3.3.3-stable_mono_linux_headless_64.zip"
    );
    expect(mockIoMv).toHaveBeenCalledWith(
      "/path/to/extracted/godot-mono/Godot_v3.3.3-stable_mono_linux_headless_64/Godot_v3.3.3-stable_mono_linux_headless.64",
      "/path/to/extracted/godot-mono/Godot_v3.3.3-stable_mono_linux_headless_64/godot"
    );
    expect(mockTcCacheDir).toHaveBeenCalledWith(
      "/path/to/extracted/godot-mono/Godot_v3.3.3-stable_mono_linux_headless_64",
      "godot",
      "3.3.3-mono"
    );
    expect(result).toBe("/path/to/cached/godot-mono");
  });
});

describe("getTemplates tests", () => {
  test("Cache test standard", async () => {
    mockTcFind.mockReturnValue("/path/to/existing/cached/godot-templates");

    await getTemplates("3.3.2", false);

    expect(mockTcFind).toHaveBeenCalledWith("godot-export-templates", "3.3.2");
    expect(mockIoRmRF).toHaveBeenCalledWith(
      "/home/runner/.local/share/godot/templates/3.3.2.stable"
    );
    const cpOptions = { recursive: true };
    expect(mockIoCp).toHaveBeenCalledWith(
      "/path/to/existing/cached/godot-templates",
      "/home/runner/.local/share/godot/templates/3.3.2.stable",
      cpOptions
    );
  });

  test("Download test standard", async () => {
    mockTcFind.mockReturnValue("");
    mockTcDownloadTool.mockResolvedValue("/path/to/downloaded/godot-templates");
    mockTcExtrackZip.mockResolvedValue("/path/to/extracted/godot-templates");
    mockTcCacheDir.mockResolvedValue("/path/to/cached/godot-templates");

    await getTemplates("3.1.1", false);

    expect(mockTcDownloadTool).toHaveBeenCalledWith(
      "https://downloads.tuxfamily.org/godotengine/3.1.1/Godot_v3.1.1-stable_export_templates.tpz"
    );
    expect(mockTcCacheDir).toHaveBeenCalledWith(
      "/path/to/extracted/godot-templates/templates",
      "godot-export-templates",
      "3.1.1"
    );
    expect(mockIoRmRF).toHaveBeenCalledWith(
      "/home/runner/.local/share/godot/templates/3.1.1.stable"
    );
    const cpOptions = { recursive: true };
    expect(mockIoCp).toHaveBeenCalledWith(
      "/path/to/cached/godot-templates",
      "/home/runner/.local/share/godot/templates/3.1.1.stable",
      cpOptions
    );
  });

  test("Cache test mono", async () => {
    mockTcFind.mockReturnValue("/path/to/existing/cached/godot-mono-templates");

    await getTemplates("3.2.3", true);

    expect(mockTcFind).toHaveBeenCalledWith("godot-export-templates", "3.2.3-mono");
    expect(mockIoRmRF).toHaveBeenCalledWith(
      "/home/runner/.local/share/godot/templates/3.2.3.stable.mono"
    );
    const cpOptions = { recursive: true };
    expect(mockIoCp).toHaveBeenCalledWith(
      "/path/to/existing/cached/godot-mono-templates",
      "/home/runner/.local/share/godot/templates/3.2.3.stable.mono",
      cpOptions
    );
  });

  test("Download test mono", async () => {
    mockTcFind.mockReturnValue("");
    mockTcDownloadTool.mockResolvedValue("/path/to/downloaded/godot-mono-templates");
    mockTcExtrackZip.mockResolvedValue("/path/to/extracted/godot-mono-templates");
    mockTcCacheDir.mockResolvedValue("/path/to/cached/godot-mono-templates");

    await getTemplates("3.3.3", true);

    expect(mockTcDownloadTool).toHaveBeenCalledWith(
      "https://downloads.tuxfamily.org/godotengine/3.3.3/mono/Godot_v3.3.3-stable_mono_export_templates.tpz"
    );
    expect(mockTcCacheDir).toHaveBeenCalledWith(
      "/path/to/extracted/godot-mono-templates/templates",
      "godot-export-templates",
      "3.3.3-mono"
    );
    expect(mockIoRmRF).toHaveBeenCalledWith(
      "/home/runner/.local/share/godot/templates/3.3.3.stable.mono"
    );
    const cpOptions = { recursive: true };
    expect(mockIoCp).toHaveBeenCalledWith(
      "/path/to/cached/godot-mono-templates",
      "/home/runner/.local/share/godot/templates/3.3.3.stable.mono",
      cpOptions
    );
  });
});
