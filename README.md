# Intruções para Executar a Aplicação

1. Criar o arquivo de variáveis de ambiente: No diretório raiz do projeto, crie um arquivo `.env` com as variáveis de ambiente presentes no arquivo `.env_example`.

A variável mais importante no arquivo `.env` é a `API_URL`, que define o endereço onde a API UnBSign está sendo executada. Por padrão, o valor está configurado como `http://localhost:8080/api`, que é o endereço local e o ponto de entrada da API.

Caso a API esteja sendo executada em outro ambiente, seja em um servidor remoto ou em outra porta, atualize essa variável para refletir o endereço correto, incluindo a porta e o endpoint `/api`, pois é para esse endereço que o cliente front-end irá enviar as requisições.

2. Construir e iniciar os containers com Docker Compose: Após configurar o arquivo `.env`, execute o seguinte comando para construir e iniciar os containers:
```docker
docker-compose up --build
```

Este arquivo docker-compose.yml configura dois serviços: FastAPI, que executa a aplicação web (API) na porta 8000, e Postgres, que fornece o banco de dados. Ambos os serviços utilizam variáveis de ambiente definidas no arquivo .env e são conectados através de uma rede personalizada chamada unbsign-network. O FastAPI depende do Postgres para persistência dos dados, e os dados do banco de dados são armazenados em um volume local para garantir sua persistência. Esses serviços funcionam de forma integrada dentro de um ambiente isolado.