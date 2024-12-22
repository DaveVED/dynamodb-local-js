import { localDynamoDb, LocalDynamoDbOptions } from "../src/index";
import { expect, describe, test } from "bun:test";
describe("localDynamoDb", () => {
  test('should start without errors in "inMemory" mode', async () => {
    const options: LocalDynamoDbOptions = { port: 8000, mode: "inMemory" };
    const { start } = localDynamoDb(options);
    await expect(start()).not.toBeUndefined();
  });
});
