
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date
from typing import Optional


class StudentCreate(BaseModel):
    name: str
    date_of_birth: date
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    address: Optional[str] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    address: Optional[str] = None


class StudentResponse(BaseModel):
    id: int
    name: str
    date_of_birth: date
    email: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    address: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
