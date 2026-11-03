-- Mona's Kitchen
-- Initial database schema

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.user_role as enum (
    'customer',
    'admin'
);

create type public.meal_type as enum (
    'breakfast',
    'lunch',
    'dinner'
);

create type public.order_status as enum (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'completed',
    'cancelled'
);

create type public.delivery_type as enum (
    'pickup',
    'delivery'
);

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    phone text,
    role public.user_role not null default 'customer',
    flat_number text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- MENU ITEMS
-- ============================================================

create table public.menu_items (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price numeric(10, 2) not null default 0,
    category public.meal_type not null,
    is_vegetarian boolean not null default true,
    is_active boolean not null default true,
    image_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint menu_items_price_check
        check (price >= 0)
);

-- ============================================================
-- MENU DAYS
-- ============================================================

create table public.menu_days (
    id uuid primary key default gen_random_uuid(),
    menu_date date not null unique,
    is_published boolean not null default false,
    breakfast_note text,
    lunch_note text,
    dinner_note text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- MENU DAY ITEMS
-- ============================================================

create table public.menu_day_items (
    id uuid primary key default gen_random_uuid(),
    menu_day_id uuid not null
        references public.menu_days(id) on delete cascade,
    menu_item_id uuid not null
        references public.menu_items(id) on delete restrict,
    meal_type public.meal_type not null,
    display_order integer not null default 0,
    is_available boolean not null default true,
    created_at timestamptz not null default now(),

    constraint menu_day_items_display_order_check
        check (display_order >= 0),

    constraint menu_day_items_unique_item
        unique (menu_day_id, menu_item_id, meal_type)
);

-- ============================================================
-- ORDERS
-- ============================================================

create table public.orders (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null
        references public.profiles(id) on delete restrict,
    order_date date not null,
    meal_type public.meal_type not null,
    status public.order_status not null default 'pending',
    total_amount numeric(10, 2) not null default 0,
    delivery_type public.delivery_type not null default 'pickup',
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint orders_total_amount_check
        check (total_amount >= 0)
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================

create table public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null
        references public.orders(id) on delete cascade,
    menu_item_id uuid not null
        references public.menu_items(id) on delete restrict,
    item_name text not null,
    quantity integer not null,
    unit_price numeric(10, 2) not null,
    subtotal numeric(10, 2) not null,
    created_at timestamptz not null default now(),

    constraint order_items_quantity_check
        check (quantity > 0),

    constraint order_items_unit_price_check
        check (unit_price >= 0),

    constraint order_items_subtotal_check
        check (subtotal >= 0)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index menu_items_category_active_idx
    on public.menu_items (category, is_active);

create index menu_days_published_date_idx
    on public.menu_days (is_published, menu_date);

create index menu_day_items_menu_day_idx
    on public.menu_day_items (menu_day_id);

create index menu_day_items_menu_item_idx
    on public.menu_day_items (menu_item_id);

create index orders_customer_date_idx
    on public.orders (customer_id, order_date);

create index orders_date_status_idx
    on public.orders (order_date, status);

create index orders_customer_status_idx
    on public.orders (customer_id, status);

create index order_items_order_idx
    on public.order_items (order_id);

create index order_items_menu_item_idx
    on public.order_items (menu_item_id);
