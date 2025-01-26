from app.models.user_model import UserModel
import bcrypt
import requests
from app.controller.login_controller import LoginController

class UserController:
    def __init__(self, user: UserModel):
        self.user = user
    
    def create_user(self):
        new_user = None
        
        try:
            password = UserController.generate_hash_password(self.user.password)
            self.user.password = password
 
            new_user = UserModel.create(
                full_name = self.user.full_name,
                username = self.user.username,
                dob = self.user.dob,
                password = self.user.password
            )
            
            token = LoginController().generate_user_token(new_user.id, new_user.full_name)
            
            headers = {
                "Authorization": f"Bearer {token}"
            }

            response = requests.post(
                "http://host.docker.internal:8080/api/certificates/issue-certificate",
                json={"id": new_user.id, "cn": new_user.full_name},
                headers=headers
            )
            
            if response.status_code != 200:
                UserModel.delete(new_user.id)
                raise Exception(f"Failed to generate certificate to user. Status code: {response.status_code}")
            
            return new_user
        except Exception as e:
            if new_user:
                UserModel.delete(new_user.id)
            raise e
    
    def generate_hash_password(password):
        hash = bcrypt.hashpw(
            password.encode(),
            bcrypt.gensalt(),
        )
        return hash.decode()
    
        
        