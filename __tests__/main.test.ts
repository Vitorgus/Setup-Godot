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

let inputs: InputsInterface;

let mockCoreGetInput: MockedCoreGetInput;
let mockTcFind: MockedTcFind;

beforeEach(() => {
  // process.env['GITHUB_PATH'] = ''; // Stub out ENV file functionality so we can verify it writes to standard out
  inputs = {};

  mockCoreGetInput = core.getInput as MockedCoreGetInput;
  mockCoreGetInput.mockImplementation((name: string) => inputs[name]);

  mockTcFind = tc.find as MockedTcFind;
});

describe("getGodot tests", () => {
  test("Cache test", async () => {
    mockTcFind.mockReturnValue("path/to/cache");
    await getGodot("3.3.2", false);
    expect(core.info).toBeCalledWith("Godot 3.3.2 found in cache! Path: path/to/cache");
  });
});
