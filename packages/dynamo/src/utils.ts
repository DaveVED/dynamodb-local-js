import path from "path";
import { access, mkdir } from "node:fs/promises";
import AdmZip from "adm-zip";
import { _Response } from "bun-types/fetch.js";

/**
 * Defines the source type for downloading or accessing the DynamoDB Local binary.
 *
 * @remarks
 * This type indicates where the DynamoDB Local binary is sourced from the users local
 * machine or the world wide web.
 *
 * @public
 */
export type SourceType = "www" | "local";

/**
 * URL for downloading the latest DynamoDB Local binary.
 *
 * @remarks
 * This constant provides the default URL for fetching the latest version
 * of the DynamoDB Local binary. It is used when the source type is set to `www`.
 *
 * @constant
 */
const LOCAL_DYNAMODB_LATEST_DOWNLOAD_ZIP =
  "https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.zip";

/**
 * Downloads and optionally extracts the DynamoDB Local binary.
 *
 * @remarks
 * This function handles downloading DynamoDB Local from either a specified
 * URL (`www`) or a local path (`local`). By default, the binary is downloaded
 * and extracted to a `.local_dynamodb` directory in the current working directory.
 *
 * The `params` parameter is an object of type {@link DownloadLocalDynamoDbParams}.
 *
 * @param params - Configuration options for downloading DynamoDB Local. See {@link DownloadLocalDynamoDbParams}.
 * @returns The resolved destination directory where the binary or extracted files are located.
 *
 * @throws {@link Error} If a local source path is not provided when `sourceType` is `"local"`.
 * @throws {@link Error} If there are errors during the download or extraction process.
 *
 * @example
 * ```typescript
 * import { downloadLocalDynamoDb } from "local-dynamodb-js";
 * const destination = await downloadLocalDynamoDb({
 *   sourceType: "www",
 *   source: "https://example.com/dynamodb.zip",
 *   extract: true,
 * });
 * console.log(`DynamoDB Local downloaded to: ${destination}`);
 * ```
 *
 * @public
 */
export const downloadLocalDynamoDb = async ({
  sourceType,
  source,
  extract = true,
}: {
  sourceType: SourceType;
  source?: string;
  extract?: boolean;
}): Promise<string> => {
  // Validate local source type with missing source
  if (sourceType === "local" && !source) {
    throw new Error(
      "A source is required when specifying a local artifact of DynamoDB.",
    );
  }

  // Ensure the specified local source path exists
  if (sourceType === "local" && source && !(await pathExists(source))) {
    throw new Error(
      `The specified local source path does not exist: ${source}`,
    );
  }

  const downloadUrl =
    sourceType === "www"
      ? source || LOCAL_DYNAMODB_LATEST_DOWNLOAD_ZIP
      : source!;

  const resolvedDestination = path.resolve(process.cwd(), ".local_dynamodb");
  const zipFilePath = path.resolve(
    resolvedDestination,
    "dynamodb_local_latest.zip",
  );

  try {
    // Create the .local_dynamodb directory if it doesn't exist
    if (!(await pathExists(resolvedDestination))) {
      await mkdir(resolvedDestination, { recursive: true });
    }

    // Download and optionally extract the binary
    await downloadAndSaveFileLocally({
      url: downloadUrl,
      filePath: zipFilePath,
      extract,
      extractDestination: resolvedDestination,
    });

    console.log("Download completed.");

    return resolvedDestination;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to download or extract DynamoDB:", errorMessage);
    throw new Error(`Failed to download and extract DynamoDB: ${errorMessage}`);
  }
};

/**
 * Downloads a file from a given URL and optionally extracts it if it's a ZIP archive.
 *
 *
 * @param params
 * @returns A promise that resolves when the operation is complete.
 *
 * @throws {@link Error} If the download fails or extraction fails.
 *
 * @example
 * ```typescript
 * await downloadAndSaveFileLocally({
 *   url: "https://example.com/file.zip",
 *   filePath: "./file.zip",
 *   extract: true,
 *   extractDestination: "./output",
 * });
 * console.log("File downloaded and extracted.");
 * ```
 */
const downloadAndSaveFileLocally = async ({
  url,
  filePath,
  extract = true,
  extractDestination = path.resolve(process.cwd(), ".local_dynamodb"),
}: {
  url: string;
  filePath: string;
  extract?: boolean;
  extractDestination?: string;
}): Promise<void> => {
  const response: _Response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch the file: ${response.status} ${response.statusText}`,
    );
  }

  const fileBuffer = await response.arrayBuffer();

  if (extract) {
    const zip = new AdmZip(Buffer.from(new Uint8Array(fileBuffer))); // Convert to Buffer
    zip.extractAllTo(extractDestination, true);
    console.log(
      `Extraction completed. Files are available in: ${extractDestination}`,
    );
  } else {
    await Bun.write(filePath, new Uint8Array(fileBuffer)); // Bun's write accepts Uint8Array
    console.log(`File saved to: ${filePath}`);
  }
};

/**
 * Checks whether a given path exists.
 *
 * @param targetPath - The path to check.
 * @returns A promise that resolves to `true` if the path exists, or `false` otherwise.
 *
 * @example
 * ```typescript
 * const exists = await pathExists("/some/path");
 * console.log(`Path exists: ${exists}`);
 * ```
 */
export const pathExists = async (targetPath: string): Promise<boolean> => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};
