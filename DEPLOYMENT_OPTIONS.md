# 🚀 Варианты деплоя для Royal Matras

## ⚡ Vercel (РЕКОМЕНДУЕТСЯ)

**Почему Vercel:**
- ✅ Создан специально для Next.js
- ✅ Поддерживает Next.js 16 из коробки
- ✅ Деплой за 2 минуты
- ✅ Бесплатный план (100 GB bandwidth/месяц)
- ✅ Автоматический деплой при push
- ✅ Image Optimization встроена

**Инструкция:** См. `VERCEL_DEPLOY.md`

---

## 🔶 Cloudflare Pages

**Проблема:**
- ❌ `@cloudflare/next-on-pages` поддерживает только Next.js до 15.5.2
- ❌ У вас Next.js 16.2.1 — несовместимо

**Решение:**
1. Откатить Next.js до 15.5.2 (потеряете новые фичи)
2. Или использовать Vercel

**Если хотите Cloudflare:**
```bash
npm install next@15.5.2
npm install @cloudflare/next-on-pages wrangler
```

Затем следуйте инструкциям в `docs/CLOUDFLARE_DEPLOY.md`

---

## 🌐 Netlify

**Статус:** Работает с Next.js 16

**Плюсы:**
- ✅ Бесплатный план (100 GB bandwidth/месяц)
- ✅ Автоматический деплой
- ✅ Edge Functions

**Минусы:**
- ⚠️ Требует Netlify CLI или адаптер
- ⚠️ Медленнее чем Vercel для Next.js

**Инструкция:** См. `docs/AUTH_NETLIFY_CHECKLIST.md`

---

## 🐳 Railway / Render

**Статус:** Работает с Next.js 16

**Плюсы:**
- ✅ Полный контроль над сервером
- ✅ Можно добавить PostgreSQL, Redis и т.д.

**Минусы:**
- ⚠️ Бесплатный план ограничен (Railway: $5/месяц после trial)
- ⚠️ Требует больше настройки

---

## 📊 Сравнение

| Платформа | Next.js 16 | Бесплатный план | Setup время | Рекомендация |
|-----------|------------|-----------------|-------------|--------------|
| Vercel | ✅ | 100 GB/мес | 2 мин | ⭐⭐⭐⭐⭐ |
| Cloudflare | ❌ (до 15.5.2) | Unlimited | 10 мин | ⭐⭐ |
| Netlify | ✅ | 100 GB/мес | 5 мин | ⭐⭐⭐⭐ |
| Railway | ✅ | $5/мес | 15 мин | ⭐⭐⭐ |

---

## 🎯 Рекомендация

**Используйте Vercel:**
1. Идите на https://vercel.com/signup
2. Continue with GitHub
3. Import проект `royal`
4. Добавьте env variables
5. Deploy

Готово за 2 минуты! 🎉

См. подробную инструкцию в `VERCEL_DEPLOY.md`
