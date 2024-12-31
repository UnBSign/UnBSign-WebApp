from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.user_model import UserModel
import bcrypt



class UserController:
    
    db: Session = SessionLocal()
    
    def __init__(self, user: UserModel):
        self.user = user
    
    def create_user(self):
        
        password = UserController.generate_hash_password(self.user.password)
        self.user.password = password
        try:
            user = UserModel.create_user(
                full_name = self.user.full_name,
                username = self.user.username,
                dob = self.user.dob,
                password = self.user.password
            )
            
            return user
        except Exception as e:
            raise e
        
 
    
    def generate_hash_password(password):
        hash = bcrypt.hashpw(
            password.encode(),
            bcrypt.gensalt(),
        )
        return hash.decode()
    
        
        