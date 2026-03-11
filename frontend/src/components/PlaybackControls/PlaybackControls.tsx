import { useCallback } from "react";
import { getTransport } from "tone";
import { useMusicStore } from "../../store/musicStore";
import { usePlayback } from "./usePlayback";
import { useSyncEngine } from "../../hooks/useSyncEngine";
import type { Cursor } from "opensheetmusicdisplay";

interface PlaybackControlsProps {
  getCursor: () => Cursor | null;
  onBeforePlay?: () => Promise<void>;
}

export default function PlaybackControls({ getCursor, onBeforePlay }: PlaybackControlsProps) {
  // Use individual selectors — object selector creates new ref every render → infinite loop
  const noteSchedule = useMusicStore((s) => s.noteSchedule);
  const bpm = useMusicStore((s) => s.bpm);
  const playbackState = useMusicStore((s) => s.playbackState);
  const setBpm = useMusicStore((s) => s.setBpm);

  const { play, pause, stop } = usePlayback();
  const { startSync, pauseSync, stopSync, resumeSync } = useSyncEngine(getCursor, noteSchedule);

  const handlePlay = useCallback(async () => {
    if (playbackState === "paused") {
      getTransport().start();
      useMusicStore.getState().setPlaybackState("playing");
      resumeSync();
      return;
    }

    if (onBeforePlay) {
      await onBeforePlay();
    }

    const currentNotes = useMusicStore.getState().noteSchedule;
    const currentBpm = useMusicStore.getState().bpm;

    await play(currentNotes, currentBpm, () => {
      startSync();
    });
  }, [play, startSync, onBeforePlay, playbackState, resumeSync]);

  const handlePause = useCallback(() => {
    pause();
    pauseSync();
  }, [pause, pauseSync]);

  const handleStop = useCallback(() => {
    stop();
    stopSync();
  }, [stop, stopSync]);

  const handleBpmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newBpm = Number(e.target.value);
      setBpm(newBpm);
      getTransport().bpm.value = newBpm;
    },
    [setBpm]
  );

  // onBeforePlay means score-to-audio mode: fetch notes on click, so always enabled
  const canPlay = noteSchedule.length > 0 || !!onBeforePlay;

  return (
    <div className="playback-controls">
      <div className="playback-buttons">
        {playbackState !== "playing" ? (
          <button
            className="btn btn-play"
            onClick={handlePlay}
            disabled={!canPlay}
            title="播放"
          >
            ▶ 播放
          </button>
        ) : (
          <button className="btn btn-pause" onClick={handlePause} title="暂停">
            ⏸ 暂停
          </button>
        )}
        <button
          className="btn btn-stop"
          onClick={handleStop}
          disabled={playbackState === "idle"}
          title="停止"
        >
          ⏹ 停止
        </button>
      </div>

      <div className="tempo-control">
        <label>
          速度 <strong>{bpm}</strong> BPM
        </label>
        <input
          type="range"
          min={40}
          max={240}
          value={bpm}
          onChange={handleBpmChange}
          className="tempo-slider"
        />
      </div>
    </div>
  );
}
