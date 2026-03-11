import { useRef, useCallback } from "react";
import * as Tone from "tone";
import type { Cursor } from "opensheetmusicdisplay";
import type { NoteEvent } from "../types/music";
import { useMusicStore } from "../store/musicStore";

export function useSyncEngine(
  getCursor: () => Cursor | null,
  noteSchedule: NoteEvent[]
) {
  const rafIdRef = useRef<number>(0);
  const noteIndexRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);
  const setCurrentBeat = useMusicStore((s) => s.setCurrentBeat);

  const startSync = useCallback(() => {
    isActiveRef.current = true;
    noteIndexRef.current = 0;

    const cursor = getCursor();
    if (cursor) {
      cursor.reset();
      cursor.show();
    }

    const tick = () => {
      if (!isActiveRef.current) return;

      const currentBeat = Tone.getTransport().ticks / Tone.getTransport().PPQ;
      setCurrentBeat(currentBeat);

      const cursor = getCursor();
      if (cursor && noteIndexRef.current < noteSchedule.length) {
        const nextNote = noteSchedule[noteIndexRef.current];
        // Advance slightly early (50ms) to account for render lag
        if (nextNote && currentBeat >= nextNote.start_beat - 0.05) {
          cursor.next();
          noteIndexRef.current++;
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [getCursor, noteSchedule, setCurrentBeat]);

  const pauseSync = useCallback(() => {
    isActiveRef.current = false;
    cancelAnimationFrame(rafIdRef.current);
    // Keep cursor at current position
  }, []);

  const stopSync = useCallback(() => {
    isActiveRef.current = false;
    cancelAnimationFrame(rafIdRef.current);
    noteIndexRef.current = 0;
    setCurrentBeat(0);

    const cursor = getCursor();
    if (cursor) {
      cursor.reset();
      cursor.show();
    }
  }, [getCursor, setCurrentBeat]);

  const resumeSync = useCallback(() => {
    isActiveRef.current = true;
    const tick = () => {
      if (!isActiveRef.current) return;

      const currentBeat = Tone.getTransport().ticks / Tone.getTransport().PPQ;
      setCurrentBeat(currentBeat);

      const cursor = getCursor();
      if (cursor && noteIndexRef.current < noteSchedule.length) {
        const nextNote = noteSchedule[noteIndexRef.current];
        if (nextNote && currentBeat >= nextNote.start_beat - 0.05) {
          cursor.next();
          noteIndexRef.current++;
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [getCursor, noteSchedule, setCurrentBeat]);

  return { startSync, pauseSync, stopSync, resumeSync };
}
