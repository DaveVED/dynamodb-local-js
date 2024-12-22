import { spawn, ChildProcess } from "child_process";
import path from "path";
import { downloadLocalDynamoDb } from "@/utils.ts";

export type LocalDynamoDbMode = "inMemory" | "sharedDb";

export interface LocalDynamoDbOptions {
  port: number;
  mode: LocalDynamoDbMode;
}

export interface LocalDynamoDb {
  start: () => Promise<void>;
  stop: () => void;
}

export const localDynamoDb = (options: LocalDynamoDbOptions): LocalDynamoDb => {
  let dynamoDbProcess: ChildProcess | null = null;

  return {
    /**
     * @todo need to check if there is a dynamodb process currenlty running (this might be the first thing we should do).
     * @todo need health check after startup so users dont' have to keep hitting till the process spawns up. DyanmoDB provides API for this.
     */
    start: async (): Promise<void> => {
      const { mode, port } = options;

      if (dynamoDbProcess) {
        console.log("DynamoDB Local is already running.");
        return;
      }

      console.log(`Starting Local DynamoDB on port ${port} in ${mode} mode.`);

      // Download DynamoDB Local and get the base directory path
      const basePath = await downloadLocalDynamoDb({
        sourceType: "www",
        source:
          "https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.zip",
      });

      // Construct paths for JAR and library
      const jarPath = path.join(basePath, "DynamoDBLocal.jar");
      const libPath = path.join(basePath, "DynamoDBLocal_lib");

      // Construct arguments
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

      /*
        dynamoDbProcess.on("exit", (code) => {
          console.log(`DynamoDB Local exited with code ${code}`);
          dynamoDbProcess = null;
        });
  
        dynamoDbProcess.on("error", (error) => {
          console.error("Failed to start DynamoDB Local:", error);
          dynamoDbProcess = null;
        });
        */
      console.log("DynamoDB Local process started successfully.");
    },
    stop: (): void => {
      if (dynamoDbProcess) {
        console.log("Stopping DynamoDB Local...");
        /**
         * Use SIGTERM to allow for cleanup process, versue SIGKILL. And
         * we may want to catch this later some where some how not sure. 
         */
        dynamoDbProcess.kill("SIGTERM");
        dynamoDbProcess = null;
        console.log("DynamoDB Local stopped.");
      } else {
        console.log("No running DynamoDB Local process to stop.");
      }
    },
  };
};