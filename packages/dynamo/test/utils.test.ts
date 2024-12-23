import { describe, test, expect, mock } from "bun:test";
import { pathExists } from "../src/utils.ts";

describe("utils", () => {
  describe("pathExists", () => {
    test("should return true if the path exists", async () => {
      const result = await pathExists("existing-path");
      expect(result).toBe(true);
    });

    test("should return false if the path does not exist", async () => {
      const result = await pathExists("non-existing-path");
      expect(result).toBe(false);
    });
  });
});
