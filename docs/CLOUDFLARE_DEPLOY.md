# 🔶 Деплой на Cloudflare Pages

## Что исправлено

✅ Middleware конвертирован в Edge Runtime  
✅ Проект теперь совместим с Cloudflare Pages  
✅ Build проходит успешно

---

## 📋 Пошаговая инструкция

### 1. Создать аккаунт Cloudflare

1. Идите на https://dash.cloudflare.com/sign-up
2. Зарегистрируйтесь (бесплатно)
3. Подтвердите email

### 2. Подключить GitHub репозиторий

1. В дашборде: **Workers & Pages** → **Create application**
2. Выберите **Pages** → **Connect to Git**
3. Авторизуйте Cloudflare в GitHub
4. Выберите репозиторий `royal`
5. Нажмите **Begin setup**

### 3. Настроить Build Settings

```yaml
Production branch: main
Build command: npm run build
Build output directory: .next
Root directory: (оставьте пустым)
```

### 4. Environment Variables

Добавьте переменные окружения:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=https://your-project.pages.dev
```

**Важно:**
- Для production используйте ваш домен
- Для preview можно оставить `.pages.dev`

### 5. Deploy!

1. Нажмите **Save and Deploy**
2. Ждите ~2-3 минуты
3. Готово! 🎉

---

## 🔧 После деплоя

### Настроить Custom Domain

1. **Workers & Pages** → Ваш проект → **Custom domains**
2. Нажмите **Set up a custom domain**
3. Введите ваш домен: `royal-matras.az`
4. Следуйте инструкциям для настройки DNS

**DNS записи:**
```
Type: CNAME
Name: @ (или www)
Target: your-project.pages.dev
```

### Обновить Supabase Redirect URLs

1. Идите в Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Добавьте в **Redirect URLs**:
   ```
   https://your-project.pages.dev/auth/callback
   https://royal-matras.az/auth/callback
   ```

### Обновить Google OAuth

1. Google Cloud Console → Credentials
2. Добавьте в **Authorized redirect URIs**:
   ```
   https://your-project.pages.dev/auth/callback
   https://royal-matras.az/auth/callback
   ```

---

## 📊 Мониторинг

### Analytics

Cloudflare предоставляет бесплатную аналитику:
- **Workers & Pages** → Ваш проект → **Analytics**
- Requests, Bandwidth, Errors
- Real-time данные

### Logs

Просмотр логов:
- **Workers & Pages** → Ваш проект → **Logs**
- Real-time логи запросов
- Ошибки и warnings

---

## 🚀 Автоматический деплой

После настройки каждый push в `main` будет автоматически деплоиться:

```bash
git add .
git commit -m "feat: new feature"
git push origin main
# Cloudflare автоматически задеплоит
```

### Preview Deployments

Каждый Pull Request создаёт preview URL:
- Можно тестировать перед мержем
- Автоматически удаляется после merge

---

## ⚠️ Troubleshooting

### Build fails с "Node.js middleware not supported"

✅ **Исправлено!** Middleware теперь использует Edge Runtime.

Если всё равно ошибка:
1. Проверьте, что `src/middleware.ts` существует
2. Убедитесь, что `export const runtime = 'experimental-edge'` присутствует

### Environment variables не работают

1. Проверьте, что переменные добавлены в Cloudflare
2. Убедитесь, что они начинаются с `NEXT_PUBLIC_` для клиента
3. Пересоберите проект (Deployments → Retry deployment)

### Google OAuth не работает

1. Проверьте redirect URIs в Google Console
2. Убедитесь, что Cloudflare URL добавлен в Supabase
3. Проверьте `NEXT_PUBLIC_SITE_URL` в env variables

### Slow build times

Cloudflare кэширует зависимости:
- Первый build: ~2-3 минуты
- Последующие: ~1-2 минуты

---

## 💡 Советы

### 1. Используйте Preview Deployments

Создавайте PR для тестирования:
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Создайте PR на GitHub
# Cloudflare создаст preview URL
```

### 2. Настройте Branch Deployments

Можно деплоить staging branch:
- **Settings** → **Builds & deployments**
- Добавьте `staging` branch
- Получите отдельный URL для тестов

### 3. Rollback

Откатиться на предыдущую версию:
- **Deployments** → Выберите старый деплой
- **Manage deployment** → **Rollback to this deployment**

---

## 📈 Лимиты Free Plan

| Ресурс | Лимит |
|--------|-------|
| Bandwidth | ♾️ Unlimited |
| Requests | ♾️ Unlimited |
| Builds | 500/месяц |
| Build time | 20 мин/build |
| Custom domains | 100 |
| Concurrent builds | 1 |

**Для Royal Matras этого более чем достаточно!**

---

## 🎯 Результат

После успешного деплоя:
- ✅ Сайт доступен на `https://your-project.pages.dev`
- ✅ Автоматический деплой при push
- ✅ Preview для каждого PR
- ✅ Бесплатный SSL
- ✅ Глобальный CDN
- ✅ DDoS защита

---

## 🆘 Нужна помощь?

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
