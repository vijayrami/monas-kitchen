
-- Customer ordering support.
-- Breakfast uses individual menu items.
-- Lunch and dinner use scheduled fixed-price packages.

-- 1. Extend order_items for package selections.

ALTER TABLE public.order_items
    ALTER COLUMN menu_item_id DROP NOT NULL;

ALTER TABLE public.order_items
    ADD COLUMN package_id UUID
        REFERENCES public.daily_meal_packages(id) ON DELETE RESTRICT,
    ADD COLUMN package_option VARCHAR(10);

ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_valid_selection
    CHECK (
        (
            menu_item_id IS NOT NULL
            AND package_id IS NULL
            AND package_option IS NULL
        )
        OR
        (
            menu_item_id IS NULL
            AND package_id IS NOT NULL
            AND package_option IN ('regular', 'special')
        )
    );

ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_package_option_valid
    CHECK (
        package_option IS NULL
        OR package_option IN ('regular', 'special')
    );

CREATE INDEX idx_order_items_package_id
    ON public.order_items(package_id);


-- 2. Transactional customer checkout RPC.

CREATE OR REPLACE FUNCTION public.place_customer_orders(
    p_order_date DATE,
    p_breakfast_items JSONB DEFAULT '[]'::JSONB,
    p_lunch JSONB DEFAULT NULL,
    p_dinner JSONB DEFAULT NULL,
    p_delivery_type public.delivery_type DEFAULT 'pickup',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_customer_id UUID;
    v_order_id UUID;
    v_order_ids JSONB := '[]'::JSONB;
    v_breakfast_total NUMERIC(10, 2) := 0;
    v_meal_total NUMERIC(10, 2) := 0;
    v_line_total NUMERIC(10, 2);
    v_item RECORD;
    v_menu_item RECORD;
    v_package RECORD;
    v_meal_type public.meal_type;
    v_option TEXT;
    v_quantity INTEGER;
    v_unit_price NUMERIC(10, 2);
    v_item_name TEXT;
    v_has_orders BOOLEAN := FALSE;
BEGIN
    -- 3. Verify authenticated customer.

    v_customer_id := auth.uid();

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = v_customer_id
          AND role = 'customer'
    ) THEN
        RAISE EXCEPTION 'Customer account required.';
    END IF;

    -- 4. Validate order date and same-day cutoff.

    IF p_order_date < (
        NOW() AT TIME ZONE 'Asia/Kolkata'
    )::DATE THEN
        RAISE EXCEPTION 'Past dates cannot be ordered.';
    END IF;

    IF p_order_date = (
        NOW() AT TIME ZONE 'Asia/Kolkata'
    )::DATE
    AND (
        NOW() AT TIME ZONE 'Asia/Kolkata'
    )::TIME >= TIME '10:00' THEN
        RAISE EXCEPTION
            'Online ordering for today is closed after 10:00 AM.';
    END IF;

    IF p_breakfast_items IS NULL
       OR jsonb_typeof(p_breakfast_items) <> 'array' THEN
        RAISE EXCEPTION 'Invalid breakfast selections.';
    END IF;

    IF jsonb_array_length(p_breakfast_items) > 0 THEN
        v_has_orders := TRUE;
    END IF;

    IF p_lunch IS NOT NULL OR p_dinner IS NOT NULL THEN
        v_has_orders := TRUE;
    END IF;

    IF NOT v_has_orders THEN
        RAISE EXCEPTION 'Please select at least one meal.';
    END IF;

    -- 5. Validate published menu for lunch/dinner.

    IF p_lunch IS NOT NULL OR p_dinner IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM public.menu_days
            WHERE menu_date = p_order_date
              AND is_published = TRUE
        ) THEN
            RAISE EXCEPTION
                'No published menu is available for this date.';
        END IF;
    END IF;

    -- 6. Process breakfast selections.

    IF jsonb_array_length(p_breakfast_items) > 0 THEN
        v_breakfast_total := 0;

        FOR v_item IN
            SELECT *
            FROM jsonb_to_recordset(p_breakfast_items)
                AS items(
                    "menuItemId" UUID,
                    quantity INTEGER
                )
        LOOP
            IF v_item.quantity IS NULL
               OR v_item.quantity < 1
               OR v_item.quantity > 20 THEN
                RAISE EXCEPTION 'Invalid breakfast quantity.';
            END IF;

            SELECT id, name, price, category, is_active
            INTO v_menu_item
            FROM public.menu_items
            WHERE id = v_item."menuItemId"
              AND category = 'breakfast'
              AND is_active = TRUE;

            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'One or more breakfast items are unavailable.';
            END IF;

            v_unit_price := v_menu_item.price;
            v_line_total := v_unit_price * v_item.quantity;

            v_breakfast_total :=
                v_breakfast_total + v_line_total;
        END LOOP;

        INSERT INTO public.orders (
            customer_id,
            order_date,
            meal_type,
            status,
            total_amount,
            delivery_type,
            notes
        )
        VALUES (
            v_customer_id,
            p_order_date,
            'breakfast',
            'pending',
            v_breakfast_total,
            p_delivery_type,
            NULLIF(TRIM(p_notes), '')
        )
        RETURNING id INTO v_order_id;

        FOR v_item IN
            SELECT *
            FROM jsonb_to_recordset(p_breakfast_items)
                AS items(
                    "menuItemId" UUID,
                    quantity INTEGER
                )
        LOOP
            SELECT id, name, price
            INTO v_menu_item
            FROM public.menu_items
            WHERE id = v_item."menuItemId"
              AND category = 'breakfast'
              AND is_active = TRUE;

            v_unit_price := v_menu_item.price;
            v_line_total := v_unit_price * v_item.quantity;

            INSERT INTO public.order_items (
                order_id,
                menu_item_id,
                item_name,
                quantity,
                unit_price,
                subtotal
            )
            VALUES (
                v_order_id,
                v_menu_item.id,
                v_menu_item.name,
                v_item.quantity,
                v_unit_price,
                v_line_total
            );
        END LOOP;

        v_order_ids := v_order_ids || jsonb_build_array(
            jsonb_build_object(
                'orderId', v_order_id,
                'mealType', 'breakfast',
                'total', v_breakfast_total
            )
        );
    END IF;

    -- 7. Process lunch and dinner packages.

    FOREACH v_meal_type IN ARRAY
        ARRAY['lunch', 'dinner']::public.meal_type[]
    LOOP
        IF v_meal_type = 'lunch' AND p_lunch IS NULL THEN
            CONTINUE;
        END IF;

        IF v_meal_type = 'dinner' AND p_dinner IS NULL THEN
            CONTINUE;
        END IF;

        IF v_meal_type = 'lunch' THEN
            v_option := p_lunch ->> 'option';
            v_quantity := (p_lunch ->> 'quantity')::INTEGER;
        ELSE
            v_option := p_dinner ->> 'option';
            v_quantity := (p_dinner ->> 'quantity')::INTEGER;
        END IF;

        IF v_option NOT IN ('regular', 'special') THEN
            RAISE EXCEPTION 'Invalid % package selection.',
                v_meal_type;
        END IF;

        IF v_quantity IS NULL
           OR v_quantity < 1
           OR v_quantity > 20 THEN
            RAISE EXCEPTION 'Invalid % quantity.', v_meal_type;
        END IF;

        SELECT
            packages.id,
            packages.meal_type,
            packages.regular_price,
            packages.special_price,
            packages.menu_day_id
        INTO v_package
        FROM public.daily_meal_packages AS packages
        INNER JOIN public.menu_days AS days
            ON days.id = packages.menu_day_id
        WHERE days.menu_date = p_order_date
          AND days.is_published = TRUE
          AND packages.meal_type = v_meal_type;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'The % package is unavailable for this date.',
                v_meal_type;
        END IF;

        -- Require all five daily components.

        IF (
            SELECT COUNT(*)
            FROM public.daily_meal_components
            WHERE package_id = v_package.id
              AND component_type IN (
                  'dal', 'rice', 'roti', 'sabji', 'sweet'
              )
              AND LENGTH(TRIM(item_name)) >= 2
        ) <> 5 THEN
            RAISE EXCEPTION
                'The % menu is incomplete.', v_meal_type;
        END IF;

        IF v_option = 'regular' THEN
            v_unit_price := v_package.regular_price;
        ELSE
            v_unit_price := v_package.special_price;
        END IF;

        v_line_total := v_unit_price * v_quantity;
        v_meal_total := v_line_total;

        SELECT STRING_AGG(
            component_type::TEXT || ': ' || item_name,
            ', '
            ORDER BY component_type
        )
        INTO v_item_name
        FROM public.daily_meal_components
        WHERE package_id = v_package.id
          AND (
              v_option = 'special'
              OR component_type <> 'sweet'
          );

        v_item_name :=
            INITCAP(v_meal_type::TEXT) || ' ' ||
            INITCAP(v_option) || ' - ' || v_item_name;

        INSERT INTO public.orders (
            customer_id,
            order_date,
            meal_type,
            status,
            total_amount,
            delivery_type,
            notes
        )
        VALUES (
            v_customer_id,
            p_order_date,
            v_meal_type,
            'pending',
            v_meal_total,
            p_delivery_type,
            NULLIF(TRIM(p_notes), '')
        )
        RETURNING id INTO v_order_id;

        INSERT INTO public.order_items (
            order_id,
            package_id,
            package_option,
            item_name,
            quantity,
            unit_price,
            subtotal
        )
        VALUES (
            v_order_id,
            v_package.id,
            v_option,
            v_item_name,
            v_quantity,
            v_unit_price,
            v_line_total
        );

        v_order_ids := v_order_ids || jsonb_build_array(
            jsonb_build_object(
                'orderId', v_order_id,
                'mealType', v_meal_type,
                'packageOption', v_option,
                'quantity', v_quantity,
                'total', v_meal_total
            )
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'orders', v_order_ids
    );
END;
$$;

-- Only authenticated users can call the checkout RPC.

REVOKE ALL ON FUNCTION public.place_customer_orders(
    DATE,
    JSONB,
    JSONB,
    JSONB,
    public.delivery_type,
    TEXT
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.place_customer_orders(
    DATE,
    JSONB,
    JSONB,
    JSONB,
    public.delivery_type,
    TEXT
) TO authenticated;
