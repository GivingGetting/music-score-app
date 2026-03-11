from fastapi import APIRouter, HTTPException

from models.schemas import SynthesizeRequest, SynthesizeResponse
from services.score_parser import parse_musicxml_to_schedule

router = APIRouter()


@router.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize_score(body: SynthesizeRequest):
    try:
        notes, bpm, time_sig = parse_musicxml_to_schedule(body.musicxml, body.bpm_override)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse MusicXML: {e}")

    if not notes:
        raise HTTPException(status_code=422, detail="No notes found in score")

    total_duration = max((n.start_sec + n.duration_sec for n in notes), default=0.0)

    return SynthesizeResponse(
        bpm=bpm,
        time_signature=time_sig,
        total_duration_sec=round(total_duration, 4),
        notes=notes,
    )
