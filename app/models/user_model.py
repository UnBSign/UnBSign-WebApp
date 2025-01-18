from uuid import uuid4
from sqlalchemy import String, Boolean
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import Mapped, mapped_column
from database.database import get_db, Base
import datetime
import bcrypt

class UserModel(Base):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(String(36),primary_key=True,default=str(uuid4()),
    )
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    dob: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)

    def create(
        full_name : str | None = None,
        username : str | None = None,
        dob : datetime.datetime | None = None,
        password : str | None = None
    ) -> "UserModel":
        session = next(get_db())
        try:
            new_user = UserModel(
                id=str(uuid4()),
                full_name=full_name,
                username=username,
                dob=dob,
                password=password,
                is_active=False
            )
            session.add(new_user)
            session.commit()
            
            session.refresh(new_user)
            
            return new_user
            
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def delete(user_id: str) -> None:
        session = next(get_db())
        try:
            user_to_delete = session.query(UserModel).filter(UserModel.id == user_id).first()
            if user_to_delete:
                session.delete(user_to_delete)
                session.commit()
                return f"User with ID {user_id} deleted successfully"
            else:
                return f"User with ID {user_id} not found."
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def find_user(user_id: str | None = None, username: str | None = None):
        session = next(get_db())
        try:
            if user_id:
                user = session.query(UserModel).filter(UserModel.id == user_id).first()
            elif username:
                user = session.query(UserModel).filter(UserModel.username == username).first()
            else:
                return None

            return user

        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def verify_password(self, plain_password: str):
        return bcrypt.checkpw(plain_password.encode(), self.password.encode())
    
    