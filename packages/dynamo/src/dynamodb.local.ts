/**
 * Provides tools for managing a local DynamoDB instance in development or testing environments.
 *
 * @remarks
 * This package allows developers to download, start, and stop a local DynamoDB instance,
 * emulating AWS DynamoDB functionality without requiring a live AWS connection. The
 * package supports multiple modes of operation (`inMemory` and `sharedDb`) and offers
 * an easy-to-use API for interacting with the local database.
 *
 * @packageDocumentation
 */

import { spawn, ChildProcess } from "child_process";
import path from "path";
import { downloadLocalDynamoDb } from "@/utils.ts";

/**
 * Defines the available modes for running a local DynamoDB instance.
 *
 * @remarks
 * These modes determine how DynamoDB Local stores data:
 * - `inMemory`: Stores data in memory, which will be lost when the process stops.
 * - `sharedDb`: Uses a shared database file to persist data across process restarts.
 *
 * @public
 */
export type LocalDynamoDbMode = "inMemory" | "sharedDb";

/**
 * Configuration options for initializing a local DynamoDB instance.
 *
 * @remarks
 * These options are used to configure the local DynamoDB instance, such as
 * specifying the port and the mode of operation.
 *
 * @public
 */
export interface LocalDynamoDbOptions {
  /**
   * The port on which the local DynamoDB instance will run.
   */
  port: number;
  /**
   * The mode in which the local DynamoDB instance will operate.
   */
  mode: LocalDynamoDbMode;
}

/**
 * Represents a local DynamoDb instance.
 *
 * @remarks
 * This interface provides methods to orchestrate a local DynamoDB instance,
 * including starting and stopping the process. Designed for use in development
 * or testing environments, it ensures seamless interaction with a lightweight,
 * locally-hosted DynamoDB.
 *
 * @public
 */
export interface LocalDynamoDb {
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Creates and manages a local DynamoDB instance.
 *
 * @remarks
 * This function provides a simple interface to start and stop a local
 * DynamoDB instance for development or testing purposes. Once started,
 * it allows you to interact with the local database for testing or
 * emulation without requiring a live AWS DynamoDB instance.
 *
 * The `options` parameter is an object of type {@link LocalDynamoDbOptions}.
 *
 * @param options - Configuration options for the local DynamoDB instance. See {@link LocalDynamoDbOptions}.
 * @returns An object with methods to manage the local DynamoDB instance.
 *
 * @example
 * ```typescript
 * import { localDynamoDb } from "local-dynamodb-js";
 * const { start, stop } = localDynamoDb({ port: 8000, mode: "inMemory" });
 * await start(); // Start the local DynamoDB instance
 * stop();        // Stop the local DynamoDB instance
 * ```
 *
 * @public
 */
export const localDynamoDb = (options: LocalDynamoDbOptions): LocalDynamoDb => {
  let dynamoDbProcess: ChildProcess | null = null;

  return {
    /**
     * Starts the local DynamoDB instance.
     *
     * @remarks
     * This method initializes a local DynamoDB process if it is not already running. It ensures
     * that the necessary DynamoDB Local binary is downloaded and sets up the Java process
     * using the specified configuration options. The process runs on the configured port and
     * operates in the chosen mode (`inMemory` or `sharedDb`).
     *
     * @returns A promise that resolves when the DynamoDB Local process has started successfully.
     *
     * @throws {@link Error}
     * This exception is thorow if there is already a running local dynamodb process.
     *
     * @example
     * ```typescript
     * import { localDynamoDb } from "local-dynamodb-js";
     * const { start } = localDynamoDb({ port: 8000, mode: "sharedDb" });
     * await start(); // Start the local DynamoDB instance
     * ```
     */
    start: async (): Promise<void> => {
      const { mode, port } = options;

      if (dynamoDbProcess) {
        throw new Error("There is already a local DynamoDb process running.");
      }

      const basePath = await downloadLocalDynamoDb({
        sourceType: "www",
      });

      const jarPath = path.join(basePath, "DynamoDBLocal.jar");
      const libPath = path.join(basePath, "DynamoDBLocal_lib");

      const args = [
        `-Djava.library.path=${libPath}`,
        "-jar",
        jarPath,
        mode === "inMemory"
          ? "-inMemory"
          : mode === "sharedDb"
            ? "-sharedDb"
            : "",
        "-port",
        port.toString(),
      ].filter(Boolean); // Remove empty strings

      dynamoDbProcess = spawn("java", args, {
        stdio: "inherit",
      });

      dynamoDbProcess.on("exit", (code) => {
        console.log(`DynamoDB Local exited with code ${code}`);
        dynamoDbProcess = null;
      });

      dynamoDbProcess.on("error", (error) => {
        console.error("Failed to start DynamoDB Local:", error);
        dynamoDbProcess = null;
      });
    },
    /**
     * Stops a single running local dynamodb container from a process.
     *
     * @remarks
     * It's safe to expect this function to do nothing if no procss is running.
     */
    stop: (): void => {
      if (dynamoDbProcess) {
        /**
         * Use SIGTERM to allow for cleanup process, versus SIGKILL. This ensures
         * that the process terminates gracefully, potentially handling clean-up
         * operations such as releasing resources or writing logs.
         */
        dynamoDbProcess.kill("SIGTERM");
        dynamoDbProcess = null;
      }
    },
  };
};
