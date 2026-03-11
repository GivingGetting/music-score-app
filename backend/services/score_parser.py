from __future__ import annotations
from typing import Optional
from models.schemas import NoteEvent


def extract_note_schedule(score, bpm: float) -> list[NoteEvent]:
    """
    Parse a music21 Score object and return a list of NoteEvents
    with both beat-based and time-based positions.
    """
    import music21

    seconds_per_beat = 60.0 / bpm
    notes: list[NoteEvent] = []

    for element in score.flat.notes:
        if isinstance(element, music21.note.Note):
            _append_note(notes, element, seconds_per_beat)
        elif isinstance(element, music21.chord.Chord):
            for pitch in element.pitches:
                # Create a virtual note for each chord pitch
                n = music21.note.Note(pitch)
                n.offset = element.offset
                n.quarterLength = element.quarterLength
                n.volume = element.volume
                n.measureNumber = element.measureNumber
                try:
                    n.beat = element.beat
                except Exception:
                    n.beat = 1.0
                _append_note(notes, n, seconds_per_beat)

    notes.sort(key=lambda n: n.start_beat)
    return notes


def _append_note(notes: list, n, seconds_per_beat: float) -> None:
    import music21

    velocity = 80
    if n.volume and n.volume.velocity is not None:
        velocity = int(n.volume.velocity)

    try:
        beat_in_measure = float(n.beat)
    except Exception:
        beat_in_measure = 1.0

    try:
        measure_num = int(n.measureNumber) if n.measureNumber else 1
    except Exception:
        measure_num = 1

    start_beat = float(n.offset)
    duration_beats = float(n.quarterLength)

    notes.append(
        NoteEvent(
            pitch_midi=n.pitch.midi,
            pitch_name=n.pitch.nameWithOctave,
            start_beat=start_beat,
            duration_beats=duration_beats,
            start_sec=round(start_beat * seconds_per_beat, 4),
            duration_sec=round(duration_beats * seconds_per_beat, 4),
            velocity=velocity,
            measure=measure_num,
            beat_in_measure=beat_in_measure,
        )
    )


def parse_musicxml_to_schedule(xml_string: str, bpm_override: Optional[float] = None) -> tuple:
    """
    Parse MusicXML string, extract note schedule.
    Returns (notes, bpm, time_signature).
    """
    import music21
    import tempfile
    import os

    with tempfile.NamedTemporaryFile(suffix=".xml", delete=False, mode="w", encoding="utf-8") as f:
        f.write(xml_string)
        tmp_path = f.name

    try:
        score = music21.converter.parse(tmp_path)
    finally:
        os.remove(tmp_path)

    # Detect BPM
    bpm = bpm_override
    if bpm is None:
        tempos = list(score.recurse().getElementsByClass(music21.tempo.MetronomeMark))
        if tempos:
            bpm = float(tempos[0].number)
        else:
            bpm = 120.0

    # Detect time signature
    time_sigs = list(score.recurse().getElementsByClass(music21.meter.TimeSignature))
    time_sig_str = time_sigs[0].ratioString if time_sigs else "4/4"

    notes = extract_note_schedule(score, bpm)
    return notes, bpm, time_sig_str
