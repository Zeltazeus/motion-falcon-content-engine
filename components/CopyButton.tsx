"use client";

import { useState } from "react";
import { Button } from "./Button";
import { useToast } from "./ToastProvider";

export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("Unable to copy", "error");
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy} type="button">
      {copied ? "Copied" : label}
    </Button>
  );
}
