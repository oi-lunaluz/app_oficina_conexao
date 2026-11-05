-- Auditoria semanal da aplicação Oficina Conexão.
-- Esta rotina é executada pelo pg_cron no projeto Supabase.

create extension if not exists pg_cron with schema pg_catalog;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.audit_runs (
  id bigint generated always as identity primary key,
  checked_at timestamptz not null default now(),
  status text not null check (status in ('ok', 'warning', 'error')),
  checks jsonb not null,
  issues jsonb not null
);
revoke all on table private.audit_runs from public, anon, authenticated;

create or replace function private.run_weekly_audit()
returns jsonb
language plpgsql
set search_path = pg_catalog, public, private
as $$
declare
  v_table_oid oid;
  v_rls_enabled boolean := false;
  v_insert_policy boolean := false;
  v_invalid_names bigint := 0;
  v_duplicate_groups bigint := 0;
  v_checks jsonb;
  v_issues jsonb := '[]'::jsonb;
  v_status text := 'ok';
  v_result jsonb;
begin
  v_table_oid := to_regclass('public.nomes');

  if v_table_oid is null then
    v_issues := v_issues || jsonb_build_array(jsonb_build_object(
      'severity', 'critical', 'code', 'TABLE_MISSING',
      'message', 'A tabela public.nomes não foi encontrada.'
    ));
    v_status := 'error';
  else
    select c.relrowsecurity into v_rls_enabled
      from pg_class c where c.oid = v_table_oid;

    select exists (
      select 1
        from pg_policy p
        join pg_roles r on r.oid = any(p.polroles)
       where p.polrelid = v_table_oid
         and p.polcmd in ('a', '*')
         and r.rolname = 'anon'
         and p.polwithcheck is not null
    ) into v_insert_policy;

    select count(*) into v_invalid_names
      from public.nomes
     where nome is null or char_length(btrim(nome)) not between 1 and 120;

    select count(*) into v_duplicate_groups
      from (
        select lower(btrim(nome))
          from public.nomes
         where nome is not null and btrim(nome) <> ''
         group by lower(btrim(nome))
        having count(*) > 1
      ) duplicates;

    if not v_rls_enabled then
      v_issues := v_issues || jsonb_build_array(jsonb_build_object(
        'severity', 'critical', 'code', 'RLS_DISABLED',
        'message', 'A proteção RLS está desativada na tabela public.nomes.'
      ));
      v_status := 'error';
    end if;

    if not v_insert_policy then
      v_issues := v_issues || jsonb_build_array(jsonb_build_object(
        'severity', 'warning', 'code', 'INSERT_POLICY_MISSING',
        'message', 'Não foi encontrada uma política de INSERT para anon na tabela public.nomes.'
      ));
      if v_status = 'ok' then v_status := 'warning'; end if;
    end if;

    if v_invalid_names > 0 then
      v_issues := v_issues || jsonb_build_array(jsonb_build_object(
        'severity', 'critical', 'code', 'INVALID_NAMES',
        'count', v_invalid_names,
        'message', 'Existem registros com nome vazio ou fora do limite de 1 a 120 caracteres.'
      ));
      v_status := 'error';
    end if;

    if v_duplicate_groups > 0 then
      v_issues := v_issues || jsonb_build_array(jsonb_build_object(
        'severity', 'warning', 'code', 'DUPLICATE_NAMES',
        'count', v_duplicate_groups,
        'message', 'Foram encontrados grupos de nomes repetidos (ignorando maiúsculas e espaços).'
      ));
      if v_status = 'ok' then v_status := 'warning'; end if;
    end if;
  end if;

  v_checks := jsonb_build_object(
    'table_exists', v_table_oid is not null,
    'rls_enabled', v_rls_enabled,
    'anon_insert_policy', v_insert_policy,
    'invalid_name_rows', v_invalid_names,
    'duplicate_name_groups', v_duplicate_groups
  );

  insert into private.audit_runs(status, checks, issues)
  values (v_status, v_checks, v_issues);

  v_result := jsonb_build_object(
    'status', v_status, 'checked_at', now(),
    'checks', v_checks, 'issues', v_issues
  );
  raise log 'Oficina Conexão weekly audit: %', v_result;
  return v_result;
end;
$$;

revoke all on function private.run_weekly_audit() from public, anon, authenticated;

select cron.schedule(
  'auditoria-semanal-oficina-conexao',
  '0 12 * * 1',
  'select private.run_weekly_audit();'
);
