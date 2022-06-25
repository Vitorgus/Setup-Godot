import * as core from "@actions/core";
// import * as tc from "@actions/tool-cache";
// import * as io from "@actions/io";

import { getGodot, getTemplates } from "../src/get-tools";
import { run } from "../src/main";

jest.mock("@actions/core");
jest.mock("@actions/tool-cache");
jest.mock("@actions/io");

jest.mock("../src/get-tools");

interface InputsInterface {
  [name: string]: string | boolean;
}

let input: InputsInterface;

const mockCoreGetInput = jest.mocked(core.getInput);
const mockCoreGetBooleanInput = jest.mocked(core.getBooleanInput);
const mockedCoreSetFailed = jest.mocked(core.setFailed);

const mockGetGodot = jest.mocked(getGodot);

beforeAll(() => {
  mockCoreGetInput.mockImplementation(name => input[name] as string);
  mockCoreGetBooleanInput.mockImplementation(name => input[name] as boolean);
  mockedCoreSetFailed.mockImplementation(e => {
    throw new Error(e as string);
  });
});

beforeEach(() => {
  input = {};
});

describe("main funciton tests", () => {
  test("invalid version value test", async () => {
    input["godot-version"] = "abc";
    expect(async () => await run()).rejects.toThrow("INVALID VERSION");
  });

  test("normal run test", async () => {
    input["godot-version"] = "3.3.4";
    input["mono"] = false;
    input["download-templates"] = true;
    mockGetGodot.mockResolvedValue("/path/to/godot");

    await run();

    expect(getGodot).toHaveBeenLastCalledWith("3.3.4", false);
    expect(core.addPath).toHaveBeenCalledWith("/path/to/godot");
    expect(getTemplates).toHaveBeenCalledWith("3.3.4", false);
    expect(core.info).toHaveBeenLastCalledWith("Godot 3.3.4 is ready to use!");
  });

  test("skip templates test", async () => {
    input["godot-version"] = "3.3.3";
    input["mono"] = false;
    input["download-templates"] = false;
    mockGetGodot.mockResolvedValue("/path/to/godot");

    await run();

    expect(getGodot).toHaveBeenLastCalledWith("3.3.3", false);
    expect(core.addPath).toHaveBeenCalledWith("/path/to/godot");
    expect(getTemplates).toHaveBeenCalledTimes(0);
    expect(core.info).toHaveBeenLastCalledWith("Godot 3.3.3 is ready to use!");
  });

  test("mono test", async () => {
    input["godot-version"] = "3.3.4";
    input["mono"] = true;
    input["download-templates"] = true;
    mockGetGodot.mockResolvedValue("/path/to/godot");

    await run();

    expect(getGodot).toHaveBeenLastCalledWith("3.3.4", true);
    expect(core.addPath).toHaveBeenCalledWith("/path/to/godot");
    expect(getTemplates).toHaveBeenCalledWith("3.3.4", true);
    expect(core.info).toHaveBeenLastCalledWith("Godot 3.3.4 Mono is ready to use!");
  });

  test("skip mono templates test", async () => {
    input["godot-version"] = "3.3.3";
    input["mono"] = true;
    input["download-templates"] = false;
    mockGetGodot.mockResolvedValue("/path/to/godot");

    await run();

    expect(getGodot).toHaveBeenLastCalledWith("3.3.3", true);
    expect(core.addPath).toHaveBeenCalledWith("/path/to/godot");
    expect(getTemplates).toHaveBeenCalledTimes(0);
    expect(core.info).toHaveBeenLastCalledWith("Godot 3.3.3 Mono is ready to use!");
  });
});
