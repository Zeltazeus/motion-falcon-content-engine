import type { BrandSettings, ChannelConnections, ScheduleConfig } from "./types";

export const STORAGE_KEYS = {
  queue: "mf_queue",
  settings: "mf_settings",
  log: "mf_log",
  channels: "mf_channels",
  schedule: "mf_schedule",
  stats: "mf_stats",
} as const;

export const DEFAULT_SETTINGS: BrandSettings = {
  companyName: "Motion Falcon",
  website: "motionfalcon.com",
  services:
    "3D CGI Animation, AR/VR/MR, Visual Storytelling, Product Visualization",
  industries:
    "Marketing Directors, Creative Agencies, Consumer Brands, Real Estate Developers",
  signature:
    "Let's bring your vision to life with cinematic 3D CGI — motionfalcon.com",
  hashtags: "#3DAnimation #CGI #VisualStorytelling #ProductVisualization #ARVR",
};

export const DEFAULT_CHANNELS: ChannelConnections = {
  linkedinWebhook: "",
  wixApiKey: "",
  wixSiteId: "",
};

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false,
  postTime: "09:00",
  frequency: "daily",
  days: {
    Monday: { enabled: true, topic: "Trending 3D/CGI techniques" },
    Tuesday: { enabled: true, topic: "Product visualization case study" },
    Wednesday: { enabled: true, topic: "AR/VR industry trends" },
    Thursday: { enabled: true, topic: "Behind-the-scenes studio process" },
    Friday: { enabled: true, topic: "Client success story" },
    Saturday: { enabled: false, topic: "Weekend inspiration — visual storytelling" },
    Sunday: { enabled: false, topic: "Week ahead — creative outlook" },
  },
};

export const CONTENT_FOCUS_OPTIONS = [
  "Trending 3D/CGI topics",
  "Project showcase",
  "Tutorial/How-to",
  "AR/VR trends",
  "Client use cases",
];

export const AUDIENCE_OPTIONS = [
  "Marketing Directors/CMOs",
  "Creative agencies",
  "Product companies",
  "Real estate developers",
  "General B2B",
];

export const TONE_OPTIONS = [
  "Expert authority",
  "Educational",
  "Provocative",
];

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "3x", label: "3x per week" },
  { value: "weekly", label: "Weekly" },
] as const;

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
