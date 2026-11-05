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

## Auditoria automática semanal

O projeto possui duas verificações recorrentes, agendadas para segunda-feira às 08:00 no horário de Porto Velho (12:00 UTC):

- **Supabase:** [supabase/weekly_audit.sql](supabase/weekly_audit.sql) verifica a existência da tabela, RLS, política de INSERT, nomes inválidos e grupos de nomes duplicados. Os resultados ficam no schema privado `private`, na tabela `audit_runs`; o histórico das execuções agendadas também fica em `cron.job_run_details`.
- **GitHub Actions:** [.github/workflows/weekly-audit.yml](.github/workflows/weekly-audit.yml) instala as dependências, verifica vulnerabilidades altas/críticas com `npm audit` e valida o build de produção. Também pode ser executada manualmente pela aba Actions.

A auditoria do banco não altera nem exclui registros; apenas identifica e registra possíveis problemas.

## Scripts

- `npm run dev`: desenvolvimento
- `npm run build`: build de produção
- `npm run preview`: visualizar build localmente
