# 🔥 Cloudflare Pages — Быстрое исправление

## Что нужно сделать ПРЯМО СЕЙЧАС

### 1️⃣ Откройте Cloudflare Dashboard

Идите на: https://dash.cloudflare.com/

Найдите ваш проект → **Settings** → **Builds & deployments**

---

### 2️⃣ Измените Build Command

**Было:**
```
npm run build
```

**Должно быть:**
```
npx @cloudflare/next-on-pages
```

**Build output directory:**
```
.vercel/output/static
```

---

### 3️⃣ Добавьте Environment Variable

Settings → **Environment variables** → Production

Добавьте:
```
NODE_VERSION=20
```

Плюс все ваши существующие переменные (Supabase, Google OAuth и т.д.)

---

### 4️⃣ Retry Deployment

**Deployments** → Последний failed deployment → **Retry deployment**

Или просто подождите — новый коммит уже запушен, Cloudflare автоматически начнёт новый build.

---

## ✅ Результат

Build должен пройти успешно за ~2-3 минуты.

Если всё равно ошибка — напишите мне текст ошибки из Cloudflare build logs.

---

## 🆘 Если не помогло

Попробуйте:
1. Settings → Builds & deployments → **Clear build cache**
2. Retry deployment

Или пересоздайте проект в Cloudflare Pages с правильными настройками с самого начала.
