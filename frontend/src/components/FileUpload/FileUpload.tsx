import { useRef, useCallback, useState } from "react";

interface FileUploadProps {
  onFileSelected: (blob: Blob, filename: string) => void;
}

export default function FileUpload({ onFileSelected }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFilename(file.name);
      onFileSelected(file, file.name);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`file-upload ${isDragging ? "dragging" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="upload-icon">🎵</div>
      {filename ? (
        <p className="upload-text">{filename}</p>
      ) : (
        <>
          <p className="upload-text">拖放音频文件至此，或点击选择</p>
          <p className="upload-hint">支持 MP3、WAV、M4A、FLAC 等格式</p>
        </>
      )}
    </div>
  );
}
