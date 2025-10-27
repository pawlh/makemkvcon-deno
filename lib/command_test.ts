/**
 * Tests for command builders
 */

import { assertEquals } from "@std/assert";
import {
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
} from "./command.ts";

// ============================================================================
// buildGeneralArgs Tests
// ============================================================================

Deno.test("command: buildGeneralArgs - robot flag", () => {
  const args = buildGeneralArgs({ robot: true });
  assertEquals(args.includes("-r"), true);
});

Deno.test("command: buildGeneralArgs - cache option", () => {
  const args = buildGeneralArgs({ cache: 128 });
  assertEquals(args.includes("--cache=128"), true);
});

Deno.test("command: buildGeneralArgs - noscan option", () => {
  const args = buildGeneralArgs({ noscan: true });
  assertEquals(args.includes("--noscan"), true);
});

Deno.test("command: buildGeneralArgs - debug flag boolean", () => {
  const args1 = buildGeneralArgs({ debug: true });
  assertEquals(args1.includes("--debug"), true);

  const args2 = buildGeneralArgs({ debug: false });
  assertEquals(args2.includes("--debug"), false);
});

Deno.test("command: buildGeneralArgs - debug flag with path", () => {
  const args = buildGeneralArgs({ debug: "/tmp/debug.log" });
  assertEquals(args.includes("--debug=/tmp/debug.log"), true);
});

Deno.test("command: buildGeneralArgs - messages option", () => {
  const args = buildGeneralArgs({ messages: "-stdout" });
  assertEquals(args.includes("--messages=-stdout"), true);
});

Deno.test("command: buildGeneralArgs - progress option", () => {
  const args = buildGeneralArgs({ progress: "-same" });
  assertEquals(args.includes("--progress=-same"), true);
});

Deno.test("command: buildGeneralArgs - directio option", () => {
  const args = buildGeneralArgs({ directio: true });
  assertEquals(args.includes("--directio=true"), true);
});

Deno.test("command: buildGeneralArgs - multiple options", () => {
  const args = buildGeneralArgs({
    robot: true,
    cache: 256,
    noscan: true,
    messages: "-stdout",
  });

  assertEquals(args.includes("-r"), true);
  assertEquals(args.includes("--cache=256"), true);
  assertEquals(args.includes("--noscan"), true);
  assertEquals(args.includes("--messages=-stdout"), true);
});

Deno.test("command: buildGeneralArgs - empty options", () => {
  const args = buildGeneralArgs({});
  assertEquals(args.length, 0);
});

// ============================================================================
// buildStreamingArgs Tests
// ============================================================================

Deno.test("command: buildStreamingArgs - upnp true", () => {
  const args = buildStreamingArgs({ upnp: true });
  assertEquals(args.includes("--upnp=true"), true);
});

Deno.test("command: buildStreamingArgs - upnp false", () => {
  const args = buildStreamingArgs({ upnp: false });
  assertEquals(args.includes("--upnp=false"), true);
});

Deno.test("command: buildStreamingArgs - bindip", () => {
  const args = buildStreamingArgs({ bindip: "192.168.1.100" });
  assertEquals(args.includes("--bindip=192.168.1.100"), true);
});

Deno.test("command: buildStreamingArgs - bindport", () => {
  const args = buildStreamingArgs({ bindport: 51000 });
  assertEquals(args.includes("--bindport=51000"), true);
});

Deno.test("command: buildStreamingArgs - all options", () => {
  const args = buildStreamingArgs({
    upnp: true,
    bindip: "192.168.1.100",
    bindport: 51000,
  });

  assertEquals(args.includes("--upnp=true"), true);
  assertEquals(args.includes("--bindip=192.168.1.100"), true);
  assertEquals(args.includes("--bindport=51000"), true);
});

// ============================================================================
// buildBackupArgs Tests
// ============================================================================

Deno.test("command: buildBackupArgs - decrypt option", () => {
  const args = buildBackupArgs({ decrypt: true });
  assertEquals(args.includes("--decrypt"), true);
});

Deno.test("command: buildBackupArgs - no decrypt", () => {
  const args = buildBackupArgs({ decrypt: false });
  assertEquals(args.includes("--decrypt"), false);
});

// ============================================================================
// buildConversionArgs Tests
// ============================================================================

Deno.test("command: buildConversionArgs - minlength option", () => {
  const args = buildConversionArgs({ minlength: 120 });
  assertEquals(args.includes("--minlength=120"), true);
});

Deno.test("command: buildConversionArgs - no options", () => {
  const args = buildConversionArgs({});
  assertEquals(args.length, 0);
});

// ============================================================================
// buildInfoCommand Tests
// ============================================================================

Deno.test("command: buildInfoCommand - basic disc query", () => {
  const spec = buildInfoCommand(0);
  assertEquals(spec.command, "info");
  assertEquals(spec.args, ["disc:0"]);
  assertEquals(spec.options?.robot, true);
});

Deno.test("command: buildInfoCommand - with options", () => {
  const spec = buildInfoCommand(0, { cache: 256, noscan: true });
  assertEquals(spec.command, "info");
  assertEquals(spec.args, ["disc:0"]);
  assertEquals(spec.options?.robot, true);
  assertEquals(spec.options?.cache, 256);
  assertEquals(spec.options?.noscan, true);
});

Deno.test("command: buildInfoCommand - different disc index", () => {
  const spec = buildInfoCommand(1);
  assertEquals(spec.args, ["disc:1"]);
});

// ============================================================================
// buildListDrivesCommand Tests
// ============================================================================

Deno.test("command: buildListDrivesCommand - basic", () => {
  const spec = buildListDrivesCommand();
  assertEquals(spec.command, "info");
  assertEquals(spec.args, ["disc:9999"]);
  assertEquals(spec.options?.robot, true);
  assertEquals(spec.options?.cache, 1);
});

