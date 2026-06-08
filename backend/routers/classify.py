from fastapi import APIRouter, Depends
from models.schemas import ClassifyRequest, ClassifyResponse
from services.chronotype import classificar_cronotipo
from auth_helper import get_current_user
from database import supabase

router = APIRouter(prefix="/classify", tags=["classify"])


@router.post("/", response_model=ClassifyResponse)
def classify(body: ClassifyRequest):
    cronotipo, pontos = classificar_cronotipo(body.respostas)
    return ClassifyResponse(cronotipo=cronotipo, pontos=pontos)


@router.post("/save", response_model=ClassifyResponse)
def classify_and_save(
    body: ClassifyRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    cronotipo, pontos = classificar_cronotipo(body.respostas)

    rows = [
        {"user_id": user_id, "pergunta": pergunta, "alternativa": alternativa}
        for pergunta, alternativa in body.respostas.items()
    ]
    supabase.table("respostas").insert(rows).execute()

    profile_update = {
        "chronotype": cronotipo,
        "qualidade_sono": body.qualidade_sono,
        "onboarding_completed": True,
    }
    if body.schedule_type:
        profile_update["schedule_type"] = body.schedule_type

    supabase.table("profiles").update(profile_update).eq("id", user_id).execute()

    return ClassifyResponse(cronotipo=cronotipo, pontos=pontos)
