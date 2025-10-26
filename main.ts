/**
 * makemkvcon-deno
 *
 * A modular Deno library for wrapping the makemkvcon command-line tool.
 * Provides TypeScript types, command builders, parsers, and high-level API functions.
 *
 * @example Basic usage - Get disc information
 * ```ts
 * import { getDiscInfo } from "./main.ts";
 *
 * const result = await getDiscInfo(0);
 * console.log(result.robotOutput);
 * ```
 *
 * @example Get structured disc information
 * ```ts
 * import { getStructuredDiscInfo } from "./main.ts";
 *
 * const { discInfo } = await getStructuredDiscInfo(0);
 * if (discInfo) {
 *   console.log("Titles:", discInfo.titles.length);
 * }
 * ```
 *
 * @example List available drives
 * ```ts
 * import { getAvailableDrives } from "./main.ts";
 *
 * const { drives } = await getAvailableDrives();
 * for (const drive of drives) {
 *   console.log(`Drive ${drive.index}: ${drive.driveName}`);
 * }
 * ```
 *
 * @example Convert disc to MKV
 * ```ts
 * import { convertToMkv } from "./main.ts";
 *
 * await convertToMkv(0, "all", "/output/folder", {
 *   robot: true,
 *   cache: 1024,
 * });
 * ```
 *
 * @module
 */

// Export all types
export type {
  BackupOptions,
  ConversionOptions,
  DiscInfo,
  DriveInfo,
  InfoOutput,
  MakeMkvOptions,
  MakeMkvResult,
  MsgOutput,
  ProgressTitle,
  ProgressValue,
  RobotOutput,
  StreamInfo,
  StreamingOptions,
  TitleCount,
  TitleInfo,
} from "./lib/types.ts";

// Re-export the enum (exported as value, not type)
export { AttributeId } from "./lib/types.ts";

// Export parser functions
export {
  getAttribute,
  getDrives,
  getMessages,
  getTitleCount,
  parseDiscInfo,
  parseDiscInfoAdvanced,
  parseRobotLine,
  parseRobotOutput,
  parseRobotValues,
} from "./lib/parser.ts";

// Export command builders
export {
  buildBackupArgs,
  buildBackupCommand,
  buildCommand,
  buildConversionArgs,
  buildGeneralArgs,
  buildInfoCommand,
  buildListDrivesCommand,
  buildMkvCommand,
  buildStreamCommand,
  buildStreamingArgs,
} from "./lib/command.ts";
export type { CommandSpec } from "./lib/command.ts";

// Export executor functions
export { execute, executeRaw } from "./lib/executor.ts";

// Export high-level API functions (recommended for most use cases)
export {
  backupDisc,
  convertToMkv,
  getAvailableDrives,
  getDiscInfo,
  getStructuredDiscInfo,
  listDrives,
  startStreamingServer,
} from "./lib/api.ts";
