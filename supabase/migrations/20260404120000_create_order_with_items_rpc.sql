-- Атомарное создание заказа + позиций в одной транзакции (вызывается через supabase.rpc).
-- p_items: [{"product_id":"uuid","quantity":1,"price_at_purchase":99.5}, ...]
-- p_meta (опционально): subtotal, shipping_fee, delivery_mode, address, notes

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
  v_subtotal numeric;
  v_shipping_fee numeric;
  v_delivery_mode text;
  v_address text;
  v_notes text;
  v_sum numeric;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'p_items must be a non-empty json array';
  end if;

  if p_total is null or p_total < 0 then
    raise exception 'invalid p_total';
  end if;

  -- Залогиненный клиент: всегда привязываем заказ к сессии; подделать чужой user_id нельзя.
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

  v_subtotal := (p_meta->>'subtotal')::numeric;
  if v_subtotal is null then
    select coalesce(
      sum((e->>'quantity')::numeric * (e->>'price_at_purchase')::numeric),
      0
    )
    into v_sum
    from jsonb_array_elements(p_items) as e;
    v_subtotal := v_sum;
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
    v_subtotal,
    v_shipping_fee,
    v_delivery_mode,
    'new',
    v_address,
    v_notes
  )
  returning id into v_order_id;

  for v_elem in select * from jsonb_array_elements(p_items)
  loop
    if (v_elem->>'product_id') is null
       or (v_elem->>'quantity') is null
       or (v_elem->>'price_at_purchase') is null
    then
      raise exception 'each item requires product_id, quantity, price_at_purchase';
    end if;

    if (v_elem->>'quantity')::int < 1 then
      raise exception 'quantity must be >= 1';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      quantity,
      price_at_purchase
    )
    values (
      v_order_id,
      (v_elem->>'product_id')::uuid,
      (v_elem->>'quantity')::int,
      (v_elem->>'price_at_purchase')::numeric
    );
  end loop;

  return v_order_id;
end;
$$;

comment on function public.create_order_with_items(uuid, jsonb, numeric, jsonb) is
  'Creates orders + order_items atomically; returns new order id.';

revoke all on function public.create_order_with_items(uuid, jsonb, numeric, jsonb) from public;
grant execute on function public.create_order_with_items(uuid, jsonb, numeric, jsonb) to anon, authenticated;
