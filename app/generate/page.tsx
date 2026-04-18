"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Label, Select, Textarea } from "@/components/Input";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { CopyButton } from "@/components/CopyButton";
import { GenerationOverlay } from "@/components/GenerationOverlay";
import { useToast } from "@/components/ToastProvider";
import {
  AUDIENCE_OPTIONS,
  CONTENT_FOCUS_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/constants";
import {
  addLog,
  addToQueue,
  generateId,
  getChannels,
  getSettings,
  incrementPublished,
} from "@/lib/storage";
import { cx } from "@/lib/utils";
import type { GeneratedContent, QueuedPost } from "@/lib/types";

type Mode = "auto" | "manual";
type PreviewTab = "blog" | "linkedin";

export default function GeneratePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("auto");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("blog");

  const [focus, setFocus] = useState(CONTENT_FOCUS_OPTIONS[0]);
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);

  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [cta, setCta] = useState("");

  const [overlayActive, setOverlayActive] = useState(false);
  const [overlayFinished, setOverlayFinished] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    // Prefill CTA from settings
    if (typeof window !== "undefined" && !cta) {
      setCta(getSettings().signature);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    const derivedTopic =
      mode === "manual"
        ? topic.trim() || focus
        : focus;

    if (mode === "manual" && !topic.trim()) {
      toast("Please enter a topic", "error");
      return;
    }

    setOverlayActive(true);
    setOverlayFinished(false);
    setGenerated(null);

    const settings = getSettings();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: derivedTopic,
          tone,
          audience,
          focus: mode === "auto" ? focus : undefined,
          keyPoints: mode === "manual" ? keyPoints : undefined,
          cta: mode === "manual" ? cta : settings.signature,
          settings,
        }),
      });
      if (!res.ok) {
        throw new Error(`Generate failed: ${res.status}`);
      }
      const data = (await res.json()) as GeneratedContent;
      setGenerated(data);
      setOverlayFinished(true);
      addLog({
        type: "success",
        message: `Generated: "${data.blogTitle}"`,
      });
      setTimeout(() => {
        setOverlayActive(false);
      }, 650);
    } catch (err) {
      console.error(err);
      toast("Generation failed — please try again", "error");
      addLog({
        type: "error",
        message: `Generation failed for "${derivedTopic}"`,
      });
      setOverlayActive(false);
    }
  }

  function handleAddToQueue() {
    if (!generated) return;
    const channels = getChannels();
    const targets: QueuedPost["channels"] = [];
    if (channels.linkedinWebhook) targets.push("linkedin");
    if (channels.wixApiKey && channels.wixSiteId) targets.push("wix");
    const scheduled = new Date();
    scheduled.setHours(scheduled.getHours() + 24);

    const post: QueuedPost = {
      id: generateId(),
      blogTitle: generated.blogTitle,
      blogBody: generated.blogBody,
      linkedinPost: generated.linkedinPost,
      scheduledAt: scheduled.toISOString(),
      channels: targets.length > 0 ? targets : ["linkedin"],
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    addToQueue(post);
    addLog({
      type: "info",
      message: `Queued "${post.blogTitle}" for ${targets.length || 0} channel(s)`,
    });
    toast("Added to queue", "success");
    router.push("/queue");
  }

  async function handlePostNow() {
    if (!generated) return;
    const channels = getChannels();
    const hasLinkedIn = !!channels.linkedinWebhook;
    const hasWix = !!(channels.wixApiKey && channels.wixSiteId);
    if (!hasLinkedIn && !hasWix) {
      toast("Connect a channel first", "error");
      router.push("/channels");
      return;
    }
    setPublishing(true);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: [hasLinkedIn ? "linkedin" : null, hasWix ? "wix" : null].filter(
            Boolean
          ),
          webhookUrl: channels.linkedinWebhook,
          wixApiKey: channels.wixApiKey,
          wixSiteId: channels.wixSiteId,
          title: generated.blogTitle,
          blogBody: generated.blogBody,
          linkedinPost: generated.linkedinPost,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Publish failed");
      }
      const chanList: string[] = data.channels || [];
      incrementPublished(chanList.length || 1);
      addLog({
        type: "success",
        message: `Published "${generated.blogTitle}" to ${
          chanList.join(", ") || "channels"
        }`,
      });
      toast("Published successfully", "success");
    } catch (err) {
      console.error(err);
      toast("Publish failed — check channel connections", "error");
      addLog({
        type: "error",
        message: `Publish failed for "${generated.blogTitle}"`,
      });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Content Generator"
        subtitle="Give the engine a direction or a precise topic. It'll return publication-ready copy in seconds."
      />

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={cx(
            "px-4 py-2 rounded-input font-syne text-sm transition-colors border",
            mode === "auto"
              ? "bg-accent-green/10 text-accent-green border-accent-green/40"
              : "bg-white/5 text-white/70 border-card-border hover:bg-white/10"
          )}
        >
          Auto-generate
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={cx(
            "px-4 py-2 rounded-input font-syne text-sm transition-colors border",
            mode === "manual"
              ? "bg-accent-green/10 text-accent-green border-accent-green/40"
              : "bg-white/5 text-white/70 border-card-border hover:bg-white/10"
          )}
        >
          Manual topic
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
            {mode === "auto" ? "Auto-generate" : "Manual topic"}
          </div>

          {mode === "auto" ? (
            <div className="flex flex-col gap-4">
              <div>
                <Label>Content focus</Label>
                <Select
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                >
                  {CONTENT_FOCUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Target audience</Label>
                <Select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Tone</Label>
                <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <Label>Topic / title</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How CGI product films outperform live-action for e-commerce"
                />
              </div>
              <div>
                <Label>Key points</Label>
                <Textarea
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  placeholder="One point per line — details, stats, angle, or narrative beats"
                  rows={5}
                />
              </div>
              <div>
                <Label>Call to action</Label>
                <Input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="What should the reader do next?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Audience</Label>
                  <Select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  >
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Tone</Label>
                  <Select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    {TONE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              size="lg"
              onClick={handleGenerate}
              loading={overlayActive && !overlayFinished}
              className="w-full"
            >
              Generate content
            </Button>
          </div>
        </Card>

        <Card className="min-h-[400px]">
          {generated ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("blog")}
                    className={cx(
                      "px-3 py-1.5 rounded-input font-syne text-xs transition-colors border",
                      previewTab === "blog"
                        ? "bg-accent-green/10 text-accent-green border-accent-green/40"
                        : "bg-white/5 text-white/70 border-card-border"
                    )}
                  >
                    Blog
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("linkedin")}
                    className={cx(
                      "px-3 py-1.5 rounded-input font-syne text-xs transition-colors border",
                      previewTab === "linkedin"
                        ? "bg-accent-green/10 text-accent-green border-accent-green/40"
                        : "bg-white/5 text-white/70 border-card-border"
                    )}
                  >
                    LinkedIn
                  </button>
                </div>
                <CopyButton
                  text={
                    previewTab === "blog"
                      ? `${generated.blogTitle}\n\n${generated.blogBody}`
                      : generated.linkedinPost
                  }
                />
              </div>

              <div className="flex-1 overflow-y-auto max-h-[520px] pr-1">
                {previewTab === "blog" ? (
                  <>
                    <Badge variant="teal" className="mb-3">
                      Blog post
                    </Badge>
                    <h2 className="font-syne font-bold text-2xl text-white mb-3 leading-tight">
                      {generated.blogTitle}
                    </h2>
                    <div className="blog-body text-sm">
                      {generated.blogBody}
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="teal" className="mb-3">
                      LinkedIn
                    </Badge>
                    <div className="linkedin-body text-sm">
                      {generated.linkedinPost}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  onClick={handleAddToQueue}
                  className="flex-1"
                >
                  Add to queue
                </Button>
                <Button
                  onClick={handlePostNow}
                  loading={publishing}
                  className="flex-1"
                >
                  Post now
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-teal/20 border border-accent-green/30 flex items-center justify-center mb-4">
                <span className="font-syne text-xl font-bold text-accent-green">
                  ✦
                </span>
              </div>
              <div className="font-syne text-lg font-semibold mb-2">
                Ready when you are
              </div>
              <div className="font-mono text-xs text-muted max-w-sm">
                Pick a focus and tone, or write your own topic. The engine will return a blog post and a LinkedIn post side-by-side.
              </div>
            </div>
          )}
        </Card>
      </div>

      <GenerationOverlay active={overlayActive} finished={overlayFinished} />
    </PageContainer>
  );
}
