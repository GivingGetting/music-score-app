import { useEffect } from "react";
import { useRecorder } from "./useRecorder";

interface AudioRecorderProps {
  onAudioReady: (blob: Blob, filename: string) => void;
}

export default function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
  const { isRecording, audioBlob, start, stop, reset, error } = useRecorder();

  useEffect(() => {
    if (audioBlob) {
      onAudioReady(audioBlob, "recording.webm");
    }
  }, [audioBlob]);

  return (
    <div className="audio-recorder">
      <div className="recorder-row">
        {!isRecording ? (
          <button className="btn btn-record" onClick={start}>
            <span className="record-dot" /> 开始录音
          </button>
        ) : (
          <button className="btn btn-stop-record" onClick={stop}>
            <span className="stop-square" /> 停止录音
          </button>
        )}
        {audioBlob && !isRecording && (
          <>
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              className="audio-preview"
            />
            <button className="btn btn-ghost" onClick={reset}>
              重录
            </button>
          </>
        )}
      </div>
      {isRecording && (
        <div className="recording-indicator">
          <span className="pulse" /> 录音中...
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
