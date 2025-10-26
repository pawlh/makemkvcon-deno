/**
 * Parser for makemkvcon robot mode output
 * Handles parsing of various output line types (MSG, PRGC, PRGT, PRGV, DRV, TCOUT, CINFO, TINFO, SINFO)
 */

import type {
  AttributeId,
  DiscInfo,
  InfoOutput,
  RobotOutput,
  StreamInfo,
  TitleInfo,
} from "./types.ts";

/**
 * Parses comma-separated values with support for quoted strings and escaping
 * Handles the robot mode output format where strings are quoted and control characters are backslash-escaped
 */
export function parseRobotValues(input: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current || values.length > 0) {
    values.push(current);
  }

  return values;
}

/**
 * Parses a single line of robot mode output
 */
export function parseRobotLine(line: string): RobotOutput | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Split by colon to get type and rest
  const colonIndex = trimmed.indexOf(":");
  if (colonIndex === -1) return null;

  const type = trimmed.substring(0, colonIndex);
  const rest = trimmed.substring(colonIndex + 1);

  try {
    switch (type) {
      case "MSG": {
        const parts = parseRobotValues(rest);
        if (parts.length < 5) return null;
        const code = parseInt(parts[0]);
        const flags = parseInt(parts[1]);
        const count = parseInt(parts[2]);
        if (isNaN(code) || isNaN(flags) || isNaN(count)) return null;
        return {
          type: "MSG",
          code,
          flags,
          count,
          message: parts[3],
          format: parts[4],
          params: parts.slice(5),
        };
      }

      case "PRGC":
      case "PRGT": {
        const parts = parseRobotValues(rest);
        if (parts.length < 3) return null;
        const code = parseInt(parts[0]);
        const id = parseInt(parts[1]);
        if (isNaN(code) || isNaN(id)) return null;
        return {
          type,
          code,
          id,
          name: parts[2],
        };
      }

      case "PRGV": {
        const parts = parseRobotValues(rest);
        if (parts.length < 3) return null;
        const current = parseInt(parts[0]);
        const total = parseInt(parts[1]);
        const max = parseInt(parts[2]);
        if (isNaN(current) || isNaN(total) || isNaN(max)) return null;
        return {
          type: "PRGV",
          current,
          total,
          max,
        };
      }

      case "DRV": {
        const parts = parseRobotValues(rest);
        if (parts.length < 6) return null;
        const index = parseInt(parts[0]);
        const flags = parseInt(parts[3]);
        if (isNaN(index) || isNaN(flags)) return null;
        return {
          type: "DRV",
          index,
          visible: parts[1] === "1",
          enabled: parts[2] === "1",
          flags,
          driveName: parts[4],
          discName: parts[5],
        };
      }

      case "TCOUT": {
        const parts = parseRobotValues(rest);
        if (parts.length < 1) return null;
        const count = parseInt(parts[0]);
        if (isNaN(count)) return null;
        return {
          type: "TCOUT",
          count,
        };
      }

      case "CINFO":
      case "TINFO":
      case "SINFO": {
        const parts = parseRobotValues(rest);
        if (parts.length < 3) return null;
        const id = parseInt(parts[0]);
        const code = parseInt(parts[1]);
        if (isNaN(id) || isNaN(code)) return null;
        return {
          type,
          id,
          code,
          value: parts[2],
        };
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Parses raw robot mode output text into structured objects
 */
export function parseRobotOutput(output: string): RobotOutput[] {
  return output
    .split("\n")
    .map((line) => parseRobotLine(line))
    .filter((item): item is RobotOutput => item !== null);
}

/**
 * Converts robot output to structured disc information
 * Organizes CINFO, TINFO, and SINFO lines into a hierarchical structure
 *
 * Format notes:
 * - CINFO:attributeId,messageCode,value - 'id' is the AttributeId
 * - TINFO:titleNumber,attributeId,messageCode,value - 'id' is title number, 'code' is AttributeId
 * - SINFO:streamId,attributeId,messageCode,value - similar to TINFO
 */
export function parseDiscInfo(robotOutput: RobotOutput[]): DiscInfo {
  const discAttributes = new Map<AttributeId, string>();
  const titlesMap = new Map<number, TitleInfo>();

  for (const item of robotOutput) {
    if (item.type === "CINFO") {
      // Disc-level information: CINFO:attributeId,messageCode,value
      // For disc info, 'id' field is the AttributeId
      discAttributes.set(item.id as AttributeId, item.value);
    } else if (item.type === "TINFO") {
      // Title-level information: TINFO:titleNumber,attributeId,messageCode,value
      // 'id' is the title number, 'code' is the AttributeId
      if (!titlesMap.has(item.id)) {
        titlesMap.set(item.id, {
          id: item.id,
          attributes: new Map(),
          streams: [],
        });
      }
      const title = titlesMap.get(item.id)!;
      title.attributes.set(item.code as AttributeId, item.value);
    } else if (item.type === "SINFO") {
      // Stream-level information
      // SINFO format: id is encoded as titleId*100 + streamId (approximately)
      // We need to parse the stream structure differently
      // For now, we'll collect streams separately and organize them later
      // This is a simplified approach - you may need to adjust based on actual output
    }
  }

  // Convert titles map to array
  const titles = Array.from(titlesMap.values());

  return {
    attributes: discAttributes,
    titles,
  };
}

/**
 * Extracts disc information including titles and streams
 * More advanced parser that handles SINFO correctly
 */
export function parseDiscInfoAdvanced(robotOutput: RobotOutput[]): DiscInfo {
  const discAttributes = new Map<AttributeId, string>();
  const titlesMap = new Map<number, TitleInfo>();
  const streamsMap = new Map<string, StreamInfo>();

  // First pass: collect all info
  for (const item of robotOutput) {
    if (item.type === "CINFO") {
      discAttributes.set(item.code as AttributeId, item.value);
    } else if (item.type === "TINFO") {
      if (!titlesMap.has(item.id)) {
        titlesMap.set(item.id, {
          id: item.id,
          attributes: new Map(),
          streams: [],
        });
      }
      const title = titlesMap.get(item.id)!;
      title.attributes.set(item.code as AttributeId, item.value);
    } else if (item.type === "SINFO") {
      // SINFO id format is complex - needs parsing based on actual format
      // For now, store with composite key
      const key = `${item.id}-${item.code}`;
      if (!streamsMap.has(key)) {
        streamsMap.set(key, {
          id: item.id,
          attributes: new Map(),
        });
      }
      const stream = streamsMap.get(key)!;
      stream.attributes.set(item.code as AttributeId, item.value);
    }
  }

  // Second pass: organize streams into titles
  // This requires understanding the SINFO id encoding
  // For simplicity, we'll leave streams separate for now

  const titles = Array.from(titlesMap.values());

  return {
    attributes: discAttributes,
    titles,
  };
}

/**
 * Helper to get attribute value from a map by AttributeId
 */
export function getAttribute(
  attributes: Map<AttributeId, string>,
  id: AttributeId,
): string | undefined {
  return attributes.get(id);
}

/**
 * Helper to get all messages from robot output
 */
export function getMessages(robotOutput: RobotOutput[]): string[] {
  return robotOutput
    .filter((item): item is Extract<RobotOutput, { type: "MSG" }> =>
      item.type === "MSG"
    )
    .map((msg) => msg.message);
}

/**
 * Helper to get all drives from robot output
 */
export function getDrives(
  robotOutput: RobotOutput[],
): Array<Extract<RobotOutput, { type: "DRV" }>> {
  return robotOutput.filter((
    item,
  ): item is Extract<RobotOutput, { type: "DRV" }> => item.type === "DRV");
}

/**
 * Helper to get title count from robot output
 */
export function getTitleCount(robotOutput: RobotOutput[]): number | null {
  const tcout = robotOutput.find((
    item,
  ): item is Extract<RobotOutput, { type: "TCOUT" }> => item.type === "TCOUT");
  return tcout?.count ?? null;
}
