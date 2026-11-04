
-- Daily meal package configuration for Mona's Kitchen.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();

    RETURN NEW;
END;
$$;

CREATE TYPE public.meal_component_type AS ENUM (
    'dal',
    'rice',
    'roti',
    'sabji',
    'sweet'
);

CREATE TABLE public.daily_meal_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    menu_day_id UUID NOT NULL
        REFERENCES public.menu_days(id) ON DELETE CASCADE,

    meal_type public.meal_type NOT NULL,

    regular_price NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    special_price NUMERIC(10, 2) NOT NULL DEFAULT 170.00,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT daily_meal_packages_lunch_dinner_only
        CHECK (meal_type IN ('lunch', 'dinner')),

    CONSTRAINT daily_meal_packages_fixed_prices
        CHECK (
            regular_price = 150.00
            AND special_price = 170.00
        ),

    CONSTRAINT daily_meal_packages_unique_meal
        UNIQUE (menu_day_id, meal_type)
);

CREATE TABLE public.daily_meal_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    package_id UUID NOT NULL
        REFERENCES public.daily_meal_packages(id) ON DELETE CASCADE,

    component_type public.meal_component_type NOT NULL,

    item_name VARCHAR(100) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT daily_meal_components_unique_type
        UNIQUE (package_id, component_type),

    CONSTRAINT daily_meal_components_name_not_empty
        CHECK (LENGTH(TRIM(item_name)) >= 2)
);

CREATE INDEX idx_daily_meal_packages_menu_day
    ON public.daily_meal_packages(menu_day_id);

CREATE INDEX idx_daily_meal_components_package
    ON public.daily_meal_components(package_id);

-- Updated-at triggers.
CREATE TRIGGER trg_daily_meal_packages_updated_at
BEFORE UPDATE ON public.daily_meal_packages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_daily_meal_components_updated_at
BEFORE UPDATE ON public.daily_meal_components
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security.
ALTER TABLE public.daily_meal_packages
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.daily_meal_components
    ENABLE ROW LEVEL SECURITY;

-- Customers can read packages belonging to published menus.
CREATE POLICY "Public can view published meal packages"
ON public.daily_meal_packages
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.menu_days
        WHERE menu_days.id = daily_meal_packages.menu_day_id
          AND menu_days.is_published = TRUE
    )
);

-- Customers can read components belonging to published menus.
CREATE POLICY "Public can view published meal components"
ON public.daily_meal_components
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.daily_meal_packages AS packages
        INNER JOIN public.menu_days
            ON menu_days.id = packages.menu_day_id
        WHERE packages.id = daily_meal_components.package_id
          AND menu_days.is_published = TRUE
    )
);

-- Only admins can manage meal packages.
CREATE POLICY "Admins can manage daily meal packages"
ON public.daily_meal_packages
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can manage meal components.
CREATE POLICY "Admins can manage daily meal components"
ON public.daily_meal_components
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Table permissions.
GRANT SELECT ON public.daily_meal_packages
    TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.daily_meal_packages
    TO authenticated;

GRANT SELECT ON public.daily_meal_components
    TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.daily_meal_components
    TO authenticated;
