# ADR-0001: Stack obrigatória

- Status: Aceita
- Data: 2026-11-05

## Contexto
O enunciado de LP II exige JavaScript, MVC, Node.js, Express, middlewares, API RESTful, MongoDB e Vue.js.
O repositório já tem esqueleto: `backend/` (Express 5, Mongoose 9, cors, ESM) e `frontend/` (Vue 3 + Vite).

## Decisão
- Backend: Node.js + Express 5 + Mongoose, estrutura MVC (`models/`, `controllers/`, `routes/`, `middlewares/`, `config/`).
- Frontend: Vue 3 + Vite (SPA) consumindo a API REST.
- Linguagem: JavaScript (ESM), sem TypeScript.

## Consequências
- Back e front separados, comunicação via JSON/HTTP com CORS.
- Bibliotecas extras (router, estado, UI, auth, IA) decididas em ADRs próprios.
