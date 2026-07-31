# SIGEA - Tela de Login

Tela de autenticação do **SIGEA** (Sistema Integrado de Gestão de Espaços Acadêmicos), desenvolvida em React + Vite.

## Estrutura do projeto

```
sigea-login/
├── public/                  # Arquivos estáticos servidos diretamente
├── src/
│   ├── assets/
│   │   └── images/          # Logos e imagens do projeto
│   ├── components/          # Componentes reutilizáveis (ex: botões, inputs)
│   ├── pages/
│   │   └── Login/
│   │       ├── LoginPage.jsx
│   │       └── LoginPage.css
│   ├── styles/
│   │   ├── global.css       # Reset e estilos globais
│   │   └── variables.css    # Tokens de cor e tipografia da marca
│   ├── App.jsx               # Componente raiz
│   └── main.jsx               # Ponto de entrada da aplicação
├── index.html
├── package.json
├── vite.config.js
├── .eslintrc.cjs
└── .gitignore
```

## Paleta de cores

| Cor            | Hex       |
|----------------|-----------|
| Azul           | `#004A8D` |
| Azul (hover)   | `#1A63A6` |
| Azul escuro    | `#00365F` |
| Laranja        | `#F7941D` |
| Laranja claro  | `#FDC180` |

## Usuário de teste (fake)

Para testar o registro localmente, use as credenciais definidas em `src/data/fakeUser.js`:

| Campo  | Valor               |
|--------|---------------------|
| E-mail | usuario@sigea.com   |
| Senha  | 123456              |

## Conexão com o backend

O login agora é feito de verdade contra a API (`sigea/back`), via `src/services/api.js`. A URL da API é lida da variável de ambiente `VITE_API_URL` (arquivo `.env`, padrão `http://localhost:3300`).

Antes de testar o login:

1. Suba o backend (`cd ../back && npm install && npm start`).
2. Crie um usuário de teste no banco, por exemplo:
   ```bash
   curl -X POST http://localhost:3300/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Usuário Teste","email":"usuario@sigea.com","password":"123456","reg_number":1}'
   ```
3. Rode o frontend (`npm run dev`) e faça login com esse e-mail/senha.

Ao logar com sucesso, os dados do usuário (sem a senha) são salvos em `sessionStorage` e exibidos na página `/home`.

## Como rodar o projeto

```bash
# instalar dependências
npm install

# iniciar em modo desenvolvimento
npm run dev

# gerar build de produção
npm run build

# pré-visualizar o build de produção
npm run preview
```

## Próximos passos sugeridos

- Adicionar validação de e-mail/senha com feedback em tempo real.
- Adicionar testes (Vitest + React Testing Library).
- Adicionar tela de cadastro consumindo `authService.register`.
