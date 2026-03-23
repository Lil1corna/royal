# Royal Matras

Интернет-магазин ортопедических матрасов, топперов и подушек с кинематографическим дизайном в стиле Apple/Awwwards.

**Поддержка языков:** Азербайджанский, Русский, Английский

## ✨ Особенности

- 🎬 Кинематографический hero с профессиональной обработкой изображений
- 🌟 Анимированные aurora-эффекты и плавные переходы
- 🛒 Полнофункциональная корзина с real-time обновлениями
- 📦 Система заказов с отслеживанием статуса
- 🗺️ Интерактивная карта доставки (Leaflet)
- 👤 Аутентификация через Google OAuth
- 🔐 Роли пользователей (customer, manager, super_admin)
- 📱 Полностью адаптивный дизайн
- 🌐 Мультиязычность (az/ru/en)

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- npm или yarn
- Supabase аккаунт

### Установка

```bash
# Клонируйте репозиторий
git clone https://github.com/Lil1corna/royal.git
cd royal

# Установите зависимости
npm install

# Настройте переменные окружения
cp .env.example .env.local
# Отредактируйте .env.local с вашими данными

# Запустите dev сервер
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## ⚙️ Настройка

Подробная инструкция по настройке переменных окружения и деплою: **[SETUP.md](./SETUP.md)**

### Быстрая настройка .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📚 Документация

- [SETUP.md](./SETUP.md) - Полная инструкция по настройке
- [docs/AUTH_NETLIFY_CHECKLIST.md](./docs/AUTH_NETLIFY_CHECKLIST.md) - Чеклист для Google OAuth на Netlify
- [docs/SUPABASE_FEATURES_SETUP.md](./docs/SUPABASE_FEATURES_SETUP.md) - Настройка Supabase функций
- [docs/ROADMAP_PAYMENTS_WHATSAPP.md](./docs/ROADMAP_PAYMENTS_WHATSAPP.md) - Планы развития

## 🎨 Дизайн-система

Проект использует кастомную дизайн-систему с:
- Тёмной цветовой палитрой (#050d1a, #061226)
- Золотыми акцентами (#c9a84c, #e8c97a)
- Glass-morphism эффектами
- Кинематографической обработкой изображений
- Плавными 60fps анимациями

CSS классы:
- `.ds-btn-primary` - Основная кнопка
- `.ds-btn-secondary` - Вторичная кнопка
- `.ds-input` - Поле ввода
- `.ds-label` - Лейбл
- `.ds-card-glass` - Стеклянная карточка

## 🛠️ Технологии

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **Maps:** Leaflet, React-Leaflet
- **Deployment:** Netlify / Vercel

## 📦 Структура проекта

```
royal-matras/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── about/        # Страница "О нас"
│   │   ├── account/      # Личный кабинет
│   │   ├── admin/        # Админ-панель
│   │   ├── auth/         # Аутентификация
│   │   ├── cart/         # Корзина
│   │   ├── product/      # Страницы товаров
│   │   └── wishlist/     # Избранное
│   ├── components/       # React компоненты
│   │   ├── cinematic-hero.tsx
│   │   ├── about-section.tsx
│   │   ├── navbar.tsx
│   │   └── ...
│   ├── context/          # React Context (cart, lang, wishlist)
│   ├── lib/              # Утилиты и хелперы
│   └── styles/           # Глобальные стили
├── public/               # Статические файлы
├── supabase/            # Миграции БД
└── docs/                # Документация
```

## 🚢 Деплой

### Netlify

```bash
# Build command
npm run build

# Environment variables
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain.netlify.app
SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_SUPABASE_URL
```

### Vercel

1. Подключите репозиторий
2. Добавьте переменные окружения
3. Deploy автоматически

## 🤝 Контрибьюция

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект создан для Royal Matras.

## 📧 Контакты

- Website: [royalmatras.az](https://royalmatras.az)
- GitHub: [@Lil1corna](https://github.com/Lil1corna)

---

Made with ❤️ and ☕ by Royal Matras Team
