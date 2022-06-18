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

type MockedCoreGetInput = jest.MockedFunction<typeof core.getInput>;
type MockedCoreGetBooleanInput = jest.MockedFunction<typeof core.getBooleanInput>;
type MockedCoreSetFailed = jest.MockedFunction<typeof core.setFailed>;

type MockedGetGodot = jest.MockedFunction<typeof getGodot>;

let input: InputsInterface;

let mockCoreGetInput: MockedCoreGetInput;
let mockCoreGetBooleanInput: MockedCoreGetBooleanInput;
let mockedCoreSetFailed: MockedCoreSetFailed;

let mockGetGodot: MockedGetGodot;

beforeAll(() => {
  // process.env['GITHUB_PATH'] = ''; // Stub out ENV file functionality so we can verify it writes to standard out

  mockCoreGetInput = core.getInput as MockedCoreGetInput;
  mockCoreGetInput.mockImplementation(name => input[name] as string);

  mockCoreGetBooleanInput = core.getBooleanInput as MockedCoreGetBooleanInput;
  mockCoreGetBooleanInput.mockImplementation(name => input[name] as boolean);

  mockedCoreSetFailed = core.setFailed as MockedCoreSetFailed;

  // prettier-ignore
  mockedCoreSetFailed.mockImplementation(e => { throw new Error(e as string) }); // eslint-disable-line @typescript-eslint/semi

  mockGetGodot = getGodot as MockedGetGodot;
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
