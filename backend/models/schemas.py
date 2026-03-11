from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class NoteEvent(BaseModel):
    pitch_midi: int
    pitch_name: str
    start_sec: float
    duration_sec: float
    start_beat: float
    duration_beats: float
    velocity: int
    measure: int
    beat_in_measure: float


class TranscribeResponse(BaseModel):
    musicxml: str
    bpm: float
    time_signature: str
    notes: list[NoteEvent]


class SynthesizeRequest(BaseModel):
    musicxml: str
    bpm_override: Optional[float] = None


class SynthesizeResponse(BaseModel):
    bpm: float
    time_signature: str
    total_duration_sec: float
    notes: list[NoteEvent]
