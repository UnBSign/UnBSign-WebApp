const fileInput = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const fileValidationDisplay = document.getElementById("fileValidationDisplay");
const signatureDetails = document.getElementById("signatureDetails");

fileInput.addEventListener('change', (event) => {
    const fileName = event.target.files[0]?.name || '';
    fileNameDisplay.textContent = fileName ? `Arquivo selecionado: ${fileName}` : '';
    fileNameDisplay.style.color = 'black';
});

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(document.getElementById('uploadForm'));

    try {
        const response = await fetch('http://localhost:8080/api/pdf/validation', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            fileValidationDisplay.style.display = 'flex';
            fileValidationDisplay.style.color = 'black';
            
            if (result.success) {
                if (result.signatures && result.signatures.length > 0) {
                    signatureDetails.style.display = 'flex';
                    fileValidationDisplay.textContent = `A assinatura no documento é válida`;
                    let signatureHTML = '<div> ASSINATURAS:<br> <div>';
                    result.signatures.forEach(signature => {
                        signatureHTML += `
                            <div>
                                <p><strong>CN:</strong> ${signature.CN || "N/A"}</p>
                                <p><strong>Data:</strong> ${new Date(signature.SigningDate).toLocaleString()}</p>
                                <p><strong>ID da assinatura:</strong> ${signature['SignatureID']}</p>
                                <p><strong>Número do Certificado:</strong> ${signature['SerialNumber']}</p>
                                <p><strong>Integridade:</strong> ${signature.Integrity ? 'Válida' : 'Inválida'}</p>
                            </div>
                            <hr>
                        `;
                    });
                    signatureDetails.innerHTML = signatureHTML;
                } else {
                    fileValidationDisplay.textContent = `Nenhuma assinatura encontrada no documento`;
                    signatureDetails.style.display = 'none';
                }
            } else {
                fileValidationDisplay.style.display = 'flex';
                fileValidationDisplay.textContent = `A assinatura no documento não é válida`;
                fileValidationDisplay.style.color = 'red';
                signatureDetails.style.display = 'none';
            }
        } else {
            alert(result.error || 'Ocorreu um erro ao validar o PDF.');
            console.log(result.error);
        }
    } catch (error) {
        fileNameDisplay.textContent = `Erro: ${error.message}`;
        console.log(error);
    }
});