-- Clear database
do $$
declare
    view_name text;
begin
    for view_name in
        select table_name
        from information_schema.views
        where table_schema = 'public'
        and (table_name like 'group_%' or table_name like 'bill_%')
    loop
        execute format('drop view if exists %I cascade;', view_name);
    end loop;
end $$;

drop table if exists public.bills;
drop table if exists public.groups;

drop function if exists create_group_view(uuid);
drop function if exists create_bill_view(uuid);

-- Create tables
create table
  public.groups (
    id uuid not null default gen_random_uuid (),
    "createdAt" timestamp with time zone not null default now(),
    name text not null,
    members text[] null,
    constraint groups_pkey primary key (id)
  ) tablespace pg_default;

create table
  public.bills (
    id bigint generated by default as identity not null,
    "createdAt" timestamp with time zone not null default now(),
    "groupId" uuid not null,
    amount bigint not null,
    note text null,
    "createdBy" text not null,
    inclusion text[] null,
    exclusion text[] null,
    constraint bills_pkey primary key (id),
    constraint bills_groupid_fkey foreign key ("groupId") references groups (id) on delete cascade
  ) tablespace pg_default;

-- Create policies
create policy "Allow insert for all users"
on "public"."groups"
as PERMISSIVE
for INSERT
to public
with check (
	true
);

create policy "Allow insert for all users"
on "public"."bills"
as PERMISSIVE
for INSERT
to public
with check (
	true
);

-- Create functions
create or replace function create_group_view(group_id uuid)
returns void as $$
declare
    view_name text;
begin
    view_name := format('group_%s', group_id);

    execute format(
        'create view %I as select * from groups where id = %L;',
        view_name,
        group_id
    );
end;
$$ language plpgsql security definer;

create or replace function create_bill_view(group_id uuid)
returns void as $$
declare
    view_name text;
begin
    view_name := format('bill_%s', group_id);

    execute format(
        'create view %I as select * from bills where "groupId" = %L;',
        view_name,
        group_id
    );
end;
$$ language plpgsql security definer;

-- NOTE: After running this script, you need to enable RLS on the tables