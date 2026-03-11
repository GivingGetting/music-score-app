import type { TranscribeResponse, SynthesizeResponse } from "../types/music";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function transcribeAudio(blob: Blob, filename = "audio.webm"): Promise<TranscribeResponse> {
  const form = new FormData();
  form.append("audio", blob, filename);

  const res = await fetch(`${BASE_URL}/transcribe`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Transcription failed");
  }

  return res.json();
}

export async function synthesizeScore(
  musicxml: string,
  bpm_override?: number
): Promise<SynthesizeResponse> {
  const res = await fetch(`${BASE_URL}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ musicxml, bpm_override: bpm_override ?? null }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Synthesis failed");
  }

  return res.json();
}
