/**
 * Integration tests using real disc data from fixtures
 * These tests parse actual makemkvcon output without requiring a physical drive
 */

import { assertEquals, assertExists } from "@std/assert";
import { AttributeId, parseDiscInfo, parseRobotOutput } from "./main.ts";

Deno.test("Integration: Parse demo disc from fixture", async () => {
  console.log("\n=== Parsing Demo Disc Fixture ===\n");

  // Load fixture
  const fixturePath = "fixtures/demo_disc_info.txt";
  const fixtureText = await Deno.readTextFile(fixturePath);
  console.log(`Loaded fixture: ${fixturePath}`);
  console.log(`Size: ${fixtureText.length} bytes\n`);

  // Parse robot output
  const robotOutput = parseRobotOutput(fixtureText);
  console.log(`Parsed ${robotOutput.length} robot output lines\n`);

  // Parse disc info
  const discInfo = parseDiscInfo(robotOutput);
  assertExists(discInfo);

  // Display disc-level attributes
  console.log("=== Disc Information ===\n");

  console.log(`Volume Name: ${discInfo.VolumeName}`);
  console.log(`Type: ${discInfo.Type}`);
  console.log(`Name: ${discInfo.Name}`);
  console.log(`Total Attributes: ${discInfo.attributes.size}`);

  // Verify disc attributes
  assertEquals(discInfo.VolumeName, "DEMO_MOVIE");
  assertEquals(discInfo.Type, "Blu-ray disc");
  assertEquals(discInfo.Name, "Demo Movie");

  // Display title information
  console.log(`\n=== Titles (${discInfo.titles.length} found) ===\n`);

  // Show first few titles with details
  const titlesToShow = Math.min(5, discInfo.titles.length);
  for (let i = 0; i < titlesToShow; i++) {
    const title = discInfo.titles[i];
    console.log(`Title ${title.id}:`);

    if (title.Name) console.log(`  Name: ${title.Name}`);
    if (title.Duration) console.log(`  Duration: ${title.Duration}`);
    if (title.ChapterCount) console.log(`  Chapters: ${title.ChapterCount}`);
    if (title.SourceFileName) console.log(`  Source: ${title.SourceFileName}`);
    if (title.OutputFileName) console.log(`  Output: ${title.OutputFileName}`);
    if (title.DiskSize) console.log(`  Size: ${title.DiskSize}`);
    console.log(`  Attributes: ${title.attributes.size}`);
    console.log(`  Streams: ${title.streams.length}`);
    console.log("");
  }

  if (discInfo.titles.length > titlesToShow) {
    console.log(
      `... and ${discInfo.titles.length - titlesToShow} more titles\n`,
    );
  }

  // Verify title count
  assertEquals(discInfo.titles.length, 108);

  // Verify main title (Title 4)
  const mainTitle = discInfo.titles.find((t) => t.id === 4);
  assertExists(mainTitle);
  assertEquals(mainTitle.Name, "Demo Movie");
  assertEquals(mainTitle.Duration, "1:47:28");
  assertEquals(mainTitle.ChapterCount, "20");
  assertEquals(mainTitle.DiskSize, "23.2 GB");

  console.log("=== Main Title Verification ===\n");
  console.log("✓ Title 4 (Main Feature):");
  console.log(`  Name: ${mainTitle.Name}`);
  console.log(`  Duration: ${mainTitle.Duration}`);
  console.log(`  Chapters: ${mainTitle.ChapterCount}`);
  console.log(`  Size: ${mainTitle.DiskSize}`);

  // Verify each title has valid structure
  for (const title of discInfo.titles) {
    assertEquals(typeof title.id, "number");
    assertEquals(title.attributes instanceof Map, true);
    assertEquals(Array.isArray(title.streams), true);
  }

  console.log(
    `\n✓ All ${discInfo.titles.length} titles have valid structure\n`,
  );
  console.log("=== Test Complete ===\n");
});
