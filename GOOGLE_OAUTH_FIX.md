# СРОЧНОЕ ИСПРАВЛЕНИЕ Google OAuth

## Проблема найдена! ✅

У тебя в Google Cloud Console **2 секрета**, один отключен!

## Решение:

### Шаг 1: Получи правильные credentials из Google

1. Иди в Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Найди свой OAuth 2.0 Client ID
3. Скопируй:
   - **Client ID** (полностью)
   - **Client Secret** - используй **ENABLED** секрет (тот что с зеленой галочкой)

### Шаг 2: Обнови Supabase

1. Иди в Supabase: https://app.supabase.com/project/peihzxieybpsmocidwfa/auth/providers
2. Найди **Google** provider
3. Включи его (Enable)
4. Вставь:
   - **Client ID** из Google
   - **Client Secret** - АКТИВНЫЙ секрет из Google (Enabled)
5. Нажми **Save**

### Шаг 3: Проверь Authorized redirect URIs в Google

В Google Cloud Console → OAuth Client → Authorized redirect URIs должен быть:

```
https://peihzxieybpsmocidwfa.supabase.co/auth/v1/callback
```

☝️ Это callback Supabase, НЕ твоего приложения!

### Шаг 4: Проверь Site URL в Supabase

Supabase → Authentication → URL Configuration:

**Site URL:**
```
https://statuesque-rabanadas-82127c.netlify.app
```

**Redirect URLs:**
```
https://statuesque-rabanadas-82127c.netlify.app/auth/callback
http://localhost:3000/auth/callback
```

### Шаг 5: Задеплой код с исправлениями

```bash
git add .
git commit -m "Fix Google OAuth - add debug info"
git push
```

### Шаг 6: Тестируй

После деплоя:
1. Иди на https://statuesque-rabanadas-82127c.netlify.app/auth/signin
2. Открой консоль браузера (F12)
3. Нажми Sign In
4. Должен быть редирект на Google

## Если всё ещё не работает:

Скинь скриншот или текст из:
1. Browser console (F12 → Console)
2. Debug info на странице /auth/signin
3. Supabase → Authentication → Providers → Google (скриншот настроек)

## Важно!

После изменения секретов в Google или Supabase может потребоваться до 5 минут для применения изменений.
