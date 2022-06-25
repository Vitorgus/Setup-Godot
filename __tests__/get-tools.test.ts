import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";

import { getGodot, getTemplates } from "../src/get-tools";

jest.mock("@actions/core");
jest.mock("@actions/tool-cache");
jest.mock("@actions/io");

type MockedTcFind = jest.MockedFunction<typeof tc.find>;
type MockedTcDownloadTool = jest.MockedFunction<typeof tc.downloadTool>;
type MockedTcExtractZip = jest.MockedFunction<typeof tc.extractZip>;
type MockedTcCacheFile = jest.MockedFunction<typeof tc.cacheFile>;
type MockedTcCacheDir = jest.MockedFunction<typeof tc.cacheDir>;

type MockedIoMv = jest.MockedFunction<typeof io.mv>;
type MockedIoRmRF = jest.MockedFunction<typeof io.rmRF>;
type MockedIoCp = jest.MockedFunction<typeof io.cp>;

let mockTcFind: MockedTcFind;
let mockTcDownloadTool: MockedTcDownloadTool;
let mockTcExtrackZip: MockedTcExtractZip;
let mockTcCacheFile: MockedTcCacheFile;
let mockTcCacheDir: MockedTcCacheDir;

let mockIoMv: MockedIoMv;
let mockIoRmRF: MockedIoRmRF;
let mockIoCp: MockedIoCp;

beforeAll(() => {
  // process.env['GITHUB_PATH'] = ''; // Stub out ENV file functionality so we can verify it writes to standard out

  mockTcFind = tc.find as MockedTcFind;
  mockTcDownloadTool = tc.downloadTool as MockedTcDownloadTool;
  mockTcExtrackZip = tc.extractZip as MockedTcExtractZip;
  mockTcCacheFile = tc.cacheFile as MockedTcCacheFile;
  mockTcCacheDir = tc.cacheDir as MockedTcCacheDir;
  mockIoMv = io.mv as MockedIoMv;
  mockIoRmRF = io.rmRF as MockedIoRmRF;
  mockIoCp = io.cp as MockedIoCp;
});

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
