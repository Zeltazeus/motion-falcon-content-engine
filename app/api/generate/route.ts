import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { BrandSettings, GeneratedContent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GenerateBody {
  topic?: string;
  tone?: string;
  audience?: string;
  focus?: string;
  keyPoints?: string;
  cta?: string;
  settings?: Partial<BrandSettings>;
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-5";

function fallback(topic: string, settings: Partial<BrandSettings>): GeneratedContent {
  const company = settings.companyName || "Motion Falcon";
  const cta = settings.signature || `Visit ${settings.website || "motionfalcon.com"}`;
  return {
    blogTitle: `${topic}: A 3D CGI Perspective From ${company}`,
    blogBody:
      `In a market saturated by stock visuals and rushed live-action, 3D CGI is quietly rewriting the rules of how brands tell stories.\n\n` +
      `At ${company}, we work with marketing directors and creative agencies who want more than a product shot — they want a moment that feels engineered for their audience.\n\n` +
      `When it comes to ${topic}, the advantage of CGI is control. Every lens, every light, every reflection becomes a decision. That control compounds. It produces work that scales across verticals, campaigns, and formats without reshoots, weather delays or location costs.\n\n` +
      `Product visualization, AR/VR activations and cinematic visual storytelling are no longer reserved for Fortune 500 budgets. Real estate developers, consumer brands and product-first companies are quietly using CGI to close the gap between concept and sale.\n\n` +
      `The next generation of advertising will not be filmed — it will be rendered. The studios that master that shift today will own the attention economy tomorrow.\n\n` +
      `${cta}`,
    linkedinPost:
      `The next generation of advertising won't be filmed.\n\n` +
      `It'll be rendered. 🎬✨\n\n` +
      `Here's what most marketing teams miss about ${topic}:\n\n` +
      `→ CGI gives you total control — lighting, lens, mood, motion\n` +
      `→ It scales across verticals without reshoots\n` +
      `→ It makes the impossible product shot trivial\n\n` +
      `Real estate developers, consumer brands, and product-first companies are quietly eating the market with this approach.\n\n` +
      `${cta}\n\n` +
      `${settings.hashtags || "#3DAnimation #CGI #ProductVisualization"}`,
  };
}

function extractJson(text: string): GeneratedContent | null {
  // Find first { and last } and try to parse
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    const parsed = JSON.parse(candidate);
    if (
      typeof parsed.blogTitle === "string" &&
      typeof parsed.blogBody === "string" &&
      typeof parsed.linkedinPost === "string"
    ) {
      return parsed as GeneratedContent;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function POST(req: Request) {
  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topic = (body.topic || body.focus || "3D CGI animation for modern brands").trim();
  const tone = body.tone || "Expert authority";
  const audience = body.audience || "Marketing Directors/CMOs";
  const settings: Partial<BrandSettings> = body.settings || {};
  const company = settings.companyName || "Motion Falcon";
  const website = settings.website || "motionfalcon.com";
  const services =
    settings.services ||
    "3D CGI Animation, AR/VR/MR, Visual Storytelling, Product Visualization";
  const industries =
    settings.industries ||
    "Marketing Directors, Creative Agencies, Consumer Brands, Real Estate Developers";
  const signature = body.cta || settings.signature || `Visit ${website}`;
  const hashtags =
    settings.hashtags ||
    "#3DAnimation #CGI #ProductVisualization #VisualStorytelling";

  const keyPointsLine = body.keyPoints?.trim()
    ? `\nKey points to cover:\n${body.keyPoints}`
    : "";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful fallback so the UI works even without a key (useful for preview).
    return NextResponse.json(fallback(topic, settings));
  }

  const systemPrompt = `You are a content strategist for ${company}, a premium 3D CGI animation studio (${website}). Services: ${services}. Primary audiences: ${industries}. Write content that attracts decision-makers and drives inbound leads. Always sound confident, specific, and grounded in craft — never generic.`;

  const userPrompt = `Generate a blog post and LinkedIn post about "${topic}".
Tone: ${tone}.
Audience: ${audience}.${keyPointsLine}

Close with this CTA verbatim when natural: "${signature}".
LinkedIn hashtags to end with: ${hashtags}

Return ONLY valid JSON with this exact shape:
{"blogTitle":"...","blogBody":"...","linkedinPost":"..."}

Requirements:
- Blog: 350-400 words. Thoughtful, punchy, confident. Use short paragraphs. No markdown headings, no list bullets — flowing prose.
- LinkedIn: 150-200 words. Punchy opener, clear line breaks, 1-3 emojis used intentionally, end with CTA and the hashtags above.
- Do NOT wrap the JSON in code fences. Return pure JSON only.`;

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });
    const text = msg.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim();
    const parsed = extractJson(text);
    if (parsed) {
      return NextResponse.json(parsed);
    }
    console.error("Claude returned non-JSON response");
    return NextResponse.json(fallback(topic, settings));
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json(fallback(topic, settings));
  }
}
