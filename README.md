# RoyalAz

Интернет-магазин ортопедических матрасов, топперов и подушек. Поддержка языков: азербайджанский, русский, английский.

## Требования

- Node.js 18+
- npm

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Создайте `.env.local` в корне проекта:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Для продакшена `NEXT_PUBLIC_SITE_URL` должен быть равен домену сайта (например, `https://royalaz.vercel.app`).

## Настройка Supabase

1. **Authentication → URL Configuration**
   - **Site URL**: ваш домен (например, `https://royalaz.vercel.app`)
   - **Redirect URLs**: добавьте `https://your-domain.com/auth/callback` и `https://*.vercel.app/auth/callback` (для Vercel preview)

2. **Authentication → Providers → Google**
   - Включите Google OAuth и настройте в Google Cloud Console

3. **Authentication → SMTP Settings** (для писем invite)
   - Включите custom SMTP (например, Resend, Mailgun, SendGrid)
   - Укажите From Name (например, `RoyalAz Team`) и From Email
   - Проверьте отправку тестового письма

4. **Authentication → Email Templates**
   - Настройте шаблон `Invite user`
   - Добавьте понятный текст: кого пригласили и куда перейти

## Деплой

### Vercel

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в Settings → Environment Variables
3. `NEXT_PUBLIC_SITE_URL` должен быть равен production URL

### Netlify

1. Import project from Git
2. Build command: `npm run build`
3. Publish directory: `.next` (или оставьте автоматический для Next.js)
4. Добавьте `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
5. Для обхода secrets scan: `SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_SUPABASE_URL`
6. Добавьте Netlify URL в Supabase Redirect URLs

## Технологии

- Next.js 16
- Supabase (Auth, Database)
- Tailwind CSS
- Leaflet (карта доставки)
