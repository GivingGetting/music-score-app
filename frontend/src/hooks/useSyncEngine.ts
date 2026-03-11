import { useRef, useCallback, useEffect } from "react";
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
  // Keep a ref so tick closures always see the latest noteSchedule
  const noteScheduleRef = useRef<NoteEvent[]>(noteSchedule);
  const setCurrentBeat = useMusicStore((s) => s.setCurrentBeat);

  useEffect(() => {
    noteScheduleRef.current = noteSchedule;
  }, [noteSchedule]);

  const tick = useCallback(() => {
    if (!isActiveRef.current) return;

    const currentBeat = Tone.getTransport().ticks / Tone.getTransport().PPQ;
    setCurrentBeat(currentBeat);

    const cursor = getCursor();
    const schedule = noteScheduleRef.current;
    if (cursor && noteIndexRef.current < schedule.length) {
      const nextNote = schedule[noteIndexRef.current];
      if (nextNote && currentBeat >= nextNote.start_beat - 0.05) {
        cursor.next();
        noteIndexRef.current++;
      }
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [getCursor, setCurrentBeat]);

  const startSync = useCallback(() => {
    isActiveRef.current = true;
    noteIndexRef.current = 0;

    const cursor = getCursor();
    if (cursor) {
      cursor.reset();
      cursor.show();
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [getCursor, tick]);

  const pauseSync = useCallback(() => {
    isActiveRef.current = false;
    cancelAnimationFrame(rafIdRef.current);
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
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  return { startSync, pauseSync, stopSync, resumeSync };
}
