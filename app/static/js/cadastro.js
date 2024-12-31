document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const json = {};

    formData.forEach((value, key) => json[key] = value);

    try {
        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        });

        const result = await response.json();
        
        if (response.status === 201) {
            alert('Usuário cadastrado com sucesso!');
            window.location.href = '/login';
        } else if (response.status === 422 || response.status !== 201) {
            alert('Erro ao cadastrar usuário');
        }
    } catch (error) {
        console.error('Erro ao fazer requisição:', error);
        alert('Ocorreu um erro ao tentar cadastrar o usuário.');
    }
});
