from fastapi import FastAPI, Form, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import base64
from io import BytesIO

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Rota para renderizar a página de upload
@app.get("/sign/upload", response_class=HTMLResponse)
async def render_upload_page(request: Request):
    return templates.TemplateResponse("upload.html", {"request": request, "pdf_document": None})

# Endpoint para receber o PDF e converter para base64
@app.post("/sign/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Lê o conteúdo do arquivo PDF
    pdf_bytes = await file.read()

    # Converte o PDF para base64
    pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

    # Retorna o base64 como parte da resposta JSON
    return JSONResponse(content={"success": True, "pdf_file": pdf_base64})
