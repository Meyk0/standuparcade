-- Standup Slots Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

create table teams (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  skin        text default 'arcade',
  created_at  timestamptz default now()
);

create table members (
  id          uuid primary key default uuid_generate_v4(),
  team_id     uuid references teams(id) on delete cascade,
  name        text not null,
  tagline     text,
  is_active   boolean default true,
  ooo_date    date,
  created_at  timestamptz default now()
);

create table session_state (
  id              uuid primary key default uuid_generate_v4(),
  team_id         uuid references teams(id) on delete cascade unique,
  status          text default 'idle',
  spin_pool       uuid[] default '{}',
  order_picked    uuid[] default '{}',
  current_winner  uuid,
  updated_at      timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_teams_slug on teams(slug);
create index idx_members_team_id on members(team_id);
create index idx_session_state_team_id on session_state(team_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Teams: anyone can read, anyone can insert
alter table teams enable row level security;
create policy "public read" on teams for select using (true);
create policy "public insert" on teams for insert with check (true);

-- Members: scoped to valid team_id
alter table members enable row level security;
create policy "team read" on members for select using (
  exists (select 1 from teams where teams.id = members.team_id)
);
create policy "team insert" on members for insert with check (
  exists (select 1 from teams where teams.id = members.team_id)
);
create policy "team update" on members for update using (
  exists (select 1 from teams where teams.id = members.team_id)
);
create policy "team delete" on members for delete using (
  exists (select 1 from teams where teams.id = members.team_id)
);

-- Session state: scoped to valid team_id
alter table session_state enable row level security;
create policy "team read" on session_state for select using (
  exists (select 1 from teams where teams.id = session_state.team_id)
);
create policy "team insert" on session_state for insert with check (
  exists (select 1 from teams where teams.id = session_state.team_id)
);
create policy "team update" on session_state for update using (
  exists (select 1 from teams where teams.id = session_state.team_id)
);

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for session_state and members
alter publication supabase_realtime add table session_state;
alter publication supabase_realtime add table members;

-- ============================================
-- SEED DATA (optional — "connectly-eng" test team)
-- ============================================

insert into teams (id, slug, name, skin) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'connectly-eng', 'Connectly Engineering', 'arcade');

insert into members (team_id, name, tagline) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alice', 'READY TO ROLL'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bob', 'BEAST MODE'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Charlie', 'FULL SEND'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Diana', 'GAME ON'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Eve', 'NO MERCY');

insert into session_state (team_id, status, spin_pool, order_picked) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'idle', '{}', '{}');
