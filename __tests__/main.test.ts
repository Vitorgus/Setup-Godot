import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";

import { getGodot } from "../src/get-tools";

jest.mock("@actions/core");
jest.mock("@actions/tool-cache");
jest.mock("@actions/io");

interface InputsInterface {
  [name: string]: string;
}

type MockedCoreGetInput = jest.MockedFunction<typeof core.getInput>;

type MockedTcFind = jest.MockedFunction<typeof tc.find>;
type MockedTcDownloadTool = jest.MockedFunction<typeof tc.downloadTool>;
type MockedTcExtractZip = jest.MockedFunction<typeof tc.extractZip>;
type MockedTcCacheFile = jest.MockedFunction<typeof tc.cacheFile>;
type MockedTcCacheDir = jest.MockedFunction<typeof tc.cacheDir>;

type MockedIoMv = jest.MockedFunction<typeof io.mv>;

let inputs: InputsInterface;

let mockCoreGetInput: MockedCoreGetInput;
let mockTcFind: MockedTcFind;
let mockTcDownloadTool: MockedTcDownloadTool;
let mockTcExtrackZip: MockedTcExtractZip;
let mockTcCacheFile: MockedTcCacheFile;
let mockTcCacheDir: MockedTcCacheDir;

let mockIoMv: MockedIoMv;

beforeEach(() => {
  // process.env['GITHUB_PATH'] = ''; // Stub out ENV file functionality so we can verify it writes to standard out
  inputs = {};

  mockCoreGetInput = core.getInput as MockedCoreGetInput;
  mockCoreGetInput.mockImplementation((name: string) => inputs[name]);

  mockTcFind = tc.find as MockedTcFind;
  mockTcDownloadTool = tc.downloadTool as MockedTcDownloadTool;
  mockTcExtrackZip = tc.extractZip as MockedTcExtractZip;
  mockTcCacheFile = tc.cacheFile as MockedTcCacheFile;
  mockTcCacheDir = tc.cacheDir as MockedTcCacheDir;
  mockIoMv = io.mv as MockedIoMv;
});

describe("getGodot tests", () => {
  test("Cache test standard", async () => {
    mockTcFind.mockReturnValue("/path/to/existing/cached/godot");

    const result = await getGodot("3.3.2", false);

    expect(mockTcFind).toHaveBeenCalledWith("godot", "3.3.2", "linux");
    expect(result).toBe("/path/to/existing/cached/godot");
  });

  test("Download test standard", async () => {
    mockTcFind.mockReturnValue("");
    mockTcDownloadTool.mockResolvedValue("/path/to/downloaded/godot");
    mockTcExtrackZip.mockResolvedValue("/path/to/extracted/godot");
    mockTcCacheFile.mockResolvedValue("/path/to/cached/godot");

    const result = await getGodot("3.1.1", false);

    expect(mockTcDownloadTool).toHaveBeenCalledWith("https://downloads.tuxfamily.org/godotengine/3.1.1/Godot_v3.1.1-stable_linux_headless.64.zip");
    expect(mockTcExtrackZip).toHaveBeenCalledWith("/path/to/downloaded/godot", undefined);
    expect(mockTcCacheFile).toHaveBeenCalledWith("/path/to/extracted/godot/Godot_v3.1.1-stable_linux_headless.64", "godot", "godot", "3.1.1", "linux");
    expect(result).toBe("/path/to/cached/godot");
  });

  test("Cache test mono", async () => {
    mockTcFind.mockReturnValue("/path/to/existing/cached/godot-mono");

    const result = await getGodot("3.2.3", true);

    expect(mockTcFind).toHaveBeenCalledWith("godot", "3.2.3-mono", "linux");
    expect(result).toBe("/path/to/existing/cached/godot-mono");
  });

  test("Download test mono", async () => {
    mockTcFind.mockReturnValue("");
    mockTcDownloadTool.mockResolvedValue("/path/to/downloaded/godot-mono");
    mockTcExtrackZip.mockResolvedValue("/path/to/extracted/godot-mono");
    mockTcCacheDir.mockResolvedValue("/path/to/cached/godot-mono");

    const result = await getGodot("3.3.3", true);

    expect(mockTcDownloadTool).toHaveBeenCalledWith("https://downloads.tuxfamily.org/godotengine/3.3.3/mono/Godot_v3.3.3-stable_mono_linux_headless_64.zip");
    expect(mockTcExtrackZip).toHaveBeenCalledWith("/path/to/downloaded/godot-mono", undefined);
    expect(mockIoMv).toHaveBeenCalledWith(
      "/path/to/extracted/godot-mono/Godot_v3.3.3-stable_mono_linux_headless_64/Godot_v3.3.3-stable_mono_linux_headless.64",
      "/path/to/extracted/godot-mono/Godot_v3.3.3-stable_mono_linux_headless_64/godot"
    );
    expect(mockTcCacheDir).toHaveBeenCalledWith("/path/to/extracted/godot-mono/Godot_v3.3.3-stable_mono_linux_headless_64", "godot", "3.3.3-mono", "linux");
    expect(result).toBe("/path/to/cached/godot-mono");
  });
});
