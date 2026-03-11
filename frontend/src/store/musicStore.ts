import { create } from "zustand";
import type { NoteEvent, PlaybackState } from "../types/music";

interface MusicStore {
  musicXml: string | null;
  noteSchedule: NoteEvent[];
  bpm: number;
  totalDurationSec: number;
  playbackState: PlaybackState;
  currentBeat: number;
  errorMessage: string | null;
  isLoading: boolean;

  setScore: (xml: string, notes: NoteEvent[], bpm: number, totalDuration?: number) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentBeat: (beat: number) => void;
  setError: (msg: string | null) => void;
  setLoading: (v: boolean) => void;
  setBpm: (bpm: number) => void;
  reset: () => void;
}

export const useMusicStore = create<MusicStore>((set) => ({
  musicXml: null,
  noteSchedule: [],
  bpm: 120,
  totalDurationSec: 0,
  playbackState: "idle",
  currentBeat: 0,
  errorMessage: null,
  isLoading: false,

  setScore: (xml, notes, bpm, totalDuration = 0) =>
    set({ musicXml: xml, noteSchedule: notes, bpm, totalDurationSec: totalDuration, playbackState: "idle", currentBeat: 0 }),

  setPlaybackState: (state) => set({ playbackState: state }),
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
  setError: (msg) => set({ errorMessage: msg }),
  setLoading: (v) => set({ isLoading: v }),
  setBpm: (bpm) => set({ bpm }),
  reset: () => set({ musicXml: null, noteSchedule: [], playbackState: "idle", currentBeat: 0 }),
}));
