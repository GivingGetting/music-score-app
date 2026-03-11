import { useState, useRef, useCallback } from "react";

export interface UseRecorderReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

export function useRecorder(): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setIsRecording(false);
      };

      recorder.start(100); // collect data every 100ms
      setIsRecording(true);
    } catch (e: any) {
      setError(e.message || "无法访问麦克风");
    }
  }, []);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setError(null);
    setIsRecording(false);
  }, []);

  return { isRecording, audioBlob, start, stop, reset, error };
}
