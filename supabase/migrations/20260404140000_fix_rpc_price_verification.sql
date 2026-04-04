-- Harden create_order_with_items:
-- - do not trust client-side price_at_purchase
-- - verify each product exists and is in stock
-- - verify provided p_total against server-calculated total

create or replace function public.create_order_with_items(
  p_user_id uuid,
  p_items jsonb,
  p_total numeric,
  p_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_elem jsonb;
  v_order_user_id uuid;
  v_shipping_fee numeric;
  v_delivery_mode text;
  v_address text;
  v_notes text;
  v_sum numeric := 0;
  v_db_price numeric;
  v_qty int;
  v_product_id uuid;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'p_items must be a non-empty json array';
  end if;

  if p_total is null or p_total < 0 then
    raise exception 'invalid p_total';
  end if;

  if auth.uid() is not null then
    v_order_user_id := auth.uid();
    if p_user_id is not null and p_user_id <> auth.uid() then
      raise exception 'forbidden';
    end if;
  else
    v_order_user_id := null;
    if p_user_id is not null then
      raise exception 'guest cannot set user_id';
    end if;
  end if;

  v_shipping_fee := coalesce((p_meta->>'shipping_fee')::numeric, 0);
  v_delivery_mode := nullif(trim(coalesce(p_meta->>'delivery_mode', '')), '');
  if v_delivery_mode is null then
    v_delivery_mode := 'courier';
  end if;
  if v_delivery_mode not in ('courier', 'pickup') then
    raise exception 'invalid delivery_mode';
  end if;

  v_address := coalesce(p_meta->>'address', '');
  v_notes := coalesce(p_meta->>'notes', '');

  for v_elem in select * from jsonb_array_elements(p_items)
  loop
    if (v_elem->>'product_id') is null or (v_elem->>'quantity') is null then
      raise exception 'each item requires product_id, quantity';
    end if;

    begin
      v_product_id := (v_elem->>'product_id')::uuid;
    exception
      when others then
        raise exception 'invalid product_id';
    end;

    v_qty := (v_elem->>'quantity')::int;
    if v_qty < 1 then
      raise exception 'quantity must be >= 1';
    end if;

    select p.price
    into v_db_price
    from public.products p
    where p.id = v_product_id
      and p.in_stock = true
    for share;

    if v_db_price is null then
      raise exception 'invalid product_id';
    end if;

    v_sum := v_sum + (v_qty * v_db_price);
  end loop;

  if abs(v_sum + v_shipping_fee - p_total) > 0.01 then
    raise exception 'price mismatch: expected % got %', v_sum + v_shipping_fee, p_total;
  end if;

  insert into public.orders (
    user_id,
    total_price,
    subtotal,
    shipping_fee,
    delivery_mode,
    status,
    address,
    notes
  )
  values (
    v_order_user_id,
    p_total,
    v_sum,
    v_shipping_fee,
    v_delivery_mode,
    'new',
    v_address,
    v_notes
  )
  returning id into v_order_id;

  for v_elem in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_elem->>'product_id')::uuid;
    v_qty := (v_elem->>'quantity')::int;

    select p.price
    into v_db_price
    from public.products p
    where p.id = v_product_id
      and p.in_stock = true
    for share;

    if v_db_price is null then
      raise exception 'invalid product_id';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      quantity,
      price_at_purchase
    )
    values (
      v_order_id,
      v_product_id,
      v_qty,
      v_db_price
    );
  end loop;

  return v_order_id;
end;
$$;

comment on function public.create_order_with_items(uuid, jsonb, numeric, jsonb) is
  'Creates orders + order_items atomically using server-verified product prices.';
