export interface NoteEvent {
  pitch_midi: number;
  pitch_name: string;
  start_sec: number;
  duration_sec: number;
  start_beat: number;
  duration_beats: number;
  velocity: number;
  measure: number;
  beat_in_measure: number;
}

export interface TranscribeResponse {
  musicxml: string;
  bpm: number;
  time_signature: string;
  notes: NoteEvent[];
}

export interface SynthesizeResponse {
  bpm: number;
  time_signature: string;
  total_duration_sec: number;
  notes: NoteEvent[];
}

export type PlaybackState = "idle" | "playing" | "paused";
export type AppMode = "audio-to-score" | "score-to-audio";
