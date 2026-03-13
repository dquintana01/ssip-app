-- ══════════════════════════════════════════════════════════
-- SSIP — Script de creación de tablas en Supabase
-- Ejecutar en: Supabase → SQL Editor → New query
-- ══════════════════════════════════════════════════════════

-- FO-10 Issues de Obra (tabla principal con lógica RES-01)
create table if not exists issues (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  semana text,
  disciplina text,
  sistema text,
  subsistema text,
  ubicacion text,
  descripcion text,
  origen text,
  criticidad text,
  accion text,
  responsable text,
  fecha_compromiso date,
  estado text default 'abierto'
);

-- FO-01 Asistencia
create table if not exists fo01_asistencia (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  fecha date, empresa text, nombre text, legajo text, rol text, presencia text
);

-- FO-02 Parte Diario
create table if not exists fo02_parte_diario (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  fecha date, frente text, disciplina text, personal integer,
  actividades text, avance numeric, equipos text
);

-- FO-03 Planificación Semanal
create table if not exists fo03_planificacion (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  semana_num integer, fecha_inicio date, tarea text,
  responsable text, fase text, dia text
);

-- FO-04 Informe Semanal
create table if not exists fo04_informe (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  semana_num integer, fecha_emision date,
  avance_plan numeric, avance_real numeric,
  resumen text, desvios text
);

-- FO-05 Materiales
create table if not exists fo05_materiales (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  codigo text, descripcion text, cantidad numeric, unidad text,
  proveedor text, sistema text, fecha_estimada date, fecha_real date, estado text
);

-- FO-06 Documentos de Ingeniería
create table if not exists fo06_documentos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  codigo text, descripcion text, disciplina text, revision text,
  fecha_plan date, fecha_real date, critico text
);

-- FO-07 Cronograma
create table if not exists fo07_cronograma (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  codigo text, disciplina text, descripcion text, sistema text,
  avance_plan numeric, avance_real numeric,
  fecha_fin_plan date, fecha_fin_forecast date, alerta text
);

-- FO-08 Minuta
create table if not exists fo08_minuta (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  fecha date, lugar text, participantes text,
  decision text, responsable text, fecha_compromiso date
);

-- FO-09 Look Ahead
create table if not exists fo09_lookahead (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  semana_ref integer, horizonte integer, actividad text,
  semana_ejec integer, responsable text, restriccion text, estado_rest text
);

-- ══════════════════════════════════════════════════════════
-- Permisos: habilitar acceso público (anon) para leer y escribir
-- ══════════════════════════════════════════════════════════
alter table issues enable row level security;
create policy "acceso_publico_issues" on issues for all using (true) with check (true);

alter table fo01_asistencia enable row level security;
create policy "acceso_publico_fo01" on fo01_asistencia for all using (true) with check (true);

alter table fo02_parte_diario enable row level security;
create policy "acceso_publico_fo02" on fo02_parte_diario for all using (true) with check (true);

alter table fo03_planificacion enable row level security;
create policy "acceso_publico_fo03" on fo03_planificacion for all using (true) with check (true);

alter table fo04_informe enable row level security;
create policy "acceso_publico_fo04" on fo04_informe for all using (true) with check (true);

alter table fo05_materiales enable row level security;
create policy "acceso_publico_fo05" on fo05_materiales for all using (true) with check (true);

alter table fo06_documentos enable row level security;
create policy "acceso_publico_fo06" on fo06_documentos for all using (true) with check (true);

alter table fo07_cronograma enable row level security;
create policy "acceso_publico_fo07" on fo07_cronograma for all using (true) with check (true);

alter table fo08_minuta enable row level security;
create policy "acceso_publico_fo08" on fo08_minuta for all using (true) with check (true);

alter table fo09_lookahead enable row level security;
create policy "acceso_publico_fo09" on fo09_lookahead for all using (true) with check (true);
