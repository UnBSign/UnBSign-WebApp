from fastapi import FastAPI, Form, File, UploadFile, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from pathlib import Path
import base64
from app.controller.user_controller import UserController
from app.inputs.user_input import UserInput
from app.controller.login_controller import LoginController

app = FastAPI() 

app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")

@app.get("/signature/upload", response_class=HTMLResponse)
async def render_upload_page(request: Request):
    token = request.cookies.get("authToken")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    full_name = LoginController.validate_user_authToken(token)
    return templates.TemplateResponse("upload_sign.html", {"request": request, "pdf_document": None, "full_name": full_name})

@app.get("/validation/upload", response_class=HTMLResponse)
async def render_upload_validation_page(request: Request):
    return templates.TemplateResponse("upload_validation.html", {"request": request, "pdf_document": None})

@app.get("/cadastro", response_class=HTMLResponse)
async def render_cadastro_page(request: Request):
    return templates.TemplateResponse("cadastro.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def render_login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/logout")
async def logout(request: Request):
    authToken = request.cookies.get("authToken")
    if authToken:
        LoginController.deactivate_user_session(authToken)
    response = RedirectResponse(url="/login")
    response.delete_cookie(key="authToken")
    return response

@app.post("/signature/upload")
async def upload_pdf(file: UploadFile = File(...)):

    pdf_bytes = await file.read()

    pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

    return JSONResponse(content={"success": True, "pdf_file": pdf_base64})

@app.post("/cadastro")
async def register_user(request: Request, user_input: UserInput):
    created_user = UserController(user_input).create_user()
    if created_user:
        return JSONResponse(content={"message": "User created successfully"}, status_code=201)
    else:
        return JSONResponse(content={"message": "Failed to create user"}, status_code=422)

@app.post("/login")
async def login_user(username: str = Form(...), password: str = Form(...)):
    token = LoginController().authenticate_user(username, password)
    if token:
        response = JSONResponse(content={"message": "Login successful"}, status_code=200)
        response.set_cookie(key="authToken", value=token, httponly=False, secure=True, samesite="Strict")
        return response
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

