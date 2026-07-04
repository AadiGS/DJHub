from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Branch
from app.schemas import BranchOut

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("", response_model=list[BranchOut])
async def get_branches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Branch).order_by(Branch.name))
    return result.scalars().all()
