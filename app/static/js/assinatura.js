document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (file && file.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/signature/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('pdfContainer').style.display = 'block';
                document.getElementById('pdfNavigation').style.display = 'flex';
                
                const reader = new FileReader();
                reader.onloadend = function () {
                    const base64PDF = reader.result.split(',')[1];
                    sessionStorage.setItem('pdfFile', base64PDF);
                    sessionStorage.setItem('pdfName', file.name);
                    loadPDF(base64PDF); 
                    centerStamp();
                };
                reader.readAsDataURL(file);
            } else {
                alert(data.error);
            }
        })
        .catch(() => alert('Erro ao carregar o arquivo.'));
    }
});

document.getElementById('signButton').addEventListener('click', function() {
    const base64PDF = sessionStorage.getItem('pdfFile');
    const pdfName = sessionStorage.getItem("pdfName");
    const pos = getStampPosition();

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        console.log(parts)
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Se o cookie não for encontrado
    }
    
    const authToken = getCookie('authToken');

    if (base64PDF && pos) {
        const pdfBlob = base64ToBlob(base64PDF);
        

        const formData = new FormData();
        formData.append('file', pdfBlob, pdfName);
        formData.append('posX', pos.x);
        formData.append('posY', pos.y);
        formData.append('pageNumber', currentPage);
        
        fetch('http://localhost:8080/api/pdf/signature', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
        })
        .then(response => {
            if (!response.ok) {
                console.log(response)
                throw new Error('Erro ao assinar o arquivo');
            }
            console.log(response.headers)
            
            const signedFileName = setSignedFileName(pdfName);
            console.log(signedFileName);
            
            

            // Criar o Blob do PDF assinado
            return response.blob().then(blob => {
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = signedFileName; 
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
              });
        })
        .catch(error => {
            console.error(error);
            alert('Erro ao assinar o arquivo');
        });
    }
});

function setSignedFileName(fileName){
    const parts = fileName.split('.');
    const extension = parts[parts.length - 1];
    const name = fileName.replace(/\.[^/.]+$/, '')
    return  name.concat("_assinado.", extension)
}

// Função para converter base64 para Blob
function base64ToBlob(base64) {
    const binaryString = atob(base64);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }
    return new Blob([byteArray], { type: 'application/pdf' });
}

let currentPage = 1;
let pdfDoc = null;

function loadPDF(base64PDF) {

    const pdfData = atob(base64PDF);
    const loadingTask = pdfjsLib.getDocument({data: new Uint8Array(pdfData.length).map((_, i) => pdfData.charCodeAt(i))});

    loadingTask.promise.then(function (loadedPdfDoc) {
        pdfDoc = loadedPdfDoc;
        currentPage = pdfDoc.numPages;
        renderPage(currentPage);
    });
}

function renderPage(pageNum){
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');

    pdfDoc.getPage(pageNum).then(function (page) {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext);

        document.getElementById('pageNumberDisplay').textContent = `${pageNum}/${pdfDoc.numPages}`;
    })
}

function nextPage() {
    if (currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
}

document.getElementById('prevButton').addEventListener('click', prevPage);
document.getElementById('nextButton').addEventListener('click', nextPage);

// Carimbo móvel
let isDragging = false;
let offsetX, offsetY;

const stamp = document.getElementById('stamp');
const pdfContainer = document.getElementById('pdfContainer');

stamp.addEventListener("mousedown", (e) => {
    isDragging = true;
    // deslocamento inicial entre o mouse e o carimbo
    offsetX = e.clientX - stamp.getBoundingClientRect().left;
    offsetY = e.clientY - stamp.getBoundingClientRect().top;
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) moveStamp(e);
});

document.addEventListener("mouseup", () => {
    // console.log(getStampPosition())
    isDragging = false;
});

function moveStamp(e) {
    // calcula a nova posição do carimbo com compensação do scroll
    const newLeft = e.clientX - offsetX + pdfContainer.scrollLeft;
    const newTop = e.clientY - offsetY + pdfContainer.scrollTop;
    
    const canvasRect = document.getElementById('pdfCanvas').getBoundingClientRect();
    const maxLeft = canvasRect.width - stamp.clientWidth;
    const maxTop = canvasRect.height - stamp.clientHeight;

    // ajusta a posição para restringir o movimento dentro do canvas
    if (newLeft < canvasRect.left + pdfContainer.scrollLeft) newLeft = canvasRect.left + pdfContainer.scrollLeft;
    if (newTop < canvasRect.top + pdfContainer.scrollTop) newTop = canvasRect.top + pdfContainer.scrollTop;
    if (newLeft > canvasRect.left + pdfContainer.scrollLeft + maxLeft) newLeft = canvasRect.left + pdfContainer.scrollLeft + maxLeft;
    if (newTop > canvasRect.top + pdfContainer.scrollTop + maxTop) newTop = canvasRect.top + pdfContainer.scrollTop + maxTop;

    // Aplica o deslocamento para o carimbo
    stamp.style.left = (newLeft - pdfContainer.getBoundingClientRect().left) + "px";
    stamp.style.top = (newTop - pdfContainer.getBoundingClientRect().top) + "px";
}

// Função para capturar a posição do carimbo em relação ao canto inferior esquerdo e converter para pontos
function getStampPosition() {
    const stampRect = stamp.getBoundingClientRect();
    const canvasRect = document.getElementById('pdfCanvas').getBoundingClientRect();

    // Posição do canto inferior esquerdo do carimbo em relação ao topo esquerdo do canvas
    const posXRelativeToCanvas = stampRect.left - canvasRect.left;
    const posYRelativeToCanvas = canvasRect.bottom - stampRect.bottom;

    // Converte a posição de pixels para pontos (1 ponto = 1.333 pixels)
    const posXInPoints = posXRelativeToCanvas / 1.333;
    const posYInPoints = posYRelativeToCanvas / 1.333;

    // Retorna a posição em relação ao canvas (em pontos)
    return {
        x: posXInPoints,
        y: posYInPoints
    };
}

// Função para carregar o PDF e imprimir as dimensões da página em pontos
function printPDFSizeInPoints(base64PDF) {
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');
    
    const pdfData = atob(base64PDF);  // Decodifica a base64 para bytes
    const loadingTask = pdfjsLib.getDocument({data: new Uint8Array(pdfData.length).map((_, i) => pdfData.charCodeAt(i))});

    loadingTask.promise.then(function(pdfDoc) {
        // Pega a primeira página do PDF
        pdfDoc.getPage(1).then(function(page) {
            const viewport = page.getViewport({ scale: 1.5 }); // Definindo a escala (ajuste conforme necessário)
            
            // Calcula as dimensões da página em pontos (1 ponto = 1/72 polegada)
            const widthInPoints = viewport.width; // Largura em pontos
            const heightInPoints = viewport.height; // Altura em pontos

            // Imprime as dimensões da página no console
            console.log('Tamanho do PDF (em pontos):');
            console.log('Largura: ', widthInPoints, ' pontos');
            console.log('Altura: ', heightInPoints, ' pontos');
        });
    });
}

const base64PDF = sessionStorage.getItem('pdfFile');
printPDFSizeInPoints(base64PDF);

