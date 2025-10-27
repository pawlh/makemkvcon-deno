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
  const volumeName = discInfo.attributes.get(AttributeId.VolumeName);
  const discType = discInfo.attributes.get(AttributeId.Type);
  const discName = discInfo.attributes.get(AttributeId.Name);

  console.log(`Volume Name: ${volumeName}`);
  console.log(`Type: ${discType}`);
  console.log(`Name: ${discName}`);
  console.log(`Total Attributes: ${discInfo.attributes.size}`);

  // Verify disc attributes
  assertEquals(volumeName, "DEMO_MOVIE");
  assertEquals(discType, "Blu-ray disc");
  assertEquals(discName, "Demo Movie");

  // Display title information
  console.log(`\n=== Titles (${discInfo.titles.length} found) ===\n`);

  // Show first few titles with details
  const titlesToShow = Math.min(5, discInfo.titles.length);
  for (let i = 0; i < titlesToShow; i++) {
    const title = discInfo.titles[i];
    console.log(`Title ${title.id}:`);

    const name = title.attributes.get(AttributeId.Name);
    const duration = title.attributes.get(AttributeId.Duration);
    const chapterCount = title.attributes.get(AttributeId.ChapterCount);
    const sourceFileName = title.attributes.get(AttributeId.SourceFileName);
    const outputFileName = title.attributes.get(AttributeId.OutputFileName);
    const fileSize = title.attributes.get(AttributeId.DiskSize);

    if (name) console.log(`  Name: ${name}`);
    if (duration) console.log(`  Duration: ${duration}`);
    if (chapterCount) console.log(`  Chapters: ${chapterCount}`);
    if (sourceFileName) console.log(`  Source: ${sourceFileName}`);
    if (outputFileName) console.log(`  Output: ${outputFileName}`);
    if (fileSize) console.log(`  Size: ${fileSize}`);
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
  assertEquals(mainTitle.attributes.get(AttributeId.Name), "Demo Movie");
  assertEquals(mainTitle.attributes.get(AttributeId.Duration), "1:47:28");
  assertEquals(mainTitle.attributes.get(AttributeId.ChapterCount), "20");
  assertEquals(mainTitle.attributes.get(AttributeId.DiskSize), "23.2 GB");

  console.log("=== Main Title Verification ===\n");
  console.log("✓ Title 4 (Main Feature):");
  console.log(`  Name: ${mainTitle.attributes.get(AttributeId.Name)}`);
  console.log(`  Duration: ${mainTitle.attributes.get(AttributeId.Duration)}`);
  console.log(
    `  Chapters: ${mainTitle.attributes.get(AttributeId.ChapterCount)}`,
  );
  console.log(`  Size: ${mainTitle.attributes.get(AttributeId.DiskSize)}`);

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
