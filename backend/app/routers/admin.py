from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import get_current_admin, get_current_superadmin, get_password_hash
from app.database import get_db
from app.models import PYQ, Branch, Experiment, Material, Module, Subject, User, UserRole
from app.schemas import (
    ExperimentCreate,
    ExperimentOut,
    MaterialCreate,
    MaterialOut,
    MaterialUpdate,
    ModuleCreate,
    ModuleOut,
    ModuleReorder,
    ModuleUpdate,
    PYQCreate,
    PYQOut,
    PYQUpdate,
    SubjectCreate,
    SubjectOut,
    SubjectUpdate,
    UserCreate,
    UserOut,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


def enforce_branch_access(current_user: User, branch_id: int) -> None:
    if current_user.role == UserRole.SUPERADMIN:
        return
    if current_user.branch_id != branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this branch",
        )


async def get_material_subject(db: AsyncSession, material: Material) -> Subject:
    if material.module_id is not None:
        module = await db.get(Module, material.module_id)
        subject_id = module.subject_id
    else:
        experiment = await db.get(Experiment, material.experiment_id)
        subject_id = experiment.subject_id
    return await db.get(Subject, subject_id)


@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def create_subject(
    payload: SubjectCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    enforce_branch_access(current_user, payload.branch_id)

    branch = await db.get(Branch, payload.branch_id)
    if branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    subject = Subject(**payload.model_dump())
    db.add(subject)
    await db.commit()
    return subject


@router.patch("/subjects/{subject_id}", response_model=SubjectOut)
async def update_subject(
    subject_id: int,
    payload: SubjectUpdate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    subject = await db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    enforce_branch_access(current_user, subject.branch_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(subject, field, value)

    await db.commit()
    return subject


@router.post("/modules", response_model=ModuleOut, status_code=status.HTTP_201_CREATED)
async def create_module(
    payload: ModuleCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    subject = await db.get(Subject, payload.subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    enforce_branch_access(current_user, subject.branch_id)

    max_position = await db.scalar(
        select(func.max(Module.position)).where(Module.subject_id == payload.subject_id)
    )

    module = Module(subject_id=payload.subject_id, title=payload.title, position=(max_position or 0) + 1)
    module.materials = []  # avoid an async lazy-load of this relationship during response serialization
    db.add(module)
    await db.commit()
    return module


@router.patch("/modules/{module_id}", response_model=ModuleOut)
async def update_module(
    module_id: int,
    payload: ModuleUpdate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    module = await db.get(Module, module_id, options=[selectinload(Module.materials)])
    if module is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    subject = await db.get(Subject, module.subject_id)
    enforce_branch_access(current_user, subject.branch_id)

    module.title = payload.title
    await db.commit()
    return module


@router.patch("/subjects/{subject_id}/modules/reorder", response_model=list[ModuleOut])
async def reorder_modules(
    subject_id: int,
    payload: ModuleReorder,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    subject = await db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    enforce_branch_access(current_user, subject.branch_id)

    result = await db.execute(
        select(Module).where(Module.subject_id == subject_id).options(selectinload(Module.materials))
    )
    modules_by_id = {m.id: m for m in result.scalars().all()}

    if set(payload.module_ids) != set(modules_by_id.keys()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="module_ids must include exactly the modules belonging to this subject",
        )

    for position, module_id in enumerate(payload.module_ids, start=1):
        modules_by_id[module_id].position = position

    await db.commit()
    return sorted(modules_by_id.values(), key=lambda m: m.position)


@router.post("/experiments", response_model=ExperimentOut, status_code=status.HTTP_201_CREATED)
async def create_experiment(
    payload: ExperimentCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    subject = await db.get(Subject, payload.subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    enforce_branch_access(current_user, subject.branch_id)

    experiment = Experiment(**payload.model_dump())
    experiment.materials = []  # avoid an async lazy-load of this relationship during response serialization
    db.add(experiment)
    await db.commit()
    return experiment


@router.post("/materials", response_model=MaterialOut, status_code=status.HTTP_201_CREATED)
async def create_material(
    payload: MaterialCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if payload.module_id is not None:
        module = await db.get(Module, payload.module_id)
        if module is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
        subject_id = module.subject_id
    else:
        experiment = await db.get(Experiment, payload.experiment_id)
        if experiment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
        subject_id = experiment.subject_id

    subject = await db.get(Subject, subject_id)
    enforce_branch_access(current_user, subject.branch_id)

    material = Material(**payload.model_dump())
    db.add(material)
    await db.commit()
    return material


@router.patch("/materials/{material_id}", response_model=MaterialOut)
async def update_material(
    material_id: int,
    payload: MaterialUpdate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    material = await db.get(Material, material_id)
    if material is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")

    subject = await get_material_subject(db, material)
    enforce_branch_access(current_user, subject.branch_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(material, field, value)

    await db.commit()
    return material


@router.delete("/materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    material = await db.get(Material, material_id)
    if material is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")

    subject = await get_material_subject(db, material)
    enforce_branch_access(current_user, subject.branch_id)

    await db.delete(material)
    await db.commit()


@router.post("/pyqs", response_model=PYQOut, status_code=status.HTTP_201_CREATED)
async def create_pyq(
    payload: PYQCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    subject = await db.get(Subject, payload.subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    enforce_branch_access(current_user, subject.branch_id)

    pyq = PYQ(**payload.model_dump())
    db.add(pyq)
    await db.commit()
    return pyq


@router.patch("/pyqs/{pyq_id}", response_model=PYQOut)
async def update_pyq(
    pyq_id: int,
    payload: PYQUpdate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    pyq = await db.get(PYQ, pyq_id)
    if pyq is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PYQ not found")

    subject = await db.get(Subject, pyq.subject_id)
    enforce_branch_access(current_user, subject.branch_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pyq, field, value)

    await db.commit()
    return pyq


@router.delete("/pyqs/{pyq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pyq(
    pyq_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    pyq = await db.get(PYQ, pyq_id)
    if pyq is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PYQ not found")

    subject = await db.get(Subject, pyq.subject_id)
    enforce_branch_access(current_user, subject.branch_id)

    await db.delete(pyq)
    await db.commit()


@router.get("/users", response_model=list[UserOut])
async def list_users(
    current_user: User = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.username))
    return result.scalars().all()


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    current_user: User = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db),
):
    branch = await db.get(Branch, payload.branch_id)
    if branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    user = User(
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        role=UserRole.BRANCH_ADMIN,
        branch_id=payload.branch_id,
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this username already exists")
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot revoke your own access")

    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.delete(user)
    await db.commit()
