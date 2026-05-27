from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserDevice


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> User | None:
        result = await self.session.execute(select(User).where(User.phone == phone))
        return result.scalar_one_or_none()

    async def create(self, phone: str, name: str | None = None) -> User:
        user = User(phone=phone, name=name)
        self.session.add(user)
        await self.session.flush()
        return user

    async def upsert_device(self, user_id: UUID, device_id: str, device_name: str | None = None) -> UserDevice:
        result = await self.session.execute(
            select(UserDevice).where(
                and_(UserDevice.user_id == user_id, UserDevice.device_id == device_id)
            )
        )
        device = result.scalar_one_or_none()
        if device:
            device.last_login = None
            return device
        device = UserDevice(
            user_id=user_id,
            device_id=device_id,
            device_name=device_name,
        )
        self.session.add(device)
        await self.session.flush()
        return device

    async def get_device(self, user_id: UUID, device_id: str) -> UserDevice | None:
        result = await self.session.execute(
            select(UserDevice).where(
                and_(UserDevice.user_id == user_id, UserDevice.device_id == device_id)
            )
        )
        return result.scalar_one_or_none()

    async def get_user_by_refresh_token(self, refresh_token: str) -> User | None:
        pass
