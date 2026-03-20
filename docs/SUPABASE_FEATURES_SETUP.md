# Настройка: доставка, Realtime, безопасность

## 1. Колонки доставки в `orders`

В Supabase → **SQL Editor** выполните содержимое файла:

`supabase/migrations/20250321120000_orders_delivery.sql`

Без этого шага создание заказа из корзины может вернуть ошибку (неизвестные поля `subtotal`, `shipping_fee`, `delivery_mode`).

Переменные окружения (опционально):

- `NEXT_PUBLIC_COURIER_FEE_AZN` — курьер, по умолчанию `8`
- `NEXT_PUBLIC_FREE_SHIPPING_FROM_AZN` — бесплатная доставка от суммы, по умолчанию `200`

## 2. Realtime для статусов заказов

Чтобы статусы обновлялись **в реальном времени** в кабинете и админке:

1. Supabase Dashboard → **Database** → **Replication**
2. Включите репликацию для таблицы **`public.orders`** (Publication `supabase_realtime`).

Проверьте политики **RLS**: пользователь должен видеть только свои заказы; менеджер — все (как у вас настроено для `SELECT`).

## 3. Безопасность

- Маршрут `POST /admin/orders/update` проверяет роль (`super_admin` | `manager`), допустимые статусы и лимит запросов.
- Для продакшена лучше заменить in-memory rate limit на **Upstash Redis** или аналог.

## 4. Мониторинг

- Ошибки корневого уровня логируются в `global-error.tsx` через `captureException`.
- При необходимости подключите **Sentry** (`@sentry/nextjs`) и вызывайте `Sentry.captureException` там же.
