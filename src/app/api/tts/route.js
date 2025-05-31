import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { text } = await req.json();
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova", // or 'shimmer', 'onyx', etc.
    input: text,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  return new Response(buffer, {
    headers: { "Content-Type": "audio/mpeg" }
  });
}