Deno.test("command: buildListDrivesCommand - with options", () => {
  const spec = buildListDrivesCommand({ messages: "-stdout" });
  assertEquals(spec.options?.messages, "-stdout");
});

// ============================================================================
// buildMkvCommand Tests
// ============================================================================

Deno.test("command: buildMkvCommand - all titles", () => {
  const spec = buildMkvCommand(0, "all", "/output");
  assertEquals(spec.command, "mkv");
  assertEquals(spec.args[spec.args.length - 3], "disc:0");
  assertEquals(spec.args[spec.args.length - 2], "all");
  assertEquals(spec.args[spec.args.length - 1], "/output");
});

Deno.test("command: buildMkvCommand - specific titles", () => {
  const spec = buildMkvCommand(0, [1, 2, 3], "/output");
  assertEquals(spec.command, "mkv");
  assertEquals(spec.args[spec.args.length - 2], "1,2,3");
  assertEquals(spec.args[spec.args.length - 1], "/output");
});

Deno.test("command: buildMkvCommand - with minlength", () => {
  const spec = buildMkvCommand(0, "all", "/output", { minlength: 120 });
  assertEquals(spec.args.includes("--minlength=120"), true);
});

Deno.test("command: buildMkvCommand - with general options", () => {
  const spec = buildMkvCommand(0, "all", "/output", {
    robot: true,
    cache: 1024,
  });
  assertEquals(spec.options?.robot, true);
  assertEquals(spec.options?.cache, 1024);
});

// ============================================================================
// buildBackupCommand Tests
// ============================================================================

Deno.test("command: buildBackupCommand - basic", () => {
  const spec = buildBackupCommand(0, "/output");
  assertEquals(spec.command, "backup");
  assertEquals(spec.args.includes("disc:0"), true);
  assertEquals(spec.args.includes("/output"), true);
});

Deno.test("command: buildBackupCommand - with decrypt", () => {
  const spec = buildBackupCommand(0, "/output", { decrypt: true });
  assertEquals(spec.args.includes("--decrypt"), true);
});

Deno.test("command: buildBackupCommand - with general options", () => {
  const spec = buildBackupCommand(0, "/output", {
    decrypt: true,
    cache: 512,
    robot: true,
  });
  assertEquals(spec.args.includes("--decrypt"), true);
  assertEquals(spec.options?.cache, 512);
  assertEquals(spec.options?.robot, true);
});

// ============================================================================
// buildStreamCommand Tests
// ============================================================================

Deno.test("command: buildStreamCommand - basic", () => {
  const spec = buildStreamCommand();
  assertEquals(spec.command, "stream");
});

Deno.test("command: buildStreamCommand - with streaming options", () => {
  const spec = buildStreamCommand({
    upnp: true,
    bindport: 51000,
  });
  assertEquals(spec.command, "stream");
  assertEquals(spec.args.includes("--upnp=true"), true);
  assertEquals(spec.args.includes("--bindport=51000"), true);
});

Deno.test("command: buildStreamCommand - with general options", () => {
  const spec = buildStreamCommand({
    upnp: true,
    cache: 128,
  });
  assertEquals(spec.options?.cache, 128);
});

// ============================================================================
// buildCommand Tests
// ============================================================================

Deno.test("command: buildCommand - combines general args and command args", () => {
  const spec = buildInfoCommand(0, { cache: 256, noscan: true });
  const args = buildCommand(spec);

  assertEquals(args.includes("--cache=256"), true);
  assertEquals(args.includes("--noscan"), true);
  assertEquals(args.includes("-r"), true);
  assertEquals(args.includes("info"), true);
  assertEquals(args.includes("disc:0"), true);
});

Deno.test("command: buildCommand - mkv with all options", () => {
  const spec = buildMkvCommand(0, [1, 2], "/output", {
    robot: true,
    cache: 1024,
    minlength: 300,
  });
  const args = buildCommand(spec);

  assertEquals(args.includes("-r"), true);
  assertEquals(args.includes("--cache=1024"), true);
  assertEquals(args.includes("--minlength=300"), true);
  assertEquals(args.includes("mkv"), true);
  assertEquals(args.includes("disc:0"), true);
  assertEquals(args.includes("1,2"), true);
  assertEquals(args.includes("/output"), true);
});

Deno.test("command: buildCommand - backup with decrypt", () => {
  const spec = buildBackupCommand(0, "/output", {
    decrypt: true,
    cache: 512,
  });
  const args = buildCommand(spec);

  assertEquals(args.includes("--cache=512"), true);
  assertEquals(args.includes("--decrypt"), true);
  assertEquals(args.includes("backup"), true);
  assertEquals(args.includes("disc:0"), true);
  assertEquals(args.includes("/output"), true);
});

Deno.test("command: buildCommand - stream with options", () => {
  const spec = buildStreamCommand({
    upnp: true,
    bindip: "192.168.1.100",
    bindport: 51000,
    cache: 128,
  });
  const args = buildCommand(spec);

  assertEquals(args.includes("--cache=128"), true);
  assertEquals(args.includes("--upnp=true"), true);
  assertEquals(args.includes("--bindip=192.168.1.100"), true);
  assertEquals(args.includes("--bindport=51000"), true);
  assertEquals(args.includes("stream"), true);
});

Deno.test("command: buildCommand - order of arguments", () => {
  const spec = buildInfoCommand(0, { cache: 256 });
  const args = buildCommand(spec);

  // General args should come before command
  const cacheIndex = args.indexOf("--cache=256");
  const commandIndex = args.indexOf("info");

  assertEquals(cacheIndex < commandIndex, true);
});
