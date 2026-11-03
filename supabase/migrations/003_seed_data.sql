-- Mona's Kitchen
-- Initial sample menu items

insert into public.menu_items (
    name,
    description,
    price,
    category,
    is_vegetarian,
    is_active
)
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
    );