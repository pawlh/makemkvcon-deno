/**
 * High-level API for makemkvcon
 * Provides convenient functions for common operations
 */

import {
  buildBackupCommand,
  buildInfoCommand,
  buildListDrivesCommand,
  buildMkvCommand,
  buildStreamCommand,
} from "./command.ts";
import { execute } from "./executor.ts";
import { getDrives, parseDiscInfo } from "./parser.ts";
import type {
  BackupOptions,
  ConversionOptions,
  DiscInfo,
  DriveInfo,
  MakeMkvOptions,
  MakeMkvResult,
  StreamingOptions,
} from "./types.ts";

/**
 * Gets information about a disc
 * Example: makemkvcon -r info disc:0
 *
 * @param discIndex Index of the disc to query (typically 0 for first drive)
 * @param options Optional makemkvcon options
 * @returns Result with robot output containing disc information
 */
export async function getDiscInfo(
  discIndex: number,
  options: MakeMkvOptions = {},
): Promise<MakeMkvResult> {
  const spec = buildInfoCommand(discIndex, options);
  return execute(spec);
}

/**
 * Gets structured disc information
 * Convenience function that parses the robot output into a structured DiscInfo object
 *
 * @param discIndex Index of the disc to query
 * @param options Optional makemkvcon options
 * @returns Structured disc information with attributes and titles
 */
export async function getStructuredDiscInfo(
  discIndex: number,
  options: MakeMkvOptions = {},
): Promise<{ result: MakeMkvResult; discInfo: DiscInfo | null }> {
  const result = await getDiscInfo(discIndex, options);

  let discInfo: DiscInfo | null = null;
  if (result.robotOutput) {
    discInfo = parseDiscInfo(result.robotOutput);
  }

  return { result, discInfo };
}

/**
 * Lists all available drives
 * Example: makemkvcon -r --cache=1 info disc:9999
 *
 * @param options Optional makemkvcon options
 * @returns Result with robot output containing drive information
 */
export async function listDrives(
  options: MakeMkvOptions = {},
): Promise<MakeMkvResult> {
  const spec = buildListDrivesCommand(options);
  return execute(spec);
}

/**
 * Gets structured drive information
 * Convenience function that extracts DriveInfo objects from robot output
 *
 * @param options Optional makemkvcon options
 * @returns Array of drive information objects
 */
export async function getAvailableDrives(
  options: MakeMkvOptions = {},
): Promise<{ result: MakeMkvResult; drives: DriveInfo[] }> {
  const result = await listDrives(options);

  const drives: DriveInfo[] = [];
  if (result.robotOutput) {
    drives.push(...getDrives(result.robotOutput));
  }

  return { result, drives };
}

/**
 * Converts disc titles to MKV files
 * Example: makemkvcon mkv disc:0 all /output/folder
 *
 * @param discIndex Index of the disc to convert
 * @param titles Either "all" or an array of title numbers to convert
 * @param outputFolder Path to output folder
 * @param options Optional makemkvcon and conversion options
 * @returns Result of the conversion operation
 */
export async function convertToMkv(
  discIndex: number,
  titles: "all" | number[],
  outputFolder: string,
  options: (MakeMkvOptions & ConversionOptions) = {},
): Promise<MakeMkvResult> {
  const spec = buildMkvCommand(discIndex, titles, outputFolder, options);
  return execute(spec);
}

/**
 * Backs up a disc
 * Example: makemkvcon backup --decrypt --cache=16 --noscan -r disc:0 /output/folder
 *
 * @param discIndex Index of the disc to backup
 * @param outputFolder Path to output folder
 * @param options Optional makemkvcon and backup options
 * @returns Result of the backup operation
 */
export async function backupDisc(
  discIndex: number,
  outputFolder: string,
  options: (MakeMkvOptions & BackupOptions) = {},
): Promise<MakeMkvResult> {
  const spec = buildBackupCommand(discIndex, outputFolder, options);
  return execute(spec);
}

/**
 * Starts a streaming server
 * Example: makemkvcon stream --upnp=1 --cache=128 --bindip=192.168.1.102 --bindport=51000
 *
 * @param options Makemkvcon and streaming options
 * @returns Result of starting the streaming server
 */
export async function startStreamingServer(
  options: (MakeMkvOptions & StreamingOptions) = {},
): Promise<MakeMkvResult> {
  const spec = buildStreamCommand(options);
  return execute(spec);
}
