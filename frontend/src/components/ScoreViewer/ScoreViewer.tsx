import { useEffect, forwardRef, useImperativeHandle } from "react";
import { useOSMD } from "./useOSMD";
import type { UseOSMDReturn } from "./useOSMD";

interface ScoreViewerProps {
  musicXml: string | null;
  onReady?: (osmdHandle: UseOSMDReturn) => void;
}

export interface ScoreViewerHandle extends UseOSMDReturn {}

const ScoreViewer = forwardRef<ScoreViewerHandle, ScoreViewerProps>(
  ({ musicXml, onReady }, ref) => {
    const osmdHandle = useOSMD();
    const { containerRef, loadScore, isReady, loadError } = osmdHandle;

    useImperativeHandle(ref, () => osmdHandle);

    useEffect(() => {
      if (!musicXml) return;
      loadScore(musicXml);
    }, [musicXml, loadScore]);

    useEffect(() => {
      if (isReady && onReady) {
        onReady(osmdHandle);
      }
    }, [isReady]);

    return (
      <div className="score-viewer-wrapper">
        {!musicXml && (
          <div className="score-placeholder">
            <p>乐谱将在此显示</p>
          </div>
        )}
        {loadError && (
          <div className="score-placeholder" style={{ color: "#e05c5c", flexDirection: "column", gap: 8 }}>
            <p>⚠ 乐谱渲染失败</p>
            <p style={{ fontSize: "0.8rem" }}>{loadError}</p>
          </div>
        )}
        <div
          ref={containerRef}
          className="score-container"
          style={{ display: musicXml && !loadError ? "block" : "none" }}
        />
      </div>
    );
  }
);

ScoreViewer.displayName = "ScoreViewer";
export default ScoreViewer;
