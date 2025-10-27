/**
 * Command builder for makemkvcon
 * Converts option objects to command-line arguments
 */

import type {
  BackupOptions,
  ConversionOptions,
  MakeMkvOptions,
  StreamingOptions,
} from "./types.ts";

/**
 * Builds general makemkvcon arguments from options
 */
export function buildGeneralArgs(options: MakeMkvOptions = {}): string[] {
  const args: string[] = [];

  if (options.messages !== undefined) {
    args.push(`--messages=${options.messages}`);
  }

  if (options.progress !== undefined) {
    args.push(`--progress=${options.progress}`);
  }

  if (options.debug !== undefined) {
    if (typeof options.debug === "boolean") {
      if (options.debug) args.push("--debug");
    } else {
      args.push(`--debug=${options.debug}`);
    }
  }

  if (options.directio !== undefined) {
    args.push(`--directio=${options.directio}`);
  }

  if (options.noscan) {
    args.push("--noscan");
  }

  if (options.cache !== undefined) {
    args.push(`--cache=${options.cache}`);
  }

  if (options.robot) {
    args.push("-r");
  }

  return args;
}

/**
 * Builds streaming-specific arguments
 */
export function buildStreamingArgs(options: StreamingOptions = {}): string[] {
  const args: string[] = [];

  if (options.upnp !== undefined) {
    args.push(`--upnp=${options.upnp ? "true" : "false"}`);
  }

  if (options.bindip !== undefined) {
    args.push(`--bindip=${options.bindip}`);
  }

  if (options.bindport !== undefined) {
    args.push(`--bindport=${options.bindport}`);
  }

  return args;
}

/**
 * Builds backup-specific arguments
 */
export function buildBackupArgs(options: BackupOptions = {}): string[] {
  const args: string[] = [];

  if (options.decrypt) {
    args.push("--decrypt");
  }

  return args;
}

/**
 * Builds conversion-specific arguments
 */
export function buildConversionArgs(
  options: ConversionOptions = {},
): string[] {
  const args: string[] = [];

  if (options.minlength !== undefined) {
    args.push(`--minlength=${options.minlength}`);
  }

  return args;
}

/**
 * Command specification for makemkvcon
 */
export interface CommandSpec {
  /** The makemkvcon command */
  command: "info" | "mkv" | "backup" | "stream";
  /** Command-specific arguments */
  args: string[];
  /** General options */
  options?: MakeMkvOptions;
}

/**
 * Builds complete command arguments array
 */
export function buildCommand(spec: CommandSpec): string[] {
  const generalArgs = buildGeneralArgs(spec.options);
  return [...generalArgs, spec.command, ...spec.args];
}

/**
 * Builds info command for getting disc information
 */
export function buildInfoCommand(
  discIndex: number,
  options: MakeMkvOptions = {},
): CommandSpec {
  return {
    command: "info",
    args: [`disc:${discIndex}`],
    options: { robot: true, ...options },
  };
}

/**
 * Builds info command for listing drives
 */
export function buildListDrivesCommand(
  options: MakeMkvOptions = {},
): CommandSpec {
  return {
    command: "info",
    args: ["disc:9999"],
    options: { robot: true, cache: 1, ...options },
  };
}

/**
 * Builds mkv command for converting titles
 */
export function buildMkvCommand(
  discIndex: number,
  titles: "all" | number[],
  outputFolder: string,
  options: MakeMkvOptions & ConversionOptions = {},
): CommandSpec {
  const titleArg = titles === "all" ? "all" : titles.join(",");
  const conversionArgs = buildConversionArgs(options);

  return {
    command: "mkv",
    args: [
      ...conversionArgs,
      `disc:${discIndex}`,
      titleArg,
      outputFolder,
    ],
    options,
  };
}

/**
 * Builds backup command for backing up a disc
 */
export function buildBackupCommand(
  discIndex: number,
  outputFolder: string,
  options: MakeMkvOptions & BackupOptions = {},
): CommandSpec {
  const backupArgs = buildBackupArgs(options);

  return {
    command: "backup",
    args: [
      ...backupArgs,
      `disc:${discIndex}`,
      outputFolder,
    ],
    options,
  };
}

/**
 * Builds stream command for starting streaming server
 */
export function buildStreamCommand(
  options: MakeMkvOptions & StreamingOptions = {},
): CommandSpec {
  const streamingArgs = buildStreamingArgs(options);

  return {
    command: "stream",
    args: streamingArgs,
    options,
  };
}
