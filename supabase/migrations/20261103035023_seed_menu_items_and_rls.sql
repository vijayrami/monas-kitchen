-- Mona's Kitchen
-- Sync initial menu data to environments where migration 003
-- was already recorded before the seed data was added.

insert into public.menu_items (
    name,
    description,
    price,
    category,
    is_vegetarian,
    is_active
)
select
    seed.name,
    seed.description,
    seed.price,
    seed.category::public.meal_type,
    seed.is_vegetarian,
    seed.is_active
from (
    values
        (
            'Idli',
            'Soft and steamed South Indian rice cakes.',
            40.00,
            'breakfast',
            true,
            true
        ),
        (
            'Dosa',
            'Crispy South Indian rice and lentil crepe.',
            60.00,
            'breakfast',
            true,
            true
        ),
        (
            'Paratha',
            'Freshly prepared Indian flatbread.',
            50.00,
            'breakfast',
            true,
            true
        ),
        (
            'Dal',
            'Homestyle lentil preparation.',
            80.00,
            'lunch',
            true,
            true
        ),
        (
            'Rice',
            'Steamed basmati rice.',
            50.00,
            'lunch',
            true,
            true
        ),
        (
            'Roti',
            'Freshly prepared whole-wheat Indian flatbread.',
            20.00,
            'lunch',
            true,
            true
        ),
        (
            'Sabji',
            'Fresh seasonal Indian vegetable preparation.',
            80.00,
            'lunch',
            true,
            true
        )
) as seed(
    name,
    description,
    price,
    category,
    is_vegetarian,
    is_active
)
where not exists (
    select 1
    from public.menu_items existing
    where existing.name = seed.name
      and existing.category = seed.category::public.meal_type
);

-- Allow unauthenticated customers to view active menu items.
create policy "Public can view active menu items"
on public.menu_items
for select
to anon, authenticated
using (is_active = true);