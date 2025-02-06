from pyngrok import ngrok

public_url_8000 = ngrok.connect(8000)
print(f"Public URL para o túnel HTTP na porta 8000: {public_url_8000}")

public_url_8080 = ngrok.connect(8080)
print(f"Public URL para o túnel HTTP na porta 8080: {public_url_8080}")

while True:
    pass