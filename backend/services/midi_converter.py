def save_midi(midi_data, output_path: str) -> None:
    """Write pretty_midi MidiFile to disk."""
    midi_data.write(output_path)


def get_bpm_from_midi(midi_data) -> float:
    """Extract first tempo from MIDI, default 120 BPM."""
    try:
        tempo_change_times, tempos = midi_data.get_tempo_changes()
        if len(tempos) > 0:
            return round(60_000_000 / tempos[0], 2)
    except Exception:
        pass
    return 120.0
