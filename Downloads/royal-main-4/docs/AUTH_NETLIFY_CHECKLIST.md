# Вход через Google не работает после переноса (Netlify / новый аккаунт)

В RoyalAz **нет отдельной регистрации по email/паролю**: первый вход — через **Google**. После успешного входа Supabase **создаёт пользователя автоматически**.

Если «не работает регистрация», обычно это **OAuth редирект** или **переменные окружения**.

## 1. Переменные в Netlify (Build & deploy → Environment variables)

Обязательно задайте (значения из Supabase / старого проекта):

| Переменная | Зачем |
|------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `NEXT_PUBLIC_SITE_URL` | **Точный** URL сайта **без** слэша в конце, например `https://your-site.netlify.app` или ваш кастомный домен |
| `SUPABASE_SERVICE_ROLE_KEY` | Для staff invites / админ-логики (сервер только) |

После изменения переменных сделайте **новый деплой** (Redeploy).

**Редирект после входа:** в коде `getBaseUrl(request)` сначала берёт **хост из запроса** (тот сайт, где открыли `/auth/callback`), поэтому после деплоя на новый URL вроде `deft-torte-….netlify.app` вы не должны улетать на старый `royalaz.netlify.app` из‑за env. Всё равно обновите `NEXT_PUBLIC_SITE_URL` и Supabase **Site URL** на актуальный адрес — для ссылок и консистентности.

**Важно:** если в Supabase в **Redirect URLs** нет строки с вашим новым доменом и `/auth/callback` — вход может падать с ошибкой.

## 2. Supabase → Authentication → URL Configuration

1. **Site URL** — тот же, что и продакшен-адрес сайта (как в браузере).
2. **Redirect URLs** — добавьте **все** варианты, с которых реально заходят пользователи, по одной строке:
   - `https://ВАШ-САЙТ.netlify.app/auth/callback`
   - при кастомном домене: `https://ваш-домен.az/auth/callback`
   - для превью (если используете): `https://deploy-preview-*.netlify.app/auth/callback` — уточните в [доке Supabase](https://supabase.com/docs/guides/auth/redirect-urls) по wildcard.

Сохраните изменения.

## 3. Google Cloud Console (типичная ошибка после смены Supabase)

В **Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client** в **Authorized redirect URIs** должен быть:

`https://ВАШ_PROJECT_REF.supabase.co/auth/v1/callback`

Он **не** меняется при смене Netlify, **если** тот же проект Supabase. Если создали **новый** проект Supabase — добавьте **новый** redirect URI Supabase в Google.

## 4. Посмотреть текст ошибки

Откройте в браузере после неудачного входа:

`/auth/error?message=...`

Там будет сообщение от Supabase/Google (например `redirect_uri_mismatch`).

## 5. Команда Netlify «credit limit»

Если деплои на паузе, **новый код с правильными env может не быть на проде** — проверьте, что последний деплой успешен.

---

После правок: **Site URL** в Supabase = **NEXT_PUBLIC_SITE_URL** = адрес в адресной строке, и в **Redirect URLs** есть строка с `/auth/callback` для этого же хоста.
