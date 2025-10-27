/**
 * TypeScript types for makemkvcon CLI wrapper
 * Based on makemkvcon documentation and apdefs.h
 */

/**
 * AP_ItemAttributeId enum from apdefs.h
 * Maps attribute IDs to their semantic meaning
 */
export enum AttributeId {
  Unknown = 0,
  Type = 1,
  Name = 2,
  LangCode = 3,
  LangName = 4,
  CodecId = 5,
  CodecShort = 6,
  CodecLong = 7,
  ChapterCount = 8,
  Duration = 9,
  DiskSize = 10,
  DiskSizeBytes = 11,
  StreamTypeExtension = 12,
  Bitrate = 13,
  AudioChannelsCount = 14,
  AngleInfo = 15,
  SourceFileName = 16,
  AudioSampleRate = 17,
  AudioSampleSize = 18,
  VideoSize = 19,
  VideoAspectRatio = 20,
  VideoFrameRate = 21,
  StreamFlags = 22,
  DateTime = 23,
  OriginalTitleId = 24,
  SegmentsCount = 25,
  SegmentsMap = 26,
  OutputFileName = 27,
  MetadataLanguageCode = 28,
  MetadataLanguageName = 29,
  TreeInfo = 30,
  PanelTitle = 31,
  VolumeName = 32,
  OrderWeight = 33,
  OutputFormat = 34,
  OutputFormatDescription = 35,
  SeamlessInfo = 36,
  PanelText = 37,
  MkvFlags = 38,
  MkvFlagsText = 39,
  AudioChannelLayoutName = 40,
  OutputCodecShort = 41,
  OutputConversionType = 42,
  OutputAudioSampleRate = 43,
  OutputAudioSampleSize = 44,
  OutputAudioChannelsCount = 45,
  OutputAudioChannelLayoutName = 46,
  OutputAudioChannelLayout = 47,
  OutputAudioMixDescription = 48,
  Comment = 49,
  OffsetSequenceId = 50,
}

/**
 * General options for makemkvcon commands
 */
export interface MakeMkvOptions {
  /** Output all messages to file ("-stdout", "-stderr", "-null", or file path) */
  messages?: string;
  /** Output progress messages to file ("-stdout", "-stderr", "-null", "-same", or file path) */
  progress?: string;
  /** Enable debug messages and optionally set debug file location */
  debug?: boolean | string;
  /** Enable or disable direct disc access */
  directio?: boolean;
  /** Don't access media during disc scan */
  noscan?: boolean;
  /** Size of read cache in megabytes */
  cache?: number;
  /** Enable automation/robot mode for easier parsing */
  robot?: boolean;
}

/**
 * Streaming-specific options
 */
export interface StreamingOptions {
  /** Enable or disable UPNP streaming */
  upnp?: boolean;
  /** IP address to bind */
  bindip?: string;
  /** Web server port to bind */
  bindport?: number;
}

/**
 * Backup-specific options
 */
export interface BackupOptions {
  /** Decrypt stream files during backup */
  decrypt?: boolean;
}

/**
 * Conversion-specific options
 */
export interface ConversionOptions {
  /** Minimum title length in seconds */
  minlength?: number;
}

/**
 * Message output in robot mode
 * Format: MSG:code,flags,count,message,format,param0,param1,...
 */
export interface MsgOutput {
  type: "MSG";
  code: number;
  flags: number;
  count: number;
  message: string;
  format: string;
  params: string[];
}

/**
 * Progress title (current/total)
 * Format: PRGC:code,id,name or PRGT:code,id,name
 */
export interface ProgressTitle {
  type: "PRGC" | "PRGT";
  code: number;
  id: number;
  name: string;
}

/**
 * Progress bar values
 * Format: PRGV:current,total,max
 */
export interface ProgressValue {
  type: "PRGV";
  current: number;
  total: number;
  max: number;
}

/**
 * Drive scan output
 * Format: DRV:index,visible,enabled,flags,drive name,disc name
 */
