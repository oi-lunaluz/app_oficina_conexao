# Oficina Conexão

Aplicação web de teste com React, Vite e Supabase.

## Tecnologias

- React 19.3.1
- Vite 8.3.5
- Supabase JS 2.119.0
- CSS responsivo com identidade visual em tons pastéis de rosa

## Rodar localmente

Requer Node.js compatível com Vite 8.

```bash
npm install
cp .env.example .env
npm run dev
```

Preencha `.env` com a URL do projeto Supabase e uma chave **publishable**:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Sem essas variáveis, a interface abre em modo demonstração.

## Banco de dados

No SQL Editor do Supabase, execute o conteúdo de [supabase/schema.sql](supabase/schema.sql). Isso cria a tabela `public.nomes` e permite inserções anônimas para este protótipo.

> A política de inserção anônima é adequada somente para um teste controlado. Antes de uso real, adicione autenticação, limites contra abuso e políticas de acesso apropriadas.

## Scripts

- `npm run dev`: desenvolvimento
- `npm run build`: build de produção
- `npm run preview`: visualizar build localmente
