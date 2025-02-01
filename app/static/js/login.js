document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password })
        });

        if (response.ok) {
            const result = await response.json();
            const uploadResponse = await fetch('/signature/upload', {
                method: 'GET',
                credentials: 'include',
            });

            if (uploadResponse.ok) {
                window.location.href = '/signature/upload';
            } else {
                console.error("Falha ao acessar /signature/upload:", uploadResponse.status);
            }
        } else {
            const errorResult = await response.json();
            console.error("Erro no login:", errorResult);
            alert("Credenciais inválidas. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro inesperado:", error);
    }
});