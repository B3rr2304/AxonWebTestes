from fastapi import APIRouter
from models.schemas import ClassifyRequest, ClassifyResponse
from services.chronotype import classificar_cronotipo

router = APIRouter(prefix="/classify", tags=["classify"])


@router.post("/", response_model=ClassifyResponse)
def classify(body: ClassifyRequest):
    cronotipo, pontos = classificar_cronotipo(body.respostas)
    return ClassifyResponse(cronotipo=cronotipo, pontos=pontos)
