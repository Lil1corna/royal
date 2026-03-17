'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'az' | 'ru' | 'en'
type LangContext = { lang: Lang, setLang: (l: Lang) => void }

const LangCtx = createContext<LangContext>({ lang: 'az', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('az')

  useEffect(() => {
    const saved = localStorage.getItem('royalaz_lang') as Lang
    if (saved) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('royalaz_lang', l)
  }

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)

export const t = (az: string, ru: string, en: string) => ({ az, ru, en })

export const translations = {
  catalog: t('Katalog', 'Каталог', 'Catalog'),
  cart: t('Sebet', 'Корзина', 'Cart'),
  account: t('Kabinet', 'Кабинет', 'Account'),
  signin: t('Giris', 'Войти', 'Sign In'),
  signout: t('Cixis', 'Выйти', 'Sign Out'),
  addToCart: t('Sebete ele', 'В корзину', 'Add to Cart'),
  orderNow: t('Birbasha sifaris', 'Заказать', 'Order Now'),
  inStock: t('Stokda var', 'В наличии', 'In Stock'),
  outOfStock: t('Stokda yoxdur', 'Нет в наличии', 'Out of Stock'),
  selectSize: t('Olcu secin', 'Выберите размер', 'Select Size'),
  order: t('Sifaris et', 'Заказать', 'Place Order'),
  address: t('Unvan', 'Адрес', 'Address'),
  phone: t('Telefon', 'Телефон', 'Phone'),
  notes: t('Qeyd', 'Заметка', 'Notes'),
  myOrders: t('Sifarislerim', 'Мои заказы', 'My Orders'),
  back: t('Geri', 'Назад', 'Back'),
  new: t('Yeni', 'Новый', 'New'),
  confirmed: t('Tesdiq edildi', 'Подтверждён', 'Confirmed'),
  inDelivery: t('Yolda', 'В пути', 'In Delivery'),
  delivered: t('Catdirildi', 'Доставлен', 'Delivered'),
  cancelled: t('Legv edildi', 'Отменён', 'Cancelled'),
  categories: {
    ortopedik: t('Ortopedik', 'Ортопедический', 'Orthopedic'),
    berk: t('Berk', 'Жёсткий', 'Firm'),
    yumshaq: t('Yumshaq', 'Мягкий', 'Soft'),
    topper: t('Topper', 'Топпер', 'Topper'),
    ushaq: t('Ushaq', 'Детский', 'Children'),
    yastig: t('Yastig', 'Подушка', 'Pillow'),
  } as Record<string, { az: string, ru: string, en: string }>,
}
