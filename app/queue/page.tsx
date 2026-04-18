"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ToastProvider";
import {
  addLog,
  getChannels,
  getQueue,
  incrementPublished,
  removeFromQueue,
  updateQueueItem,
} from "@/lib/storage";
import { formatDateTime, formatRelative } from "@/lib/utils";
import type { QueuedPost } from "@/lib/types";

export default function QueuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [queue, setQueue] = useState<QueuedPost[]>([]);
  const [mounted, setMounted] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  function refresh() {
    setQueue(
      getQueue().sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime()
      )
    );
  }

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  async function publishNow(post: QueuedPost) {
    const channels = getChannels();
    const types: string[] = [];
    if (post.channels.includes("linkedin") && channels.linkedinWebhook) {
      types.push("linkedin");
    }
    if (
      post.channels.includes("wix") &&
      channels.wixApiKey &&
      channels.wixSiteId
    ) {
      types.push("wix");
    }
    if (types.length === 0) {
      toast("No connected channels for this post", "error");
      router.push("/channels");
      return;
    }
    setPublishingId(post.id);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: types,
          webhookUrl: channels.linkedinWebhook,
          wixApiKey: channels.wixApiKey,
          wixSiteId: channels.wixSiteId,
          title: post.blogTitle,
          blogBody: post.blogBody,
          linkedinPost: post.linkedinPost,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Publish failed");
      }
      updateQueueItem(post.id, {
        status: "published",
      });
      const count = (data.channels || []).length || 1;
      incrementPublished(count);
      addLog({
        type: "success",
        message: `Published "${post.blogTitle}" to ${
          (data.channels || []).join(", ") || "channels"
        }`,
      });
      toast("Published", "success");
      refresh();
    } catch (err) {
      console.error(err);
      updateQueueItem(post.id, {
        status: "failed",
        error: (err as Error).message,
      });
      addLog({
        type: "error",
        message: `Publish failed for "${post.blogTitle}"`,
      });
      toast("Publish failed", "error");
      refresh();
    } finally {
      setPublishingId(null);
    }
  }

  function remove(post: QueuedPost) {
    removeFromQueue(post.id);
    addLog({ type: "info", message: `Removed "${post.blogTitle}" from queue` });
    toast("Removed from queue", "info");
    refresh();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Content Queue"
        subtitle="Everything the engine has lined up — scheduled, published, or failed. Take manual control any time."
        action={
          <Button onClick={() => router.push("/generate")}>
            Generate new →
          </Button>
        }
      />

      {mounted && queue.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-accent-green/20 to-accent-teal/20 border border-accent-green/30 flex items-center justify-center mb-4">
            <span className="font-syne text-xl text-accent-green">+</span>
          </div>
          <div className="font-syne text-xl font-semibold mb-2">
            Your queue is empty
          </div>
          <div className="font-mono text-xs text-muted mb-6 max-w-md mx-auto">
            Generate a post to fill the queue. Scheduled items will auto-publish when the engine runs.
          </div>
          <Button onClick={() => router.push("/generate")}>
            Generate first post
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map((post) => (
            <Card key={post.id}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={post.status} />
                    {post.channels.map((c) => (
                      <Badge key={c} variant="teal">
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-syne font-semibold text-lg text-white mb-1 break-words">
                    {post.blogTitle}
                  </h3>
                  <div className="font-mono text-[11px] text-muted">
                    Scheduled {formatDateTime(post.scheduledAt)} ·{" "}
                    {formatRelative(post.scheduledAt)}
                  </div>
                  {post.status === "failed" && post.error ? (
                    <div className="font-mono text-[11px] text-red-300 mt-2 break-all">
                      {post.error}
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  {post.status !== "published" ? (
                    <Button
                      size="sm"
                      onClick={() => publishNow(post)}
                      loading={publishingId === post.id}
                    >
                      Publish now
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => remove(post)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function StatusBadge({ status }: { status: QueuedPost["status"] }) {
  if (status === "published") return <Badge variant="green">Published</Badge>;
  if (status === "failed") return <Badge variant="red">Failed</Badge>;
  if (status === "draft") return <Badge variant="neutral">Draft</Badge>;
  return <Badge variant="yellow">Scheduled</Badge>;
}
