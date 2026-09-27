import { NextResponse } from "next/server";

/**
 * Secure AI gateway stub.
 * Client code should call this route (or NEXT_PUBLIC_AI_API_URL) — never an OpenAI key in the browser.
 */
export async function POST(req: Request) {
  const secret = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.AI_API_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        code: "not_configured",
        message:
          "No server AI key is configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env.local and implement the provider call in this route.",
      },
      { status: 501 },
    );
  }

  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: false,
    code: "not_implemented",
    message: "Provider keys are present, but the model adapter is not wired yet.",
    echo: { keys: Object.keys(body) },
  }, { status: 501 });
}
