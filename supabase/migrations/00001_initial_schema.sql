-- Items table
create table items (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  category        text not null check (category in ('vestiti', 'tech', 'giochi')),
  title           text not null,
  brand           text,
  size            text,

  -- Measurements in cm — clothing
  measure_chest      numeric,
  measure_length     numeric,
  measure_waist      numeric,
  measure_shoulders  numeric,
  measure_sleeve     numeric,
  -- Measurements in cm — tech / board games
  measure_width      numeric,
  measure_height     numeric,
  measure_depth      numeric,

  -- Condition and pricing
  condition       text not null,
  defects         text,
  price_min       numeric,
  price_listed    numeric,
  price_final     numeric,
  status          text not null default 'bozza'
                  check (status in ('bozza', 'pronto', 'pubblicato', 'venduto')),

  -- Platforms and links
  platforms       text[] not null default '{}',
  link_vinted     text,
  link_subito     text,

  -- Dates
  published_at    timestamptz,
  sold_at         timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Photos table
create table photos (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid not null references items(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  storage_path    text not null,
  position        smallint not null default 0,
  photo_type      text not null default 'real'
                  check (photo_type in ('real', 'generated')),
  created_at      timestamptz not null default now()
);

-- Indexes
create index items_user_id_idx on items(user_id);
create index items_status_idx on items(status);
create index photos_item_id_idx on photos(item_id);

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_updated_at
  before update on items
  for each row execute function update_updated_at();

-- Row Level Security
alter table items enable row level security;
alter table photos enable row level security;

create policy "items_owner" on items
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "photos_owner" on photos
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Storage bucket: item-photos (private)
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', false)
on conflict (id) do nothing;

create policy "photos_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_select" on storage.objects
  for select
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_delete" on storage.objects
  for delete
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
