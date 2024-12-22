import path from "path";
import fs from "node:fs/promises";
import AdmZip from "adm-zip"; // unzipper??
import { _Response } from "bun-types/fetch.js";

export type SourceType = "www" | "local";

const LOCAL_DYNAMODB_LATEST_DOWNLOAD_ZIP =
  "https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.zip";

/**
 * Downloads the local AWS DynamoDB client to the current machine.
 *
 * @param {Object} options - Download options.
 * @param {SourceType} options.sourceType - Source type, either "www" or "local".
 * @param {string} [options.source] - Custom source URL or local path.
 * @param {boolean} [options.extract] - Whether to extract the downloaded file.
 * @returns {Promise<string>} - The directory path of the downloaded DynamoDB files.
 * @throws Will throw an error if the source is invalid or the download fails.
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
  if (sourceType === "local" && !source) {
    throw new Error(
      "A source is required when specifying a local artifact of DynamoDB.",
    );
  }

  const downloadUrl =
    sourceType === "www"
      ? source || LOCAL_DYNAMODB_LATEST_DOWNLOAD_ZIP
      : source!;
  const resolvedDestination = path.resolve(process.cwd(), ".local_dynamo");
  const zipFilePath = path.resolve(
    resolvedDestination,
    "dynamodb_local_latest.zip",
  );

  try {
    console.log(
      `Downloading DynamoDB from ${sourceType === "www" ? "web" : "local"} source: ${downloadUrl}...`,
    );

    if (!(await pathExists(resolvedDestination))) {
      await fs.mkdir(resolvedDestination, { recursive: true });
    }

    // Download the ZIP file and optionally extract it
    await downloadAndSaveFileLocally({
      url: downloadUrl,
      filePath: zipFilePath,
      extract,
      extractDestination: resolvedDestination,
    });

    console.log("Download completed.");

    return resolvedDestination;
  } catch (error) {
    console.error(
      "An error occurred while downloading or extracting DynamoDB:",
      error,
    );
    throw new Error(
      `Failed to download and extract DynamoDB: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Downloads a file from a URL and saves it to the specified file path.
 * Optionally extracts the file if it's a ZIP archive.
 *
 * @param {Object} options - Download options.
 * @param {string} options.url - The URL to fetch the file from.
 * @param {string} options.filePath - The local file path to save the file.
 * @param {boolean} [options.extract=true] - Whether to extract the downloaded file.
 * @param {string} [options.extractDestination] - Directory to extract the files to.
 * Defaults to the ".local_dynamo" directory in the current working directory.
 * @returns {Promise<void>} - Resolves when the file is successfully saved or extracted.
 * @throws Will throw an error if the fetch or file write fails.
 */
const downloadAndSaveFileLocally = async ({
  url,
  filePath,
  extract = true,
  extractDestination = path.resolve(process.cwd(), ".local_dynamo"),
}: {
  url: string;
  filePath: string;
  extract?: boolean;
  extractDestination?: string;
}): Promise<void> => {
  const response: _Response = await fetch(url);

  // Ensure the fetch succeeded
  if (!response.ok) {
    throw new Error(`Failed to fetch the file: ${response.status} ${response.statusText}`);
  }

  if (extract) {
    // Extract ZIP file
    const zipBuffer = await response.arrayBuffer();
    const zip = new AdmZip(Buffer.from(zipBuffer));
    zip.extractAllTo(extractDestination, true);
    console.log(
      `Extraction completed. Files are available in: ${extractDestination}`,
    );
  } else {
    // Save file locally
    const fileBuffer = await response.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(fileBuffer));
    console.log(`File saved to: ${filePath}`);
  }
};


/**
 * Checks if a file or directory exists at the specified path.
 *
 * @param {string} targetPath - The path to check.
 * @returns {Promise<boolean>} - True if the path exists, false otherwise.
 */
const pathExists = async (targetPath: string): Promise<boolean> => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};
