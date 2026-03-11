import { useRef, useCallback, useEffect } from "react";
import * as Tone from "tone";
import type { NoteEvent } from "../../types/music";
import { useMusicStore } from "../../store/musicStore";

// SoundFont CDN URLs — acoustic grand piano
const SOUNDFONT_BASE = "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/";

// Prebuilt note URLs for common MIDI pitches
function midiToNoteName(midi: number): string {
  const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const octave = Math.floor(midi / 12) - 1;
  return `${names[midi % 12]}${octave}`;
}

export interface UsePlaybackReturn {
  play: (notes: NoteEvent[], bpm: number, onStart?: () => void) => Promise<void>;
  pause: () => void;
  stop: () => void;
  setBpmLive: (bpm: number) => void;
  isReady: boolean;
}

export function usePlayback(): UsePlaybackReturn {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const isReadyRef = useRef(false);
  const setPlaybackState = useMusicStore((s) => s.setPlaybackState);

  // Initialize sampler lazily on first play
  const ensureSampler = useCallback(async () => {
    if (samplerRef.current && isReadyRef.current) return;

    await Tone.start(); // unlock AudioContext

    const urls: Record<string, string> = {};
    // Load a range of piano notes
    const noteNames = [
      "A0", "C1", "Eb1", "Gb1", "A1",
      "C2", "Eb2", "Gb2", "A2",
      "C3", "Eb3", "Gb3", "A3",
      "C4", "Eb4", "Gb4", "A4",
      "C5", "Eb5", "Gb5", "A5",
      "C6", "Eb6", "Gb6", "A6",
      "C7", "Eb7", "Gb7", "A7", "C8",
    ];
    noteNames.forEach((name) => {
      urls[name] = `${name}.mp3`;
    });

    await new Promise<void>((resolve, reject) => {
      samplerRef.current = new Tone.Sampler({
        urls,
        baseUrl: SOUNDFONT_BASE,
        onload: () => {
          isReadyRef.current = true;
          resolve();
        },
        onerror: (e) => reject(e),
      }).toDestination();
    });
  }, []);

  const stop = useCallback(() => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    samplerRef.current?.releaseAll();
    setPlaybackState("idle");
  }, [setPlaybackState]);

  const pause = useCallback(() => {
    Tone.getTransport().pause();
    setPlaybackState("paused");
  }, [setPlaybackState]);

  const play = useCallback(
    async (notes: NoteEvent[], bpm: number, onStart?: () => void) => {
      // Stop any existing playback
      Tone.getTransport().stop();
      Tone.getTransport().cancel();

      try {
        await ensureSampler();
      } catch (e) {
        console.error("Sampler load error:", e);
        return;
      }

      const sampler = samplerRef.current!;
      Tone.getTransport().bpm.value = bpm;

      // Schedule all notes
      notes.forEach((note) => {
        const noteName = midiToNoteName(note.pitch_midi);
        Tone.getTransport().schedule((time) => {
          sampler.triggerAttackRelease(
            noteName,
            note.duration_sec,
            time,
            note.velocity / 127
          );
        }, note.start_sec);
      });

      // Schedule end
      const lastNote = notes[notes.length - 1];
      const totalDuration = lastNote ? lastNote.start_sec + lastNote.duration_sec + 0.5 : 1;
      Tone.getTransport().schedule(() => {
        setPlaybackState("idle");
      }, totalDuration);

      Tone.getTransport().start();
      setPlaybackState("playing");
      onStart?.();
    },
    [ensureSampler, setPlaybackState]
  );

  const setBpmLive = useCallback((bpm: number) => {
    Tone.getTransport().bpm.value = bpm;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      samplerRef.current?.dispose();
    };
  }, []);

  return { play, pause, stop, setBpmLive, isReady: isReadyRef.current };
}
