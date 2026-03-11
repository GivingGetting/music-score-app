import { useRef, useState, useCallback } from "react";
import ScoreViewer from "./components/ScoreViewer/ScoreViewer";
import type { ScoreViewerHandle } from "./components/ScoreViewer/ScoreViewer";
import PlaybackControls from "./components/PlaybackControls/PlaybackControls";
import FileUpload from "./components/FileUpload/FileUpload";
import AudioRecorder from "./components/AudioRecorder/AudioRecorder";
import ScoreEditor from "./components/ScoreEditor/ScoreEditor";
import { useMusicStore } from "./store/musicStore";
import { transcribeAudio, synthesizeScore } from "./api/client";
import type { AppMode } from "./types/music";
import type { Cursor } from "opensheetmusicdisplay";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState<AppMode>("audio-to-score");
  const scoreViewerRef = useRef<ScoreViewerHandle>(null);
  const { musicXml, isLoading, errorMessage, setScore, setError, setLoading, setBpm } =
    useMusicStore((s) => s);

  const getCursor = useCallback((): Cursor | null => {
    return scoreViewerRef.current?.cursor ?? null;
  }, []);

  const handleAudio = useCallback(
    async (blob: Blob, filename: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await transcribeAudio(blob, filename);
        setScore(res.musicxml, res.notes, res.bpm, 0);
        setBpm(res.bpm);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [setScore, setError, setLoading, setBpm]
  );

  const handleXmlChange = useCallback((xml: string) => {
    useMusicStore.getState().setScore(xml, [], useMusicStore.getState().bpm);
  }, []);

  const fetchNoteSchedule = useCallback(async () => {
    const xml = useMusicStore.getState().musicXml;
    if (!xml) return;
    if (useMusicStore.getState().noteSchedule.length > 0) return;

    try {
      const res = await synthesizeScore(xml, useMusicStore.getState().bpm);
      useMusicStore.getState().setScore(xml, res.notes, res.bpm, res.total_duration_sec);
    } catch (e: any) {
      setError(e.message);
    }
  }, [setError]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎼 乐谱 · 乐曲 转换器</h1>
        <p className="subtitle">音频转乐谱 · 乐谱转音频 · 同步跳动</p>
      </header>

      <div className="mode-tabs">
        <button
          className={`tab ${mode === "audio-to-score" ? "active" : ""}`}
          onClick={() => setMode("audio-to-score")}
        >
          🎙 音频 → 乐谱
        </button>
        <button
          className={`tab ${mode === "score-to-audio" ? "active" : ""}`}
          onClick={() => setMode("score-to-audio")}
        >
          🎹 乐谱 → 音频
        </button>
      </div>

      <main className="app-main">
        <section className="input-panel">
          {mode === "audio-to-score" ? (
            <div className="input-section">
              <h2>上传或录制音频</h2>
              <FileUpload onFileSelected={handleAudio} />
              <div className="divider">— 或 —</div>
              <AudioRecorder onAudioReady={handleAudio} />
            </div>
          ) : (
            <div className="input-section">
              <h2>编辑乐谱</h2>
              <ScoreEditor value={musicXml || ""} onChange={handleXmlChange} />
            </div>
          )}

          {isLoading && (
            <div className="status-banner loading">
              <span className="spinner" /> 正在转录音频，请稍候...
            </div>
          )}
          {errorMessage && (
            <div className="status-banner error">⚠ {errorMessage}</div>
          )}
        </section>

        <section className="score-panel">
          <ScoreViewer ref={scoreViewerRef} musicXml={musicXml} />

          {musicXml && (
            <PlaybackControls
              getCursor={getCursor}
              onBeforePlay={mode === "score-to-audio" ? fetchNoteSchedule : undefined}
            />
          )}
        </section>
      </main>
    </div>
  );
}
