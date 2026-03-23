# 🚀 Деплой на Vercel (РЕКОМЕНДУЕТСЯ)

## Почему Vercel?

✅ Создан специально для Next.js  
✅ Поддерживает Next.js 16 из коробки  
✅ Деплой за 2 минуты  
✅ Бесплатный план (достаточно для вашего проекта)  
✅ Автоматический деплой при push  
✅ Preview deployments для PR  

---

## 📋 Пошаговая инструкция

### 1. Создать аккаунт Vercel

1. Идите на https://vercel.com/signup
2. Нажмите **Continue with GitHub**
3. Авторизуйте Vercel в GitHub

### 2. Импортировать проект

1. На главной странице Vercel нажмите **Add New...** → **Project**
2. Найдите репозиторий `royal` в списке
3. Нажмите **Import**

### 3. Настроить проект

Vercel автоматически определит Next.js, но проверьте:

```
Framework Preset: Next.js
Build Command: next build (автоматически)
Output Directory: .next (автоматически)
Install Command: npm install (автоматически)
```

### 4. Environment Variables

Добавьте переменные окружения:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Site URL (после деплоя замените на ваш домен)
NEXT_PUBLIC_SITE_URL=https://royal-matras.vercel.app

# Google OAuth (если используете)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### 5. Deploy!

1. Нажмите **Deploy**
2. Ждите ~2 минуты
3. Готово! 🎉

Ваш сайт будет доступен на: `https://royal-matras.vercel.app`

---

## 🔧 После деплоя

### Настроить Custom Domain

1. В проекте: **Settings** → **Domains**
2. Нажмите **Add**
3. Введите ваш домен: `royal-matras.az`
4. Следуйте инструкциям для настройки DNS

**DNS записи:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Обновить Supabase Redirect URLs

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Добавьте в **Redirect URLs**:
   ```
   https://royal-matras.vercel.app/auth/callback
   https://royal-matras.az/auth/callback
   ```

### Обновить Google OAuth

1. Google Cloud Console → Credentials
2. Добавьте в **Authorized redirect URIs**:
   ```
   https://royal-matras.vercel.app/auth/callback
   https://royal-matras.az/auth/callback
   ```

---

## 🎯 Автоматический деплой

После настройки каждый push в `main` будет автоматически деплоиться:

```bash
git add .
git commit -m "feat: new feature"
git push origin main
# Vercel автоматически задеплоит за ~2 минуты
```

### Preview Deployments

Каждый Pull Request создаёт preview URL:
- Можно тестировать перед мержем
- Автоматически удаляется после merge
- Получаете комментарий в PR с ссылкой на preview

---

## 📊 Мониторинг

### Analytics

Vercel предоставляет бесплатную аналитику:
- **Analytics** → Web Vitals, Page Views
- Real User Monitoring (RUM)
- Core Web Vitals

### Logs

Просмотр логов:
- **Deployments** → Выберите деплой → **Function Logs**
- Real-time логи запросов
- Ошибки и warnings

---

## 💡 Преимущества Vercel vs Cloudflare

| Фича | Vercel | Cloudflare Pages |
|------|--------|------------------|
| Next.js 16 | ✅ Полная поддержка | ❌ Только до 15.5.2 |
| Middleware | ✅ Работает | ⚠️ Только Edge Runtime |
| Image Optimization | ✅ Встроенная | ⚠️ Требует настройки |
| Serverless Functions | ✅ Автоматически | ⚠️ Workers |
| Setup | ✅ 2 минуты | ⚠️ Требует конфигурации |

---

## 📈 Лимиты Free Plan

| Ресурс | Лимит |
|--------|-------|
| Bandwidth | 100 GB/месяц |
| Builds | 6000 минут/месяц |
| Serverless Functions | 100 GB-Hours |
| Edge Functions | 500k invocations |
| Domains | Unlimited |

**Для Royal Matras этого более чем достаточно!**

---

## 🆘 Troubleshooting

### Build fails

1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все env variables добавлены
3. Попробуйте **Redeploy**

### Environment variables не работают

1. Проверьте, что переменные добавлены в Vercel
2. Убедитесь, что они начинаются с `NEXT_PUBLIC_` для клиента
3. **Redeploy** проект после добавления переменных

### Google OAuth не работает

1. Проверьте redirect URIs в Google Console
2. Убедитесь, что Vercel URL добавлен в Supabase
3. Проверьте `NEXT_PUBLIC_SITE_URL` в env variables

---

## 🎯 Результат

После успешного деплоя:
- ✅ Сайт доступен на `https://royal-matras.vercel.app`
- ✅ Автоматический деплой при push
- ✅ Preview для каждого PR
- ✅ Бесплатный SSL
- ✅ Глобальный CDN
- ✅ Image Optimization
- ✅ Serverless Functions

---

## 🔗 Полезные ссылки

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
