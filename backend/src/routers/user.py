from fastapi import APIRouter, HTTPException

from dal.user import get_user_profile
from schemas.user import UserRead


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserRead)
async def read_user(user_id: str) -> UserRead:
    user = get_user_profile(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
