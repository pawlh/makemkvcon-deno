/**
 * Tests for robot mode output parser
 */

import { assertEquals, assertExists } from "@std/assert";
import {
  getAttribute,
  getDrives,
  getMessages,
  getTitleCount,
  parseDiscInfo,
  parseRobotLine,
  parseRobotOutput,
  parseRobotValues,
} from "./parser.ts";
import { AttributeId } from "./types.ts";

// ============================================================================
// parseRobotValues Tests
// ============================================================================

Deno.test("parser: parseRobotValues - basic comma separated values", () => {
  const input = "1,2,3";
  const result = parseRobotValues(input);
  assertEquals(result, ["1", "2", "3"]);
});

Deno.test("parser: parseRobotValues - quoted strings", () => {
  const input = '"hello","world"';
  const result = parseRobotValues(input);
  assertEquals(result, ["hello", "world"]);
});

Deno.test("parser: parseRobotValues - escaped characters", () => {
  const input = '"hello\\"world","foo\\nbar"';
  const result = parseRobotValues(input);
  // Robot mode escapes: backslash followed by character becomes just the character
  assertEquals(result, ['hello"world', "foonbar"]);
});

Deno.test("parser: parseRobotValues - mixed quoted and unquoted", () => {
  const input = '1,"test",true';
  const result = parseRobotValues(input);
  assertEquals(result, ["1", "test", "true"]);
});

Deno.test("parser: parseRobotValues - empty string", () => {
  const input = "";
  const result = parseRobotValues(input);
  assertEquals(result, []);
});

Deno.test("parser: parseRobotValues - single value", () => {
  const input = "value";
  const result = parseRobotValues(input);
  assertEquals(result, ["value"]);
});

// ============================================================================
// parseRobotLine Tests
// ============================================================================

Deno.test("parser: parseRobotLine - MSG output", () => {
  const line = 'MSG:5005,0,0,"MakeMKV v1.17.7","MakeMKV v%1"';
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "MSG");
  if (result?.type === "MSG") {
    assertEquals(result.code, 5005);
    assertEquals(result.flags, 0);
    assertEquals(result.count, 0);
    assertEquals(result.message, "MakeMKV v1.17.7");
    assertEquals(result.format, "MakeMKV v%1");
  }
});

Deno.test("parser: parseRobotLine - MSG with parameters", () => {
  const line =
    'MSG:3307,0,2,"File %1 was added as title #%2","File %1 was added as title #%2","file.mkv","0"';
  const result = parseRobotLine(line);
  assertExists(result);
  if (result?.type === "MSG") {
    assertEquals(result.params, ["file.mkv", "0"]);
  }
});

Deno.test("parser: parseRobotLine - DRV output", () => {
  const line = 'DRV:0,1,1,0,"DVD+R-DL HL-DT-ST DVDRAM GH24NSC0","DISC_NAME"';
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "DRV");
  if (result?.type === "DRV") {
    assertEquals(result.index, 0);
    assertEquals(result.visible, true);
    assertEquals(result.enabled, true);
    assertEquals(result.flags, 0);
    assertEquals(result.driveName, "DVD+R-DL HL-DT-ST DVDRAM GH24NSC0");
    assertEquals(result.discName, "DISC_NAME");
  }
});

Deno.test("parser: parseRobotLine - CINFO output", () => {
  const line = 'CINFO:32,0,"VOLUME_NAME"';
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "CINFO");
  if (result?.type === "CINFO") {
    assertEquals(result.id, 32);
    assertEquals(result.code, 0);
    assertEquals(result.value, "VOLUME_NAME");
  }
});

Deno.test("parser: parseRobotLine - TINFO output", () => {
  const line = 'TINFO:0,16,0,"00001.m2ts"';
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "TINFO");
  if (result?.type === "TINFO") {
    assertEquals(result.id, 0);
    assertEquals(result.code, 16);
    assertEquals(result.value, "00001.m2ts");
  }
});

Deno.test("parser: parseRobotLine - SINFO output", () => {
  const line = 'SINFO:0,1,0,"Video"';
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "SINFO");
  if (result?.type === "SINFO") {
    assertEquals(result.id, 0);
    assertEquals(result.code, 1);
    assertEquals(result.value, "Video");
  }
});

Deno.test("parser: parseRobotLine - TCOUT output", () => {
  const line = "TCOUT:5";
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "TCOUT");
  if (result?.type === "TCOUT") {
    assertEquals(result.count, 5);
  }
});

Deno.test("parser: parseRobotLine - PRGC output", () => {
  const line = 'PRGC:1,0,"Scanning"';
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "PRGC");
  if (result?.type === "PRGC") {
    assertEquals(result.code, 1);
    assertEquals(result.id, 0);
    assertEquals(result.name, "Scanning");
  }
});

Deno.test("parser: parseRobotLine - PRGT output", () => {
  const line = 'PRGT:2,1,"Title #1"';
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "PRGT");
  if (result?.type === "PRGT") {
    assertEquals(result.code, 2);
    assertEquals(result.id, 1);
    assertEquals(result.name, "Title #1");
  }
});

Deno.test("parser: parseRobotLine - PRGV output", () => {
  const line = "PRGV:1024,2048,65536";
  const result = parseRobotLine(line);
  assertExists(result);
  assertEquals(result?.type, "PRGV");
  if (result?.type === "PRGV") {
    assertEquals(result.current, 1024);
    assertEquals(result.total, 2048);
    assertEquals(result.max, 65536);
  }
});

