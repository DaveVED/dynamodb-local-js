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
  port: () => number;
  mode: () => LocalDynamoDbMode;
  configure: (newOptions: Partial<LocalDynamoDbOptions>) => void;
  liveness: () => boolean;
  readiness: () => boolean;
  status: () => LocalDynamoDbStatus;
  restart: () => Promise<void>;
}

/**
 * Represents the status of a local DynamoDB instance.
 *
 * @remarks
 * This object provides a detailed view of the current state of the local DynamoDB instance,
 * including its status (`UP`, `DOWN`, or `PENDING`), port, and mode.
 *
 * @public
 */
export interface LocalDynamoDbStatus {
  /**
   * The current status of the DynamoDB instance.
   */
  status: "UP" | "DOWN" | "PENDING";
  /**
   * The port on which the DynamoDB instance is configured to run.
   */
  port: number;
  /**
   * The operational mode of the DynamoDB instance.
   */
  mode: LocalDynamoDbMode;
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

  const api: LocalDynamoDb = {
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
     * This exception is thrown if there is already a running local dynamodb process.
     */
    async start(): Promise<void> {
      const { mode, port } = options;

      if (dynamoDbProcess) {
        throw new Error("There is already a local DynamoDb process running.");
      }

      const basePath = await downloadLocalDynamoDb({ sourceType: "www" });

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
      ].filter(Boolean);

      dynamoDbProcess = spawn("java", args, { stdio: "inherit" });

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
     * Stops a single running local DynamoDB container from a process.
     *
     * @remarks
     * It's safe to expect this function to do nothing if no process is running.
     */
    stop(): void {
      if (dynamoDbProcess) {
        dynamoDbProcess.kill("SIGTERM");
        dynamoDbProcess = null;
      }
    },

    /**
     * Restarts the local DynamoDB instance.
     *
     * @remarks
     * This method stops the current running local DynamoDB process (if any) and restarts it using
     * the existing configuration. It ensures the instance is reinitialized with the current settings.
     *
     * @returns A promise that resolves when the DynamoDB Local process has restarted successfully.
     *
     * @example
     * ```typescript
     * import { localDynamoDb } from "local-dynamodb-js";
     * const { start, restart } = localDynamoDb({ port: 8000, mode: "sharedDb" });
     * await start();
     * await restart(); // Restart the local DynamoDB instance
     * ```
     */
    async restart(): Promise<void> {
      if (dynamoDbProcess) {
        api.stop(); // Explicitly call stop
      }

      await api.start(); // Explicitly call start
    },

    /**
     * Checks if the local DynamoDB instance is currently running.
     *
     * @remarks
     * This method provides a simple way to check the status of the local
     * DynamoDB instance, returning `true` if the instance is running or
     * `false` otherwise.
     *
     * @returns A boolean indicating the liveness of the local DynamoDB process.
     *
     * @example
     * ```typescript
     * import { localDynamoDb } from "local-dynamodb-js";
     * const { start, liveness } = localDynamoDb({ port: 8000, mode: "inMemory" });
     * await start();
     * console.log(liveness()); // true
     * ```
     */
    liveness(): boolean {
      return dynamoDbProcess !== null;
    },

    /**
     * Checks if the local DynamoDB instance is ready to accept requests.
     *
     * @remarks
     * Readiness implies that the instance has been started and is ready for interaction.
     * This method will return `true` only after a successful start.
     *
     * @returns A boolean indicating the readiness of the local DynamoDB process.
     *
     * @example
     * ```typescript
     * import { localDynamoDb } from "local-dynamodb-js";
     * const { start, readiness } = localDynamoDb({ port: 8000, mode: "inMemory" });
     * await start();
     * console.log(readiness()); // true
     * ```
     */
    readiness(): boolean {
      return dynamoDbProcess !== null;
    },

    /**
     * Retrieves the current status of the local DynamoDB instance.
     *
     * @remarks
     * This method provides a detailed status of the DynamoDB instance, including whether it is
     * running (`UP`), stopped (`DOWN`), or in a transitional state (`PENDING`).
     *
     * @returns An object containing the status, port, and mode of the DynamoDB instance.
     *
     * @example
     * ```typescript
     * import { localDynamoDb } from "local-dynamodb-js";
     * const { start, status } = localDynamoDb({ port: 8000, mode: "inMemory" });
     * await start();
     * console.log(status()); // { status: "UP", port: 8000, mode: "inMemory" }
     * ```
     */
    status(): LocalDynamoDbStatus {
      return {
        status: dynamoDbProcess ? "UP" : "DOWN",
        port: options.port,
        mode: options.mode,
      };
    },

    /**
     * Retrieves the port on which the local DynamoDB instance is running.
     *
     * @returns The configured port number.
     */
    port(): number {
      return options.port;
    },

    /**
     * Retrieves the operational mode of the local DynamoDB instance.
     *
     * @returns The configured mode (`inMemory` or `sharedDb`).
     */
    mode(): LocalDynamoDbMode {
      return options.mode;
    },

    /**
     * Updates the internal configuration of your local DynamoDB instance dynamically.
     *
     * @remarks
     * This function allows you to update the options for the local DynamoDB instance.
     * Changes will take effect on the next start operation. If the instance is currently running,
     * the configuration update will not affect the running process.
     *
     * @param newOptions - A partial object containing the new configuration options.
     * @throws {@link Error}
     * If invalid options are provided.
     */
    configure(newOptions: Partial<LocalDynamoDbOptions>): void {
      if (
        newOptions.port !== undefined &&
        (newOptions.port < 1024 || newOptions.port > 65535)
      ) {
        throw new Error("Port must be between 1024 and 65535.");
      }

      if (
        newOptions.mode !== undefined &&
        !["inMemory", "sharedDb"].includes(newOptions.mode)
      ) {
        throw new Error("Invalid mode. Expected 'inMemory' or 'sharedDb'.");
      }

      Object.assign(options, newOptions);
    },
  };

  return api;
};
