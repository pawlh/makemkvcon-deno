# makemkvcon-deno

A fully modular Deno library for wrapping the `makemkvcon` command-line tool.
Provides TypeScript types, command builders, parsers, and high-level API
functions for working with MakeMKV.

## Features

- **TypeScript-first**: Comprehensive types for all makemkvcon operations
- **Robot mode parser**: Parse machine-readable output into structured objects
- **High-level API**: Convenient functions for common operations
- **Low-level access**: Direct command building and execution when needed

## Installation

### From GitHub (Direct Import)

```typescript
import {
  AttributeId,
  getDiscInfo,
} from "https://raw.githubusercontent.com/pawlh/makemkvcon-deno/main/main.ts";
```

### From JSR (Recommended)

Once published to JSR:

```typescript
import { getDiscInfo } from "jsr:@pawlh/makemkvcon-deno";
```

To publish to JSR, run:

```bash
deno publish
```

### Local Development

```typescript
import { AttributeId, getDiscInfo } from "./main.ts";
```

## Quick Start

### Get disc information

```typescript
import { getDiscInfo } from "./main.ts";

const result = await getDiscInfo(0);
console.log(result.robotOutput);
```

### Get structured disc information

```typescript
import { getStructuredDiscInfo } from "./main.ts";

const { discInfo } = await getStructuredDiscInfo(0);
if (discInfo) {
  console.log("Volume:", discInfo.VolumeName);
  console.log("Type:", discInfo.Type);
  console.log("Titles:", discInfo.titles.length);

  for (const title of discInfo.titles) {
    console.log(`Title ${title.id}: ${title.Name} (${title.Duration})`);
    console.log(`  Size: ${title.DiskSize}`);
    console.log(`  Chapters: ${title.ChapterCount}`);
  }
}
```

### List available drives

```typescript
import { getAvailableDrives } from "./main.ts";

const { drives } = await getAvailableDrives();
for (const drive of drives) {
  console.log(`Drive ${drive.index}: ${drive.driveName}`);
  console.log(`  Disc: ${drive.discName}`);
  console.log(`  Enabled: ${drive.enabled}`);
}
```

### Convert disc to MKV

```typescript
import { convertToMkv } from "./main.ts";

// Convert all titles
await convertToMkv(0, "all", "/output/folder", {
  robot: true,
  cache: 1024,
  minlength: 120,
});

// Convert specific titles
await convertToMkv(0, [1, 2, 3], "/output/folder");
```

### Backup disc

```typescript
import { backupDisc } from "./main.ts";

await backupDisc(0, "/backup/folder", {
  decrypt: true,
  cache: 1024,
  robot: true,
});
```

### Start streaming server

```typescript
import { startStreamingServer } from "./main.ts";

await startStreamingServer({
  upnp: true,
  bindip: "192.168.1.100",
  bindport: 51000,
  cache: 128,
});
```

## Architecture

The library is organized into modular components:

### `lib/types.ts`

- All TypeScript type definitions
- `AttributeId` enum mapping to AP_ItemAttributeId from apdefs.h
- `AttributeGetters` interface with all 52 AttributeId convenience properties
- Option types (MakeMkvOptions, StreamingOptions, BackupOptions,
  ConversionOptions)
- Result types (MakeMkvResult, DiscInfo, TitleInfo, StreamInfo)
- Robot output types (MSG, PRGC, PRGT, PRGV, DRV, TCOUT, CINFO, TINFO, SINFO)

### `lib/parser.ts`

- Robot mode output parsing
- `parseRobotLine()` - Parse individual output lines
- `parseRobotOutput()` - Parse complete output text
- `parseDiscInfo()` - Convert robot output to structured DiscInfo
- Helper functions: `getMessages()`, `getDrives()`, `getTitleCount()`, etc.

### `lib/command.ts`

- Command argument builders
- `buildGeneralArgs()` - Build general makemkvcon options
- Command-specific builders: `buildInfoCommand()`, `buildMkvCommand()`,
  `buildBackupCommand()`, etc.
- `buildCommand()` - Combine all arguments into final command array

### `lib/executor.ts`

- Command execution
- `execute()` - Execute a command specification
- `executeRaw()` - Execute with custom arguments
- Handles stdout/stderr capture and robot output parsing

### `lib/api.ts`

- High-level convenience functions
- `getDiscInfo()`, `getStructuredDiscInfo()`
- `listDrives()`, `getAvailableDrives()`
- `convertToMkv()`, `backupDisc()`, `startStreamingServer()`

## Robot Mode Output Format

MakeMKV's robot mode (`-r` flag) outputs machine-readable lines:

- **MSG**: Message output - `MSG:code,flags,count,message,format,param0,...`
- **PRGC/PRGT**: Progress titles - `PRGC:code,id,name`
- **PRGV**: Progress values - `PRGV:current,total,max`
- **DRV**: Drive information -
  `DRV:index,visible,enabled,flags,driveName,discName`
- **TCOUT**: Title count - `TCOUT:count`
- **CINFO**: Disc information - `CINFO:attributeId,messageCode,value`
- **TINFO**: Title information -
  `TINFO:titleNumber,attributeId,messageCode,value`
- **SINFO**: Stream information - `SINFO:streamId,attributeId,messageCode,value`

## AttributeId Enum

The `AttributeId` enum maps to AP_ItemAttributeId from MakeMKV's apdefs.h:

```typescript
enum AttributeId {
  Type = 1,
  Name = 2,
  LangCode = 3,
  CodecShort = 6,
  Duration = 9,
  SourceFileName = 16,
  VolumeName = 32,
  OutputFileName = 27,
  // ... and more
}
```

## Advanced Usage

### Low-level command building

```typescript
import { buildCommand, buildInfoCommand, execute } from "./main.ts";

const spec = buildInfoCommand(0, { cache: 512, noscan: true });
const args = buildCommand(spec);
console.log("Command args:", args);

const result = await execute(spec);
```

### Custom command execution

```typescript
import { executeRaw } from "./main.ts";

const result = await executeRaw(["-r", "info", "disc:0"]);
if (result.robotOutput) {
  for (const item of result.robotOutput) {
    console.log(item);
  }
}
```

### Parse existing robot output

```typescript
import { parseDiscInfo, parseRobotOutput } from "./main.ts";

const robotText = `CINFO:1,0,"DVD"
CINFO:32,0,"MY_DISC"
TCOUT:2
TINFO:0,2,0,"Title 1"
TINFO:0,9,0,"1:30:00"`;

const parsed = parseRobotOutput(robotText);
const discInfo = parseDiscInfo(parsed);

// Access with convenience properties
console.log("Type:", discInfo.Type); // "DVD"
console.log("Volume:", discInfo.VolumeName); // "MY_DISC"
console.log("Title Name:", discInfo.titles[0].Name); // "Title 1"
console.log("Duration:", discInfo.titles[0].Duration); // "1:30:00"
```

## Testing

Run tests:

```bash
deno task test
```

Run tests in watch mode:

```bash
deno task test:watch
```

Type check:

```bash
deno task check
```

## Requirements

- Deno 1.37+
- MakeMKV installed and `makemkvcon` available in PATH

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting PRs.

## References

- [MakeMKV Usage Documentation](https://www.makemkv.com/developers/usage.txt)
- MakeMKV apdefs.h (included in open-source package)
