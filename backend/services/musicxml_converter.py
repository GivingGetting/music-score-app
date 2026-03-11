import tempfile
import os


def midi_to_musicxml(midi_path: str, bpm: float = 120.0) -> str:
    """
    Convert a MIDI file to MusicXML string using music21.
    Returns the MusicXML as a string.
    """
    import music21

    score = music21.converter.parse(midi_path)

    # Set a reasonable tempo if not embedded
    existing_tempos = list(score.recurse().getElementsByClass(music21.tempo.MetronomeMark))
    if not existing_tempos:
        mm = music21.tempo.MetronomeMark(number=bpm)
        score.parts[0].insert(0, mm)

    # Quantize and add notation details
    score.makeNotation(inPlace=True)

    # Write to a temp file and read back as string
    with tempfile.NamedTemporaryFile(suffix=".xml", delete=False) as f:
        tmp_path = f.name

    try:
        score.write("musicxml", fp=tmp_path)
        with open(tmp_path, "r", encoding="utf-8") as f:
            xml_string = f.read()
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return xml_string
