-- Mona's Kitchen
-- Create profile automatically when a user signs up

-- ============================================================
-- ADMIN CHECK
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
    );
$$;

-- ============================================================
-- CREATE PROFILE AFTER AUTH USER CREATION
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        phone,
        flat_number,
        role
    )
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', ''),
        new.raw_user_meta_data ->> 'phone',
        new.raw_user_meta_data ->> 'flat_number',
        'customer'
    );

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- ============================================================
-- PROTECT USER ROLE
-- ============================================================

create or replace function public.prevent_customer_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.role is distinct from old.role
       and not public.is_admin() then
        raise exception 'Only an administrator can change user roles';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;

create trigger protect_profile_role
    before update on public.profiles
    for each row
    execute function public.prevent_customer_role_escalation();