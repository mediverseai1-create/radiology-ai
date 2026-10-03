-- RadiologyAI.online core schema. Run in Supabase SQL editor or `supabase db push`.

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free','professional','business')),
  credits_total int not null default 200,
  credits_used int not null default 0,
  credits_reset_at timestamptz not null default (now() + interval '1 month'),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  role text not null default 'radiologist' check (role in ('admin','radiologist','staff')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null, mrn text, dob date, notes text,
  created_at timestamptz not null default now()
);

create table public.studies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  title text not null, modality text, body_part text, clinical_info text,
  file_paths text[] not null default '{}',
  ai_output jsonb, status text not null default 'uploaded',
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  study_id uuid references public.studies(id) on delete set null,
  title text not null default 'Untitled report',
  sections jsonb not null default '{"clinical_indication":"","technique":"","comparison":"","findings":"","impression":"","recommendations":""}',
  qa jsonb, status text not null default 'draft' check (status in ('draft','in_review','approved')),
  approved_by uuid references auth.users(id), approved_at timestamptz,
  created_by uuid references auth.users(id), updated_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create table public.copilot_messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id), role text not null check (role in ('user','assistant')),
  content text not null, created_at timestamptz not null default now()
);

create table public.imaging_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  source_text text not null, extracted jsonb, created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.scribe_notes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  transcript text not null, note text, created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, address text, checkin_token text not null default encode(gen_random_bytes(12),'hex'),
  created_at timestamptz not null default now()
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  staff_name text not null, starts_at timestamptz not null, ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  staff_name text not null, checked_in_at timestamptz not null default now()
);

create table public.audit_log (
  id bigserial primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid, action text not null, detail jsonb, created_at timestamptz not null default now()
);

-- Membership helpers (security definer avoids RLS recursion)
create function public.is_member(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.members where org_id = o and user_id = auth.uid()) $$;

create function public.is_admin(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.members where org_id = o and user_id = auth.uid() and role = 'admin') $$;

-- New user => organization + admin membership
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare o uuid;
begin
  insert into public.organizations (name, created_by)
  values (coalesce(nullif(new.raw_user_meta_data->>'org_name',''), split_part(new.email,'@',1) || '''s workspace'), new.id)
  returning id into o;
  insert into public.members (org_id, user_id, email, role) values (o, new.id, new.email, 'admin');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RLS
alter table public.organizations enable row level security;
alter table public.members enable row level security;
create policy org_read on public.organizations for select using (public.is_member(id));
create policy org_update on public.organizations for update using (public.is_admin(id)) with check (public.is_admin(id));
revoke update on public.organizations from authenticated;
grant update (name) on public.organizations to authenticated;
create policy members_read on public.members for select using (public.is_member(org_id));
create policy members_admin on public.members for all using (public.is_admin(org_id)) with check (public.is_admin(org_id));

do $$ declare t text; begin
  foreach t in array array['patients','studies','reports','copilot_messages','imaging_requests','scribe_notes','locations','shifts','attendance'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (public.is_member(org_id)) with check (public.is_member(org_id))', t||'_org', t);
  end loop;
end $$;
alter table public.audit_log enable row level security;
create policy audit_read on public.audit_log for select using (public.is_member(org_id));
create policy audit_insert on public.audit_log for insert with check (public.is_member(org_id));

-- Reports are never auto-approved: only the approving member may set approved status
create function public.guard_report_approval() returns trigger language plpgsql as $$
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    new.approved_by := auth.uid(); new.approved_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger report_guard before update on public.reports for each row execute function public.guard_report_approval();

-- Credit spend (called by edge function with service role)
create function public.spend_credits(o uuid, n int) returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.organizations set credits_used = 0, credits_reset_at = now() + interval '1 month' where id = o and credits_reset_at < now();
  update public.organizations set credits_used = credits_used + n where id = o and credits_used + n <= credits_total;
  return found;
end $$;
revoke all on function public.spend_credits from public, anon, authenticated;

-- Public check-in (QR / link) for staff, validated by location token
create function public.staff_check_in(token text, staff text) returns text language plpgsql security definer set search_path = public as $$
declare l public.locations;
begin
  select * into l from public.locations where checkin_token = token;
  if not found then raise exception 'Invalid check-in link'; end if;
  insert into public.attendance (org_id, location_id, staff_name) values (l.org_id, l.id, staff);
  return l.name;
end $$;
grant execute on function public.staff_check_in to anon, authenticated;

-- Storage for studies / referrals: folder = org id
insert into storage.buckets (id, name, public) values ('studies','studies', false) on conflict do nothing;
create policy studies_rw on storage.objects for all
  using (bucket_id = 'studies' and public.is_member(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'studies' and public.is_member(((storage.foldername(name))[1])::uuid));
