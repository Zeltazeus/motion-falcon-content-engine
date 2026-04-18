"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Label, Textarea } from "@/components/Input";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ToastProvider";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { addLog, getSettings, setSettings } from "@/lib/storage";
import type { BrandSettings } from "@/lib/types";

export default function SettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<BrandSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setForm(getSettings());
  }, []);

  function save() {
    setSettings(form);
    addLog({ type: "info", message: "Brand settings updated" });
    toast("Settings saved", "success");
  }

  function reset() {
    setForm(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
    addLog({ type: "info", message: "Settings reset to defaults" });
    toast("Reset to defaults", "info");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Brand Settings"
        subtitle="Context the engine uses for every post. Tweak these to refine tone, audience and signature."
      />

      <Card className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
          Company
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Company name</Label>
            <Input
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Website</Label>
            <Input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
          Positioning
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Services (comma-separated)</Label>
            <Textarea
              value={form.services}
              onChange={(e) => setForm({ ...form, services: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label>Target industries (comma-separated)</Label>
            <Textarea
              value={form.industries}
              onChange={(e) =>
                setForm({ ...form, industries: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
          Signature
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Signature / CTA used on all posts</Label>
            <Textarea
              value={form.signature}
              onChange={(e) =>
                setForm({ ...form, signature: e.target.value })
              }
              rows={2}
              placeholder="e.g. Let's bring your vision to life with cinematic 3D CGI — motionfalcon.com"
            />
          </div>
          <div>
            <Label>LinkedIn hashtags</Label>
            <Input
              value={form.hashtags}
              onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
              placeholder="#3DAnimation #CGI #ProductVisualization"
            />
          </div>
        </div>
      </Card>

      {mounted ? (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="ghost" onClick={reset}>
            Reset to defaults
          </Button>
          <Button size="lg" onClick={save}>
            Save settings
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}
