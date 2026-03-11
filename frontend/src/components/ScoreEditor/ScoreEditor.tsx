import { useState, useEffect, useCallback, useRef } from "react";

interface ScoreEditorProps {
  value: string;
  onChange: (xml: string) => void;
}

export default function ScoreEditor({ value, onChange }: ScoreEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      setLocalValue(newVal);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(newVal);
      }, 600);
    },
    [onChange]
  );

  return (
    <div className="score-editor">
      <label className="editor-label">MusicXML 编辑</label>
      <textarea
        className="xml-textarea"
        value={localValue}
        onChange={handleChange}
        spellCheck={false}
        placeholder="粘贴 MusicXML 内容，或先通过音频生成乐谱..."
      />
    </div>
  );
}
