from pydantic import BaseModel

class UserInput(BaseModel):
    full_name: str | None = None
    username: str | None = None
    dob: str | None = None
    password: str | None = None
    email: str | None = None