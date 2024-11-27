-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Lieferanten Tabelle
create table lieferanten (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  ansprechpartner text not null,
  nummer text not null,
  email text not null,
  aktiv boolean default true not null
);

-- Wareneingänge Tabelle
create table wareneingaenge (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lieferant_id uuid references lieferanten(id) not null,
  eingangsdatum date default current_date not null,
  erfassungsdatum timestamp with time zone default timezone('utc'::text, now()) not null,
  chargennummer text,
  notizen text,
  lieferschein_urls text[] default array[]::text[],
  waren_urls text[] default array[]::text[],
  status text default 'erfasst' check (status in ('erfasst', 'geprüft', 'abgeschlossen', 'storniert'))
);

-- Indizes für bessere Performanz
create index idx_wareneingaenge_lieferant on wareneingaenge(lieferant_id);
create index idx_wareneingaenge_eingangsdatum on wareneingaenge(eingangsdatum);
create index idx_wareneingaenge_status on wareneingaenge(status);
create index idx_lieferanten_name on lieferanten(name);
create index idx_lieferanten_nummer on lieferanten(nummer);

-- Updated_at Trigger Funktion
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger für automatische updated_at Aktualisierung
create trigger update_lieferanten_updated_at
  before update on lieferanten
  for each row
  execute function update_updated_at_column();

create trigger update_wareneingaenge_updated_at
  before update on wareneingaenge
  for each row
  execute function update_updated_at_column();

-- Row Level Security
alter table lieferanten enable row level security;
alter table wareneingaenge enable row level security;

-- Policies
create policy "Öffentlicher Lesezugriff auf aktive Lieferanten"
on lieferanten for select
to anon
using (aktiv = true);

create policy "Öffentlicher Lesezugriff auf Wareneingänge"
on wareneingaenge for select
to anon
using (true);

create policy "Authentifizierter Schreibzugriff auf Lieferanten"
on lieferanten for insert
to authenticated
with check (true);

create policy "Authentifizierter Schreibzugriff auf Wareneingänge"
on wareneingaenge for insert
to authenticated
with check (true);

-- Beispieldaten für Lieferanten
insert into lieferanten (name, ansprechpartner, nummer, email)
values 
  ('Bio-Hof Müller', 'Hans Müller', 'L1001', 'mueller@bio-hof.de'),
  ('Frischgemüse Schmidt', 'Anna Schmidt', 'L1002', 'schmidt@frischgemuese.de'),
  ('Obstgarten Weber', 'Karl Weber', 'L1003', 'weber@obstgarten.de');