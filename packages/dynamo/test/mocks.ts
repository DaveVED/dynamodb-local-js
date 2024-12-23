import { mock } from "bun:test";

mock.module("node:fs/promises", () => ({
  access: (path: string) => {
    if (path === "existing-path") {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Path does not exist"));
  },
  mkdir: async () => Promise.resolve(),
}));
