import { useRef, useState, useCallback } from "react";
import { OpenSheetMusicDisplay, Cursor } from "opensheetmusicdisplay";

export interface UseOSMDReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  osmdRef: React.RefObject<OpenSheetMusicDisplay | null>;
  cursor: Cursor | null;
  isReady: boolean;
  loadError: string | null;
  loadScore: (xml: string) => Promise<void>;
  resetCursor: () => void;
}

export function useOSMD(): UseOSMDReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadScore = useCallback(async (xml: string) => {
    if (!containerRef.current) return;

    setIsReady(false);
    setCursor(null);
    setLoadError(null);

    // Re-create OSMD if the container changed or this is first load
    if (!osmdRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        backend: "svg",
        drawingParameters: "compact",
        followCursor: true,
        disableCursor: false,
      });
    }

    try {
      // Strip DOCTYPE — OSMD doesn't need it and it can trigger external fetch errors
      const cleanXml = xml.replace(/<!DOCTYPE[^>]*>/i, "").trim();
      await osmdRef.current.load(cleanXml);
      await osmdRef.current.render();

      const c = osmdRef.current.cursor;
      c.show();
      setCursor(c);
      setIsReady(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("OSMD load error:", err);
      setLoadError(msg);
      // Do NOT rethrow — caller (useEffect) would turn it into unhandled rejection
    }
  }, []);

  const resetCursor = useCallback(() => {
    if (!osmdRef.current) return;
    const c = osmdRef.current.cursor;
    c.reset();
    c.show();
  }, []);

  return { containerRef, osmdRef, cursor, isReady, loadError, loadScore, resetCursor };
}
