import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_CHANNELS,
  DEFAULT_SCHEDULE,
} from "./constants";
import type {
  BrandSettings,
  ChannelConnections,
  LogEntry,
  QueuedPost,
  ScheduleConfig,
} from "./types";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// Queue
export function getQueue(): QueuedPost[] {
  if (!isBrowser()) return [];
  return safeParse<QueuedPost[]>(
    localStorage.getItem(STORAGE_KEYS.queue),
    []
  );
}

export function setQueue(queue: QueuedPost[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(queue));
}

export function addToQueue(post: QueuedPost) {
  const queue = getQueue();
  queue.push(post);
  setQueue(queue);
}

export function removeFromQueue(id: string) {
  setQueue(getQueue().filter((p) => p.id !== id));
}

export function updateQueueItem(id: string, patch: Partial<QueuedPost>) {
  setQueue(
    getQueue().map((p) => (p.id === id ? { ...p, ...patch } : p))
  );
}

// Settings
export function getSettings(): BrandSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  return safeParse<BrandSettings>(
    localStorage.getItem(STORAGE_KEYS.settings),
    DEFAULT_SETTINGS
  );
}

export function setSettings(settings: BrandSettings) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

// Channels
export function getChannels(): ChannelConnections {
  if (!isBrowser()) return DEFAULT_CHANNELS;
  return safeParse<ChannelConnections>(
    localStorage.getItem(STORAGE_KEYS.channels),
    DEFAULT_CHANNELS
  );
}

export function setChannels(channels: ChannelConnections) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.channels, JSON.stringify(channels));
}

// Schedule
export function getSchedule(): ScheduleConfig {
  if (!isBrowser()) return DEFAULT_SCHEDULE;
  return safeParse<ScheduleConfig>(
    localStorage.getItem(STORAGE_KEYS.schedule),
    DEFAULT_SCHEDULE
  );
}

export function setSchedule(schedule: ScheduleConfig) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(schedule));
}

// Log
export function getLog(): LogEntry[] {
  if (!isBrowser()) return [];
  return safeParse<LogEntry[]>(localStorage.getItem(STORAGE_KEYS.log), []);
}

export function setLog(log: LogEntry[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.log, JSON.stringify(log));
}

export function addLog(entry: Omit<LogEntry, "id" | "timestamp">) {
  const log = getLog();
  const next: LogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  log.unshift(next);
  // Cap at 200 entries
  setLog(log.slice(0, 200));
  return next;
}

// Stats
export interface Stats {
  published: number;
}

export function getStats(): Stats {
  if (!isBrowser()) return { published: 0 };
  return safeParse<Stats>(
    localStorage.getItem(STORAGE_KEYS.stats),
    { published: 0 }
  );
}

export function incrementPublished(by = 1) {
  const stats = getStats();
  stats.published += by;
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
  }
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
