# CondoLivre — Front (Controle de Concentração)

![next](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![responsive](https://img.shields.io/badge/layout-responsivo-2EE6C8)
[![demo](https://img.shields.io/badge/demo-condolivre.johnwayder.com-5C4EE5)](https://condolivre.johnwayder.com)

> 🌐 **No ar:** [condolivre.johnwayder.com](https://condolivre.johnwayder.com) — publicado
> numa EC2 (AWS) a cada `push` na `main`, via GitHub Actions.

Interface web do sistema de controle de risco de concentração. Consome a `condolivre-api`.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Bootstrap 5 + SCSS** com a paleta da marca CondoLivre
- **react-hook-form + yup** (formulários e validação)
- **react-select** (busca de cliente com filtro), **recharts** (gráficos), **lucide-react** (ícones)
- Node 24 (LTS — veja `.nvmrc`)

## Como rodar

Requer a API rodando (`condolivre-api` — `docker compose up`).

```bash
git clone https://github.com/johnwayder/condolivre-front.git
cd condolivre-front
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL aponta para a API
npm install
npm run dev
```

O front sobe em `http://localhost:3000` e a API em `http://localhost:5001` (definido em
`NEXT_PUBLIC_API_URL`) — portas distintas, sem conflito.

Credenciais de demonstração (semeadas pela API):

- Admin: `admin@condolivre.com.br` / `Admin@123`
- Operador: `operador@condolivre.com.br` / `Operador@123`
- Cliente: `cliente@condolivre.com.br` / `Cliente@123`

## Layout responsivo

A interface se adapta de desktop a celular:

- **Tabelas viram cards no mobile.** Toda tabela de dados (empréstimos, usuários, regras de
  concentração, fila de solicitações) usa a classe `cl-table-cards`: abaixo de 768px o
  cabeçalho some e cada linha vira um card, com cada célula no formato `rótulo → valor`
  (via `data-label`). É uma única regra SCSS em `assets/scss/main.scss`, aplicada a todas
  as tabelas — sem markup duplicado.
- **Menu lateral** colapsa em _drawer_ com backdrop; a **navbar superior** ganha o botão de
  menu.
- Formulários, filtros e o grid de cartões do dashboard reflowam em coluna única.

## Navegação

Após o login, o app tem um **menu lateral** fixo e uma **navbar superior** com o avatar do
usuário (dropdown para _Meus dados_ e _Sair_). Três perfis: `ADMIN`, `OPERATOR` e `USER`
(cliente).

Rotas:

- **/dashboard** — visões distintas por perfil (cartões-resumo, painel de concentração por
  estado e, para o staff, relatórios em gráficos).
- **/loans** — carteira de empréstimos, com filtros (estado, produto, intervalo de datas),
  ícone de **olho** para abrir os **detalhes do empréstimo + dados do cliente** num modal,
  e ações de editar/remover para `ADMIN`.
- **/requests** — fila de solicitações para `ADMIN`/`OPERATOR` aprovarem ou recusarem.
- **/my-requests** — solicitações do próprio cliente (`USER`).
- **/users** — CRUD de usuários, somente `ADMIN`.

Ações abrem em **modais**, acionáveis pelo menu lateral:

- **Novo empréstimo** — o staff escolhe um **cliente existente** (select com busca) ou
  **cadastra um novo** ali mesmo; todo empréstimo fica vinculado a um titular. Se a operação
  violar o limite e o usuário for `ADMIN`, um **ConfirmDialog** oferece _forçar o registro_.
- **Limites de concentração** — `ADMIN`.
- **Meus dados** — edição do próprio perfil (navbar superior).

Feedback de todas as operações via **toasts** (sucesso / erro) que somem sozinhos.

## Estrutura

```
src/
  app/
    layout.tsx              raiz, envolve o AuthProvider
    login/page.tsx          tela de login
    onboarding/page.tsx     cadastro público (cliente + primeira solicitação)
    (protected)/            rotas autenticadas — shell (sidebar + topbar) + guarda
      dashboard  loans  requests  my-requests  users
  context/
    AuthContext.tsx         sessão JWT em localStorage, perfil e guarda
    ModalsContext.tsx       modais globais + sinal de refresh de dados
    ToastContext.tsx        pilha de toasts de sucesso/erro
  lib/                      apiClient (fetch + Bearer), api, formatadores, estados
  components/
    layout/Sidebar.tsx  layout/Topbar.tsx
    ui/Modal.tsx  ui/ConfirmDialog.tsx  ui/CurrencyField.tsx  ui/Spinner.tsx
    LoanForm  LoanList  LoanDetails  RuleManager  UserForm  UserManager  ProfileForm
    ConcentrationPanel  StatCard  charts/  dashboards/
  assets/scss/              variáveis da marca + Bootstrap
```

## Marca

Cores extraídas de `condolivre.com.br` em `src/assets/scss/config/_variables.scss`:
índigo `#5C4EE5` (primária), verde-água `#2EE6C8` (destaque), azul `#2F6BFF` (links).

## Integração com a API

Todas as chamadas passam por `lib/apiClient.ts`, que injeta o header
`Authorization: Bearer <token>` e trata o envelope `{ data | message, errors }`. Valores
monetários trafegam em centavos (`amountCents`) e são convertidos para reais apenas na
exibição (`formatBRLFromCents`); todos os números seguem o padrão BR (`9.999,99`).

## Deploy

Publicado junto da API via GitHub Actions — `next build` no runner, `rsync` para a EC2 e
`pm2 reload`. O `NEXT_PUBLIC_API_URL` de produção fica em `.env.production` (embutido no
bundle em build time).
