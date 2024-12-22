import { downloadLocalDynamoDb } from "../src/utils";

import { expect, describe, test } from "bun:test";
describe("utils", () => {
  describe("downloadLocalDynamoDb", () => {
    test("should download file from the web with a proivded source url", () => {
      expect(downloadLocalDynamoDb({ sourceType: "www" }));
    });
  });
});
