# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.17.

## 🚀 Development server

Para iniciar o ambiente de desenvolvimento com a configuração de proxy ativa, utilize o comando abaixo em vez do ng serve padrão:

```bash
npm start
```
Esse script executa internamente:

```bash
ng serve --proxy-config proxy.conf.json
```
O arquivo proxy.conf.json é responsável por redirecionar as requisições feitas pela aplicação Angular para o backend durante o desenvolvimento, evitando problemas de CORS e simplificando o consumo das APIs locais.

Após o servidor iniciar, acesse em seu navegador:`http://localhost:4200/`. 

## 🎨 Tailwind CSS

Este projeto utiliza Tailwind CSS para o gerenciamento dos estilos.
O arquivo `dist/tailwind-output.css` não é versionado no repositório, pois é gerado automaticamente a partir do arquivo `src/styles.css`.

Para gerar e manter o CSS atualizado, execute o comando:


```bash
npm run tailwind:watch
```

Esse comando compila as diretivas do Tailwind e mantém o processo de observação ativo para atualizar o arquivo sempre que houver modificações nos estilos.

# ⚠️ Importante

Dte o desenvolvimento, é necessário rodar dois processos em paralelo — um para o Angular e outro para o Tailwind.
Utilize dois terminais:

Terminal 1:
```bash
npm start
```
Inicia o servidor Angular com o proxy configurado.

Terminal 2:
```bash
npm run tailwind:watch
```
Inicia o Tailwind em modo watch para compilar os estilos.

## 🚀 Executando Frontend e Tailwind CSS juntos

É possível rodar o Angular e o Tailwind CSS em paralelo no mesmo terminal de duas formas:

# 1️⃣ Usando o operador & (Windows PowerShell ou CMD)

```bash
npm run dev
```
Este comando executa:

```bash
npm run tailwind:watch & npm start
```
inicia o Tailwind em modo watch e o servidor Angular simultaneamente.
Pode gerar logs misturados no terminal.
Funciona sem instalar pacotes extras.

2️⃣ Usando o pacote concurrently

```bash
npm run dev:concurrently
```
Este comando executa:

```bash
concurrently "npm run tailwind:watch" "npm start"
```
Inicia ambos os processos em paralelo com logs separados e coloridos.

Recomendado para uma visualização mais organizada.

Requer instalar concurrently como dependência de desenvolvimento rodando novamente `npm install global` ou `npm install concurrently --save-dev`

⚠️ Observação:
Ambos os métodos são equivalentes, mas se você quiser um terminal limpo e organizado, use dev:concurrently.
Lembre-se de ter o dist/tailwind-output.css sendo gerado pelo Tailwind antes de iniciar a aplicação.
 

## 🧩 Geração de Código (Scaffolding)

O Angular CLI possui ferramentas poderosas de geração de código.
Para criar um novo componente, utilize:

```bash
ng generate component component-name
```

Para listar todos os tipos de schematics disponíveis (como `components`, `directives`, or `pipes`), use:

```bash
ng generate --help
```

## 🏗️ Build do Projeto

Para gerar a build de produção, execute:

```bash
ng build
```

Esse comando compila a aplicação e salva os artefatos finais na pasta `dist/.`
A build de produção é otimizada automaticamente para melhor desempenho e velocidade.
