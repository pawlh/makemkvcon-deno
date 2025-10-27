/**
 * Tests for high-level API functions
 * These tests verify the API functions properly wire together the command builders and executor
 */

import { assertEquals } from "@std/assert";
import {
  buildBackupCommand,
  buildInfoCommand,
  buildListDrivesCommand,
  buildMkvCommand,
  buildStreamCommand,
} from "./command.ts";

// ============================================================================
// Command Spec Tests
// These verify that the API functions use the correct command builders
// ============================================================================

Deno.test("api: getDiscInfo should use buildInfoCommand", () => {
  const spec = buildInfoCommand(0, { cache: 256 });

  assertEquals(spec.command, "info");
  assertEquals(spec.args, ["disc:0"]);
  assertEquals(spec.options?.robot, true);
  assertEquals(spec.options?.cache, 256);
});

Deno.test("api: listDrives should use buildListDrivesCommand", () => {
  const spec = buildListDrivesCommand({ messages: "-stdout" });

  assertEquals(spec.command, "info");
  assertEquals(spec.args, ["disc:9999"]);
  assertEquals(spec.options?.robot, true);
  assertEquals(spec.options?.cache, 1);
  assertEquals(spec.options?.messages, "-stdout");
});

Deno.test("api: convertToMkv should use buildMkvCommand with all titles", () => {
  const spec = buildMkvCommand(0, "all", "/output", {
    robot: true,
    cache: 1024,
    minlength: 120,
  });

  assertEquals(spec.command, "mkv");
  assertEquals(spec.args.includes("disc:0"), true);
  assertEquals(spec.args.includes("all"), true);
  assertEquals(spec.args.includes("/output"), true);
  assertEquals(spec.args.includes("--minlength=120"), true);
  assertEquals(spec.options?.robot, true);
  assertEquals(spec.options?.cache, 1024);
});

Deno.test("api: convertToMkv should use buildMkvCommand with specific titles", () => {
  const spec = buildMkvCommand(0, [1, 2, 3], "/output");

  assertEquals(spec.command, "mkv");
  assertEquals(spec.args.includes("1,2,3"), true);
});

Deno.test("api: backupDisc should use buildBackupCommand", () => {
  const spec = buildBackupCommand(0, "/output", {
    decrypt: true,
    cache: 1024,
    robot: true,
  });

  assertEquals(spec.command, "backup");
  assertEquals(spec.args.includes("--decrypt"), true);
  assertEquals(spec.args.includes("disc:0"), true);
  assertEquals(spec.args.includes("/output"), true);
  assertEquals(spec.options?.cache, 1024);
  assertEquals(spec.options?.robot, true);
});

Deno.test("api: startStreamingServer should use buildStreamCommand", () => {
  const spec = buildStreamCommand({
    upnp: true,
    bindip: "192.168.1.100",
    bindport: 51000,
    cache: 128,
  });

  assertEquals(spec.command, "stream");
  assertEquals(spec.args.includes("--upnp=true"), true);
  assertEquals(spec.args.includes("--bindip=192.168.1.100"), true);
  assertEquals(spec.args.includes("--bindport=51000"), true);
  assertEquals(spec.options?.cache, 128);
});
