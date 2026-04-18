export type ChannelType = "linkedin" | "wix";

export type PostStatus = "scheduled" | "failed" | "published" | "draft";

export interface QueuedPost {
  id: string;
  blogTitle: string;
  blogBody: string;
  linkedinPost: string;
  scheduledAt: string; // ISO timestamp
  channels: ChannelType[];
  status: PostStatus;
  createdAt: string;
  error?: string;
}

export interface BrandSettings {
  companyName: string;
  website: string;
  services: string;
  industries: string;
  signature: string;
  hashtags: string;
}

export interface ChannelConnections {
  linkedinWebhook: string;
  wixApiKey: string;
  wixSiteId: string;
}

export type Frequency = "daily" | "3x" | "weekly";

export interface ScheduleConfig {
  enabled: boolean;
  postTime: string; // HH:MM
  frequency: Frequency;
  days: Record<string, { enabled: boolean; topic: string }>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "warn";
  message: string;
}

export interface GeneratedContent {
  blogTitle: string;
  blogBody: string;
  linkedinPost: string;
}

export interface GenerateRequest {
  topic: string;
  tone: string;
  audience: string;
  focus?: string;
  keyPoints?: string;
  cta?: string;
  settings: BrandSettings;
}
