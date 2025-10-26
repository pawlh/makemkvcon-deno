/**
 * Command executor for makemkvcon
 * Handles running commands and capturing output
 */

import type { CommandSpec } from "./command.ts";
import type { MakeMkvResult } from "./types.ts";
import { buildCommand } from "./command.ts";
import { parseRobotOutput } from "./parser.ts";

/**
 * Executes a makemkvcon command specification
 */
export async function execute(spec: CommandSpec): Promise<MakeMkvResult> {
  const args = buildCommand(spec);

  const cmd = new Deno.Command("makemkvcon", {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await cmd.output();

  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);

  let robotOutput = undefined;
  if (spec.options?.robot) {
    robotOutput = parseRobotOutput(stdoutText);
  }

  return {
    exitCode: code,
    stdout: stdoutText,
    stderr: stderrText,
    robotOutput,
  };
}

/**
 * Executes a raw makemkvcon command with custom arguments
 */
export async function executeRaw(args: string[]): Promise<MakeMkvResult> {
  const cmd = new Deno.Command("makemkvcon", {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await cmd.output();

  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);

  // Check if robot mode was enabled in args
  const hasRobotMode = args.includes("-r") || args.includes("--robot");
  let robotOutput = undefined;
  if (hasRobotMode) {
    robotOutput = parseRobotOutput(stdoutText);
  }

  return {
    exitCode: code,
    stdout: stdoutText,
    stderr: stderrText,
    robotOutput,
  };
}
