import { OpenAI } from "openai";
import { writeFile } from "fs/promises";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `/tmp/${file.name}`;
  await writeFile(filePath, buffer);

  const transcript = await openai.audio.transcriptions.create({
    file: await openai.files.create({ file: buffer, purpose: "transcription" }),
    model: "whisper-1",
  });

  return Response.json({ text: transcript.text });
}