Deno.test("parser: parseRobotLine - invalid line", () => {
  const line = "INVALID";
  const result = parseRobotLine(line);
  assertEquals(result, null);
});

Deno.test("parser: parseRobotLine - empty line", () => {
  const line = "";
  const result = parseRobotLine(line);
  assertEquals(result, null);
});

// ============================================================================
// parseRobotOutput Tests
// ============================================================================

Deno.test("parser: parseRobotOutput - multiple lines", () => {
  const output = `MSG:5005,0,0,"MakeMKV v1.17.7","MakeMKV v%1"
TCOUT:3
CINFO:1,0,"DVD"
TINFO:0,16,0,"00001.m2ts"`;

  const result = parseRobotOutput(output);
  assertEquals(result.length, 4);
  assertEquals(result[0].type, "MSG");
  assertEquals(result[1].type, "TCOUT");
  assertEquals(result[2].type, "CINFO");
  assertEquals(result[3].type, "TINFO");
});

Deno.test("parser: parseRobotOutput - with invalid lines", () => {
  const output = `MSG:5005,0,0,"MakeMKV v1.17.7","MakeMKV v%1"
INVALID LINE
TCOUT:3`;

  const result = parseRobotOutput(output);
  assertEquals(result.length, 2);
  assertEquals(result[0].type, "MSG");
  assertEquals(result[1].type, "TCOUT");
});

// ============================================================================
// Helper Function Tests
// ============================================================================

Deno.test("parser: getMessages - extracts messages from robot output", () => {
  const output = parseRobotOutput(
    `MSG:5005,0,0,"MakeMKV v1.17.7","MakeMKV v%1"
MSG:5010,0,0,"Scanning...","Scanning..."
TCOUT:3`,
  );

  const messages = getMessages(output);
  assertEquals(messages.length, 2);
  assertEquals(messages[0], "MakeMKV v1.17.7");
  assertEquals(messages[1], "Scanning...");
});

Deno.test("parser: getDrives - extracts drive info from robot output", () => {
  const output = parseRobotOutput(
    'DRV:0,1,1,0,"Drive 1","Disc 1"\nDRV:1,1,0,0,"Drive 2",""',
  );

  const drives = getDrives(output);
  assertEquals(drives.length, 2);
  assertEquals(drives[0].index, 0);
  assertEquals(drives[0].enabled, true);
  assertEquals(drives[1].index, 1);
  assertEquals(drives[1].enabled, false);
});

Deno.test("parser: getTitleCount - extracts title count", () => {
  const output = parseRobotOutput("TCOUT:5");
  const count = getTitleCount(output);
  assertEquals(count, 5);
});

Deno.test("parser: getTitleCount - no title count", () => {
  const output = parseRobotOutput(
    'MSG:5005,0,0,"MakeMKV v1.17.7","MakeMKV v%1"',
  );
  const count = getTitleCount(output);
  assertEquals(count, null);
});

// ============================================================================
// parseDiscInfo Tests
// ============================================================================

Deno.test("parser: parseDiscInfo - organizes CINFO and TINFO", () => {
  // Format is: CINFO:attributeId,messageCode,value
  // TINFO:titleNumber,attributeId,messageCode,value
  // AttributeId.Type = 1, AttributeId.VolumeName = 32, AttributeId.Name = 2, AttributeId.SourceFileName = 16
  const output = parseRobotOutput(
    `CINFO:1,0,"DVD"
CINFO:32,0,"MY_DISC"
TCOUT:2
TINFO:0,2,0,"Title 1"
TINFO:0,16,0,"00001.m2ts"
TINFO:1,2,0,"Title 2"
TINFO:1,16,0,"00002.m2ts"`,
  );

  const discInfo = parseDiscInfo(output);
  assertExists(discInfo);

  // Check disc attributes (CINFO uses id as AttributeId)
  assertEquals(discInfo.attributes.get(AttributeId.Type), "DVD");
  assertEquals(discInfo.attributes.get(AttributeId.VolumeName), "MY_DISC");

  // Check titles
  assertEquals(discInfo.titles.length, 2);
  assertEquals(discInfo.titles[0].id, 0);
  assertEquals(discInfo.titles[1].id, 1);

  // TINFO uses code as AttributeId, value is in the 4th field (parts[3])
  assertEquals(discInfo.titles[0].attributes.get(AttributeId.Name), "Title 1");
  assertEquals(
    discInfo.titles[0].attributes.get(AttributeId.SourceFileName),
    "00001.m2ts",
  );
  assertEquals(discInfo.titles[1].attributes.get(AttributeId.Name), "Title 2");
});

Deno.test("parser: parseDiscInfo - empty output", () => {
  const output = parseRobotOutput("");
  const discInfo = parseDiscInfo(output);

  assertEquals(discInfo.attributes.size, 0);
  assertEquals(discInfo.titles.length, 0);
});

// ============================================================================
// getAttribute Tests
// ============================================================================

Deno.test("parser: getAttribute - gets attribute value", () => {
  const attrs = new Map<AttributeId, string>();
  attrs.set(AttributeId.Name, "Test Title");
  attrs.set(AttributeId.Duration, "01:30:00");

  assertEquals(getAttribute(attrs, AttributeId.Name), "Test Title");
  assertEquals(getAttribute(attrs, AttributeId.Duration), "01:30:00");
  assertEquals(getAttribute(attrs, AttributeId.Type), undefined);
});