export interface DriveInfo {
  type: "DRV";
  index: number;
  visible: boolean;
  enabled: boolean;
  flags: number;
  driveName: string;
  discName: string;
}

/**
 * Title count output
 * Format: TCOUT:count
 */
export interface TitleCount {
  type: "TCOUT";
  count: number;
}

/**
 * Disc/Title/Stream information
 * Format: CINFO:id,code,value or TINFO:id,code,value or SINFO:id,code,value
 */
export interface InfoOutput {
  type: "CINFO" | "TINFO" | "SINFO";
  id: number;
  code: number;
  value: string;
}

/**
 * Union type for all robot mode output types
 */
export type RobotOutput =
  | MsgOutput
  | ProgressTitle
  | ProgressValue
  | DriveInfo
  | TitleCount
  | InfoOutput;

/**
 * Result of executing a makemkvcon command
 */
export interface MakeMkvResult {
  /** Exit code from the command */
  exitCode: number;
  /** Raw stdout output */
  stdout: string;
  /** Raw stderr output */
  stderr: string;
  /** Parsed robot mode output (if robot mode was enabled) */
  robotOutput?: RobotOutput[];
}

/**
 * All AttributeId properties available as convenience getters
 */
export interface AttributeGetters {
  readonly Unknown?: string;
  readonly Type?: string;
  readonly Name?: string;
  readonly LangCode?: string;
  readonly LangName?: string;
  readonly CodecId?: string;
  readonly CodecShort?: string;
  readonly CodecLong?: string;
  readonly ChapterCount?: string;
  readonly Duration?: string;
  readonly DiskSize?: string;
  readonly DiskSizeBytes?: string;
  readonly StreamTypeExtension?: string;
  readonly Bitrate?: string;
  readonly AudioChannelsCount?: string;
  readonly AngleInfo?: string;
  readonly SourceFileName?: string;
  readonly AudioSampleRate?: string;
  readonly AudioSampleSize?: string;
  readonly VideoSize?: string;
  readonly VideoAspectRatio?: string;
  readonly VideoFrameRate?: string;
  readonly StreamFlags?: string;
  readonly DateTime?: string;
  readonly OriginalTitleId?: string;
  readonly SegmentsCount?: string;
  readonly SegmentsMap?: string;
  readonly OutputFileName?: string;
  readonly MetadataLanguageCode?: string;
  readonly MetadataLanguageName?: string;
  readonly TreeInfo?: string;
  readonly PanelTitle?: string;
  readonly VolumeName?: string;
  readonly OrderWeight?: string;
  readonly OutputFormat?: string;
  readonly OutputFormatDescription?: string;
  readonly SeamlessInfo?: string;
  readonly PanelText?: string;
  readonly MkvFlags?: string;
  readonly MkvFlagsText?: string;
  readonly AudioChannelLayoutName?: string;
  readonly OutputCodecShort?: string;
  readonly OutputConversionType?: string;
  readonly OutputAudioSampleRate?: string;
  readonly OutputAudioSampleSize?: string;
  readonly OutputAudioChannelsCount?: string;
  readonly OutputAudioChannelLayoutName?: string;
  readonly OutputAudioChannelLayout?: string;
  readonly OutputAudioMixDescription?: string;
  readonly Comment?: string;
  readonly OffsetSequenceId?: string;
}

/**
 * Structured disc information
 */
export interface DiscInfo extends AttributeGetters {
  /** Disc attributes */
  attributes: Map<AttributeId, string>;
  /** Titles on the disc */
  titles: TitleInfo[];
}

/**
 * Structured title information
 */
export interface TitleInfo extends AttributeGetters {
  /** Title ID */
  id: number;
  /** Title attributes */
  attributes: Map<AttributeId, string>;
  /** Streams in the title */
  streams: StreamInfo[];
}

/**
 * Structured stream information
 */
export interface StreamInfo extends AttributeGetters {
  /** Stream ID */
  id: number;
  /** Stream attributes */
  attributes: Map<AttributeId, string>;
}
