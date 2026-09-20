from pydantic import BaseModel, EmailStr


class MemberInvite(BaseModel):
    email: EmailStr


class MemberResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    role: str