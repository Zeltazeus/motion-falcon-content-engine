import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PublishBody {
  type?: string[] | string;
  webhookUrl?: string;
  wixApiKey?: string;
  wixSiteId?: string;
  title?: string;
  blogBody?: string;
  linkedinPost?: string;
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string") return [v];
  return [];
}

async function publishLinkedIn(
  webhookUrl: string,
  title: string,
  message: string
) {
  if (!webhookUrl || !webhookUrl.startsWith("https://hooks.zapier.com")) {
    throw new Error("Invalid Zapier webhook URL");
  }
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, message }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Zapier responded ${res.status}: ${text.slice(0, 200)}`);
  }
  return true;
}

async function publishWix(
  apiKey: string,
  siteId: string,
  title: string,
  body: string
) {
  if (!apiKey || !siteId) {
    throw new Error("Wix API key or Site ID missing");
  }
  const res = await fetch("https://www.wixapis.com/blog/v3/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "wix-site-id": siteId,
    },
    body: JSON.stringify({
      draftPost: {
        title,
        richContent: {
          nodes: [
            {
              type: "PARAGRAPH",
              nodes: [
                {
                  type: "TEXT",
                  textData: { text: body },
                },
              ],
            },
          ],
        },
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Wix API responded ${res.status}: ${text.slice(0, 200)}`);
  }
  return true;
}

export async function POST(req: Request) {
  let body: PublishBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const types = asArray(body.type);
  if (types.length === 0) {
    return NextResponse.json(
      { error: "No channels specified" },
      { status: 400 }
    );
  }

  const title = body.title?.trim() || "New post from Motion Falcon";
  const blogBody = body.blogBody || "";
  const linkedinPost = body.linkedinPost || "";

  const published: string[] = [];
  const errors: Record<string, string> = {};

  if (types.includes("linkedin")) {
    try {
      await publishLinkedIn(body.webhookUrl || "", title, linkedinPost);
      published.push("linkedin");
    } catch (err) {
      errors.linkedin = (err as Error).message;
    }
  }

  if (types.includes("wix")) {
    try {
      await publishWix(
        body.wixApiKey || "",
        body.wixSiteId || "",
        title,
        blogBody
      );
      published.push("wix");
    } catch (err) {
      errors.wix = (err as Error).message;
    }
  }

  if (published.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: Object.values(errors).join(" | ") || "Publish failed",
        errors,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    channels: published,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  });
}
