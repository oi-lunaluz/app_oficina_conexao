-- Oficina Conexão: tabela mínima para o formulário de teste.
create table if not exists public.nomes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.nomes enable row level security;

grant insert on table public.nomes to anon, authenticated;

drop policy if exists "Permitir cadastro de nomes no teste" on public.nomes;
create policy "Permitir cadastro de nomes no teste"
on public.nomes
for insert
to anon, authenticated
with check (char_length(trim(nome)) between 1 and 120);
