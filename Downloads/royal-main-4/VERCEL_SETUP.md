# RoyalAz — настройка для Vercel

## Переменные окружения в Vercel

В **Settings → Environment Variables** добавьте:

| Переменная | Значение | Описание |
|------------|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Anon key из Supabase |
| `NEXT_PUBLIC_SITE_URL` | `https://royalaz.vercel.app` | **Важно!** Ваш домен на Vercel (или `https://ваш-проект.vercel.app`) |

`NEXT_PUBLIC_SITE_URL` нужен, чтобы OAuth-редирект вёл на правильный URL. Без него auth может не работать.

## Supabase Dashboard

1. **Authentication → URL Configuration**
   - **Site URL**: `https://royalaz.vercel.app` (или ваш прод-домен)
   - **Redirect URLs**: добавьте:
     - `https://royalaz.vercel.app/auth/callback`
     - `https://*.vercel.app/auth/callback` (для preview-деплоев)

2. **Authentication → Providers → Google**
   - В Google Cloud Console в «Authorized redirect URIs» должен быть:
     - `https://ваш-supabase-project.supabase.co/auth/v1/callback`

## Проверка

После деплоя перейдите на `/auth/signin`. Кратко покажется экран «Redirecting…», затем редирект на Google. После входа — на главную.

Если ошибка — откройте `/auth/error` — там будет сообщение.
