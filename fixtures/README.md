# Test Fixtures

This directory contains real makemkvcon output captured from actual discs for
testing purposes.

## Files

### `demo_disc_info.txt`

Full output from `makemkvcon -r info disc:0` for a sample Blu-ray disc.

- **Source**: Sample Blu-ray disc
- **Disc Type**: BD-RE
- **Title Count**: 108 titles (indices 0-107)
- **Main Title**: Title 4 (1:47:28, 23.2 GB)
- **Lines**: 14,207

### `demo_disc_structured.txt`

Extracted structured data (CINFO, TINFO, SINFO) from the full output, containing
only the parseable robot mode lines.

- **Lines**: 14,072
- **Content**: CINFO, TINFO, and SINFO lines only

## Usage

Tests can load these fixtures to verify parsing logic without requiring a
physical disc drive:

```typescript
const fixtureText = await Deno.readTextFile("fixtures/demo_disc_info.txt");
const robotOutput = parseRobotOutput(fixtureText);
const discInfo = parseDiscInfo(robotOutput);
```

## Capturing New Fixtures

To capture output from a new disc:

```bash
makemkvcon -r info disc:0 > fixtures/new_disc_info.txt 2>&1
```
