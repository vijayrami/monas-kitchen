select
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
from pg_policies
where tablename = 'menu_items';