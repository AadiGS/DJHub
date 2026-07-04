from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Experiment, Module, Subject
from app.schemas import ModuleOut, SubjectDetailOut, SubjectOut

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


@router.get("", response_model=list[SubjectOut])
async def get_subjects(branch_id: int, semester: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Subject)
        .where(Subject.branch_id == branch_id, Subject.semester == semester)
        .order_by(Subject.name)
    )
    return result.scalars().all()


@router.get("/{subject_id}", response_model=SubjectDetailOut)
async def get_subject(subject_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Subject)
        .where(Subject.id == subject_id)
        .options(
            selectinload(Subject.modules).selectinload(Module.materials),
            selectinload(Subject.experiments).selectinload(Experiment.materials),
            selectinload(Subject.pyqs),
        )
    )
    subject = result.scalar_one_or_none()
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")

    return SubjectDetailOut.model_validate(
        {
            "id": subject.id,
            "name": subject.name,
            "semester": subject.semester,
            "branch_id": subject.branch_id,
            "has_theory": subject.has_theory,
            "has_lab": subject.has_lab,
            "modules": subject.modules if subject.has_theory else [],
            "experiments": subject.experiments if subject.has_lab else [],
            "pyqs": subject.pyqs,
        }
    )


@router.get("/{subject_id}/modules", response_model=list[ModuleOut])
async def get_subject_modules(subject_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Subject).where(Subject.id == subject_id)
    )
    subject = result.scalar_one_or_none()
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")

    result = await db.execute(
        select(Module)
        .where(Module.subject_id == subject_id)
        .order_by(Module.position)
        .options(selectinload(Module.materials))
    )
    return result.scalars().unique().all()
