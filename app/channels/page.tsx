"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Label } from "@/components/Input";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { useToast } from "@/components/ToastProvider";
import { DEFAULT_CHANNELS } from "@/lib/constants";
import { addLog, getChannels, setChannels } from "@/lib/storage";
import type { ChannelConnections } from "@/lib/types";

export default function ChannelsPage() {
  const { toast } = useToast();
  const [channels, setLocalChannels] = useState<ChannelConnections>(
    DEFAULT_CHANNELS
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocalChannels(getChannels());
  }, []);

  function connectLinkedIn() {
    const url = channels.linkedinWebhook.trim();
    if (!url.startsWith("https://hooks.zapier.com")) {
      toast(
        "Enter a valid Zapier webhook URL (must start with https://hooks.zapier.com)",
        "error"
      );
      return;
    }
    setChannels({ ...channels, linkedinWebhook: url });
    addLog({ type: "success", message: "LinkedIn channel connected" });
    toast("LinkedIn connected", "success");
  }

  function disconnectLinkedIn() {
    const next = { ...channels, linkedinWebhook: "" };
    setLocalChannels(next);
    setChannels(next);
    addLog({ type: "info", message: "LinkedIn channel disconnected" });
    toast("LinkedIn disconnected", "info");
  }

  function connectWix() {
    if (!channels.wixApiKey.trim() || !channels.wixSiteId.trim()) {
      toast("Wix API key and Site ID are both required", "error");
      return;
    }
    setChannels({ ...channels });
    addLog({ type: "success", message: "Wix Blog channel connected" });
    toast("Wix Blog connected", "success");
  }

  function disconnectWix() {
    const next = { ...channels, wixApiKey: "", wixSiteId: "" };
    setLocalChannels(next);
    setChannels(next);
    addLog({ type: "info", message: "Wix Blog channel disconnected" });
    toast("Wix Blog disconnected", "info");
  }

  const linkedInConnected =
    mounted && channels.linkedinWebhook.startsWith("https://hooks.zapier.com");
  const wixConnected = mounted && !!channels.wixApiKey && !!channels.wixSiteId;

  return (
    <PageContainer>
      <PageHeader
        title="Channels"
        subtitle="Connect the destinations where the engine will publish. Everything is stored locally in your browser."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LinkedIn card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
                Channel
              </div>
              <h2 className="font-syne text-xl font-semibold">
                LinkedIn (via Zapier)
              </h2>
            </div>
            {linkedInConnected ? (
              <Badge variant="green">Connected</Badge>
            ) : (
              <Badge variant="neutral">Not connected</Badge>
            )}
          </div>

          <div className="mb-4">
            <Label>Zapier webhook URL</Label>
            <Input
              type="url"
              value={channels.linkedinWebhook}
              onChange={(e) =>
                setLocalChannels({
                  ...channels,
                  linkedinWebhook: e.target.value,
                })
              }
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
            <div className="font-mono text-[11px] text-muted mt-2">
              Must start with https://hooks.zapier.com
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={connectLinkedIn}>
              {linkedInConnected ? "Update" : "Connect"}
            </Button>
            {linkedInConnected ? (
              <Button variant="danger" onClick={disconnectLinkedIn}>
                Disconnect
              </Button>
            ) : null}
          </div>

          <div className="border-t border-card-border pt-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
              Zapier setup
            </div>
            <ol className="flex flex-col gap-2 text-sm text-white/80">
              <Step num={1}>
                In Zapier, create a Zap with trigger{" "}
                <span className="font-mono text-accent-teal">Webhooks by Zapier → Catch Hook</span>.
              </Step>
              <Step num={2}>
                Copy the generated webhook URL and paste it above.
              </Step>
              <Step num={3}>
                Add an action step:{" "}
                <span className="font-mono text-accent-teal">LinkedIn → Create Share Update</span>.
              </Step>
              <Step num={4}>
                Map the <span className="font-mono text-accent-teal">message</span> field from the webhook payload to your LinkedIn post content.
              </Step>
              <Step num={5}>
                Turn the Zap on. The engine will send{" "}
                <span className="font-mono text-accent-teal">{`{ title, message }`}</span> each time it publishes.
              </Step>
            </ol>
          </div>
        </Card>

        {/* Wix Blog card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
                Channel
              </div>
              <h2 className="font-syne text-xl font-semibold">Wix Blog</h2>
            </div>
            {wixConnected ? (
              <Badge variant="green">Connected</Badge>
            ) : (
              <Badge variant="neutral">Not connected</Badge>
            )}
          </div>

          <div className="mb-3">
            <Label>Wix API key</Label>
            <Input
              type="password"
              value={channels.wixApiKey}
              onChange={(e) =>
                setLocalChannels({ ...channels, wixApiKey: e.target.value })
              }
              placeholder="Paste your API key"
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <Label>Wix Site ID</Label>
            <Input
              value={channels.wixSiteId}
              onChange={(e) =>
                setLocalChannels({ ...channels, wixSiteId: e.target.value })
              }
              placeholder="Site ID from your Wix dashboard"
            />
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={connectWix}>
              {wixConnected ? "Update" : "Connect"}
            </Button>
            {wixConnected ? (
              <Button variant="danger" onClick={disconnectWix}>
                Disconnect
              </Button>
            ) : null}
          </div>

          <div className="border-t border-card-border pt-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
              How to find these
            </div>
            <ol className="flex flex-col gap-2 text-sm text-white/80">
              <Step num={1}>
                Go to your{" "}
                <span className="font-mono text-accent-teal">Wix Dashboard → Settings → API Keys</span>.
              </Step>
              <Step num={2}>
                Create an API key with{" "}
                <span className="font-mono text-accent-teal">Blog (Write)</span> permissions.
              </Step>
              <Step num={3}>
                Copy the API key and paste it above.
              </Step>
              <Step num={4}>
                Find the Site ID under{" "}
                <span className="font-mono text-accent-teal">Settings → Business Info → Site ID</span>.
              </Step>
              <Step num={5}>
                Hit Connect. Your blog posts will push to Wix automatically.
              </Step>
            </ol>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="shrink-0 w-5 h-5 rounded-full bg-accent-green/10 border border-accent-green/30 text-accent-green font-mono text-[11px] flex items-center justify-center mt-0.5">
        {num}
      </span>
      <span className="flex-1">{children}</span>
    </li>
  );
}
