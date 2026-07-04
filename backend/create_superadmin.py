import asyncio

from sqlalchemy import select

from app.auth import get_password_hash
from app.database import AsyncSessionLocal
from app.models import User, UserRole

USERNAME = "admin"
PASSWORD = "adminpassword"


async def create_superadmin():
    async with AsyncSessionLocal() as session:
        existing = (await session.execute(select(User).where(User.username == USERNAME))).scalar_one_or_none()
        if existing is not None:
            print(f"User {USERNAME} already exists (role={existing.role.value}). Nothing to do.")
            return

        user = User(
            username=USERNAME,
            hashed_password=get_password_hash(PASSWORD),
            role=UserRole.SUPERADMIN,
            branch_id=None,
        )
        session.add(user)
        await session.commit()
        print(f"Superadmin created: {USERNAME}")


if __name__ == "__main__":
    asyncio.run(create_superadmin())
