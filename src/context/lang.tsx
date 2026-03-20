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
  cartEmpty: t('Sebet boshdur', 'Корзина пуста', 'Cart is empty'),
  backToCatalog: t('Kataloga qayit', 'В каталог', 'Back to catalog'),
  deliveryAddress: t('Catdirilma unvani', 'Адрес доставки', 'Delivery address'),
  addressSelected: t('Secildi', 'Выбрано', 'Selected'),
  extraInfo: t('Elave melumat', 'Доп. информация', 'Extra info'),
  submitOrder: t('Sifaris et', 'Оформить заказ', 'Place order'),
  orderForm: t('Sifaris', 'Заказ', 'Order'),
  submitting: t('Gondərilir...', 'Отправка...', 'Submitting...'),
  selectAddress: t('Unvani secin', 'Выберите адрес', 'Select address'),
  pieces: t('eded', 'шт', 'pcs'),
  total: t('Cem', 'Итого', 'Total'),
  orderSuccess: t('Sifarisiz qebul edildi!', 'Заказ принят!', 'Order received!'),
  orderSuccessMessage: t('Tezliklə sizinle elaqe saxlayacagiq.', 'Скоро с вами свяжемся.', 'We will contact you soon.'),
  backToCatalogBtn: t('Kataloga qayit', 'В каталог', 'Back to catalog'),
  selectSizeLabel: t('Olcu secin:', 'Выберите размер:', 'Select size:'),
  addToCartSuccess: t('Sebete elave edildi!', 'Добавлено в корзину!', 'Added to cart!'),
  mapSearch: t('Kuce, ev nomresi axtar...', 'Поиск улицы, дома...', 'Search street, house...'),
  mapSearchBtn: t('Axtar', 'Искать', 'Search'),
  mapHint: t('Xeritada klikleyin ve ya adres axtar', 'Кликните на карте или введите адрес', 'Click on map or search address'),
  mapSelected: t('Secildi', 'Выбрано', 'Selected'),
  searchPlaceholder: t('Axtar...', 'Поиск...', 'Search...'),
  allCategories: t('Hamısı', 'Все', 'All'),
  prevPage: t('Əvvəlki', 'Назад', 'Previous'),
  nextPage: t('Növbəti', 'Вперёд', 'Next'),
  error: t('Xeta', 'Ошибка', 'Error'),
  tryAgain: t('Yeniden cəhd et', 'Попробовать снова', 'Try again'),
  accountSettings: t('Hesab ayarlari', 'Настройки аккаунта', 'Account settings'),
  displayName: t('Ad', 'Имя', 'Display name'),
  saveChanges: t('Yadda saxla', 'Сохранить', 'Save changes'),
  saving: t('Yaddash...', 'Сохранение...', 'Saving...'),
  saved: t('Yaddasxlandi', 'Сохранено', 'Saved'),
  invalidPhone: t('Telefon nomresi duzgun deyil', 'Некорректный номер телефона', 'Invalid phone number'),
  avatarUrl: t('Avatar URL', 'Ссылка на аватар', 'Avatar URL'),
  shippingAddress: t('Catdirilma unvani', 'Адрес доставки', 'Shipping address'),
  accountPhone: t('Telefon', 'Телефон', 'Phone'),
  updateEmail: t('Email deyişdir', 'Сменить email', 'Update email'),
  newEmail: t('Yeni email', 'Новый email', 'New email'),
  sendConfirmation: t('Tesdiq mektubu gonder', 'Отправить подтверждение', 'Send confirmation'),
  confirmationSent: t('Tesdiq mektubu gonderildi', 'Письмо подтверждения отправлено', 'Confirmation email sent'),
  invalidEmail: t('Email duzgun deyil', 'Некорректный email', 'Invalid email'),
  removeAvatar: t('Avatari sil', 'Удалить аватар', 'Remove avatar'),
  phoneFormatHint: t('+994 XX XXX XX XX', '+994 XX XXX XX XX', '+994 XX XXX XX XX'),
  invalidAvatarUrl: t('Avatar linki duzgun deyil', 'Некорректная ссылка аватара', 'Invalid avatar URL'),
  avatarNotReachable: t('Avatar yuklenmir, basqa link yoxlayin', 'Аватар не загружается, проверьте ссылку', 'Avatar is not reachable, try another URL'),
  categories: {
    ortopedik: t('Ortopedik', 'Ортопедический', 'Orthopedic'),
    berk: t('Berk', 'Жёсткий', 'Firm'),
    yumshaq: t('Yumshaq', 'Мягкий', 'Soft'),
    topper: t('Topper', 'Топпер', 'Topper'),
    ushaq: t('Ushaq', 'Детский', 'Children'),
    yastig: t('Yastig', 'Подушка', 'Pillow'),
  } as Record<string, { az: string, ru: string, en: string }>,
}
