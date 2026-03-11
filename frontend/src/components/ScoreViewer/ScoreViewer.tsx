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
    const { containerRef, loadScore, isReady } = osmdHandle;

    useImperativeHandle(ref, () => osmdHandle);

    useEffect(() => {
      if (!musicXml) return;
      loadScore(musicXml).catch(console.error);
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
        <div
          ref={containerRef}
          className="score-container"
          style={{ display: musicXml ? "block" : "none" }}
        />
      </div>
    );
  }
);

ScoreViewer.displayName = "ScoreViewer";
export default ScoreViewer;
