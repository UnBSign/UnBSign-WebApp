import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.user_model import UserModel
from fastapi import HTTPException, status
from jwt import PyJWTError

SECRET_KEY="4b9ce953b6a221989c9eed27d86c874b961fdebc9bfe38a8d68f4722ef84dbc7502b3cec84b6f4656fbcff04ed757e40d9eb8d75b66e0176b9b0e335af142731b0d42bd9327d9939fd76c34972339f1d1695899c8cc1ce633747132c4061a43eac24cfc6725f580a3d85d0c7d5f7206161fbedf6bd24da77d91808bb32f7d93898d86614abc4c916b0f6581dde61dd7f933e869c40574d10bc10d7726f6e7dcaf43a408c401a6202b6e215729f0f52ceeabe4f5f2e4db3b28c55d56ff2b899ee9a2b87015379ff633c776959e4bbd479a636d46e6854b62ee9c6a8acc8402f4f94ae8632324531f43f9a16063b12dc0f9136f0f3eea131e6210d72cc994f824c"
ALGORITHM ="HS256"
ACCESS_TOKEN_HOURS = 1

class LoginController():
    def authenticate_user(self, username: str, password: str):
        db: Session = SessionLocal()
        try:
            user = db.query(UserModel).filter(UserModel.username == username).first()
            
            if user and user.verify_password(password):
                payload = {
                    "issuer": "webapp_test",
                    "user_id": str(user.id),
                    "username": user.username,
                    "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_HOURS)
                }
                
                token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
                
                user.is_active = True
                db.commit()
                return token
            
            return None
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while authenticating the user"
            )
        finally:
            db.close()
            
    def validate_user_authToken(token: str):
        db: Session = SessionLocal()
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token payload")

            user = db.query(UserModel).filter(UserModel.id == user_id).first()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            if not user.is_active:
                raise HTTPException(status_code=401, detail="User not active")

            return user.full_name
        except PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        finally:
            db.close()
            
    def deactivate_user_session(token: str):
        db: Session = SessionLocal()
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token payload")

            user = db.query(UserModel).filter(UserModel.id == user_id).first()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            user.is_active = False
            db.commit()
        except PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        finally:
            db.close()