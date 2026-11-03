-- Mona's Kitchen
-- Authentication and Row Level Security foundation

-- ============================================================
-- HELPER: CHECK ADMIN ROLE
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'::public.user_role
    );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;


-- ============================================================
-- HELPER: CREATE PROFILE AFTER SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        phone
    )
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            ''
        ),
        new.raw_user_meta_data ->> 'phone'
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
-- PROFILES
-- ============================================================

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile"
    on public.profiles;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
    id = auth.uid()
    or public.is_admin()
);


drop policy if exists "Users can update own profile"
    on public.profiles;

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
    id = auth.uid()
    or public.is_admin()
)
with check (
    id = auth.uid()
    or public.is_admin()
);


drop policy if exists "Admins can manage profiles"
    on public.profiles;

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- MENU ITEMS
-- ============================================================

alter table public.menu_items enable row level security;

drop policy if exists "Admins can manage menu items"
    on public.menu_items;

create policy "Admins can manage menu items"
on public.menu_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- MENU DAYS
-- ============================================================

alter table public.menu_days enable row level security;

create policy "Public can view published menus"
on public.menu_days
for select
to anon, authenticated
using (is_published = true);

create policy "Admins can manage menu days"
on public.menu_days
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- MENU DAY ITEMS
-- ============================================================

alter table public.menu_day_items enable row level security;

create policy "Public can view available published menu items"
on public.menu_day_items
for select
to anon, authenticated
using (
    is_available = true
    and exists (
        select 1
        from public.menu_days
        where menu_days.id = menu_day_items.menu_day_id
          and menu_days.is_published = true
    )
);

create policy "Admins can manage menu day items"
on public.menu_day_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- ORDERS
-- ============================================================

alter table public.orders enable row level security;

create policy "Customers can view own orders"
on public.orders
for select
to authenticated
using (
    customer_id = auth.uid()
    or public.is_admin()
);

create policy "Customers can create own orders"
on public.orders
for insert
to authenticated
with check (
    customer_id = auth.uid()
);

create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- ORDER ITEMS
-- ============================================================

alter table public.order_items enable row level security;

create policy "Customers can view own order items"
on public.order_items
for select
to authenticated
using (
    exists (
        select 1
        from public.orders
        where orders.id = order_items.order_id
          and orders.customer_id = auth.uid()
    )
    or public.is_admin()
);

create policy "Customers can create own order items"
on public.order_items
for insert
to authenticated
with check (
    exists (
        select 1
        from public.orders
        where orders.id = order_items.order_id
          and orders.customer_id = auth.uid()
    )
);

create policy "Admins can manage order items"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());