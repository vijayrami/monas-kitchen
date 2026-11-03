-- Admin-only CRUD access for menu_items.
-- Public users can continue to read active menu items
-- through the existing public SELECT policy.

drop policy if exists "Admins can insert menu items"
on public.menu_items;

drop policy if exists "Admins can update menu items"
on public.menu_items;

drop policy if exists "Admins can delete menu items"
on public.menu_items;

create policy "Admins can insert menu items"
on public.menu_items
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update menu items"
on public.menu_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete menu items"
on public.menu_items
for delete
to authenticated
using (public.is_admin());