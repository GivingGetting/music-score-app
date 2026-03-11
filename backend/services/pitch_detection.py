import os
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf


def detect_pitches(audio_path: str) -> tuple:
    """
    Run basic-pitch inference on the given audio file.
    Returns (model_output, midi_data, note_events).
    """
    from basic_pitch.inference import predict
    from basic_pitch import ICASSP_2022_MODEL_PATH

    model_output, midi_data, note_events = predict(
        audio_path,
        ICASSP_2022_MODEL_PATH,
        onset_threshold=0.5,
        frame_threshold=0.3,
        minimum_note_length=58,  # ms
        minimum_frequency=32.7,
        maximum_frequency=2093.0,
        multiple_pitch_bends=False,
        melodia_trick=True,
    )
    return model_output, midi_data, note_events


def normalize_audio(input_path: str, output_path: str) -> None:
    """Convert any audio format to 22050 Hz mono WAV for basic-pitch."""
    from pydub import AudioSegment

    audio = AudioSegment.from_file(input_path)
    audio = audio.set_channels(1).set_frame_rate(22050)
    audio.export(output_path, format="wav")
