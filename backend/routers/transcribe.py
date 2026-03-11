import os
import uuid
import tempfile

from fastapi import APIRouter, UploadFile, File, HTTPException

from models.schemas import TranscribeResponse
from services.pitch_detection import normalize_audio, detect_pitches
from services.midi_converter import save_midi, get_bpm_from_midi
from services.musicxml_converter import midi_to_musicxml
from services.score_parser import extract_note_schedule, parse_musicxml_to_schedule

router = APIRouter()

TMP_DIR = os.path.join(os.path.dirname(__file__), "..", "tmp")
os.makedirs(TMP_DIR, exist_ok=True)


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    session_id = uuid.uuid4().hex
    raw_path = os.path.join(TMP_DIR, f"{session_id}_raw")
    wav_path = os.path.join(TMP_DIR, f"{session_id}.wav")
    midi_path = os.path.join(TMP_DIR, f"{session_id}.mid")

    try:
        # Save uploaded file
        content = await audio.read()
        if len(content) > 50 * 1024 * 1024:  # 50 MB limit
            raise HTTPException(status_code=413, detail="File too large (max 50 MB)")

        ext = os.path.splitext(audio.filename or "")[-1] or ".bin"
        raw_path = raw_path + ext
        with open(raw_path, "wb") as f:
            f.write(content)

        # Normalize to mono 22050 Hz WAV
        try:
            normalize_audio(raw_path, wav_path)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Could not decode audio: {e}")

        # Run basic-pitch inference
        try:
            _, midi_data, note_events = detect_pitches(wav_path)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Pitch detection failed: {e}")

        if not note_events:
            raise HTTPException(status_code=422, detail="Could not detect pitched content in audio")

        # Save MIDI
        save_midi(midi_data, midi_path)
        bpm = get_bpm_from_midi(midi_data)

        # Convert MIDI → MusicXML
        try:
            musicxml = midi_to_musicxml(midi_path, bpm)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"MusicXML conversion failed: {e}")

        # Extract note schedule from MusicXML
        notes, bpm_parsed, time_sig = parse_musicxml_to_schedule(musicxml, bpm)

        return TranscribeResponse(
            musicxml=musicxml,
            bpm=bpm_parsed,
            time_signature=time_sig,
            notes=notes,
        )

    finally:
        for path in [raw_path, wav_path, midi_path]:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass
