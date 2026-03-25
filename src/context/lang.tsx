'use client'
import { createContext, useContext, useState } from 'react'

type Lang = 'az' | 'ru' | 'en'
type LangContext = { lang: Lang, setLang: (l: Lang) => void }

const LangCtx = createContext<LangContext>({ lang: 'az', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'az'
    const saved = localStorage.getItem('royalaz_lang')
    return saved === 'az' || saved === 'ru' || saved === 'en' ? saved : 'az'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('royalaz_lang', l)
  }

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)

export const t = (az: string, ru: string, en: string) => ({ az, ru, en })

export const translations = {
  catalog: t('Kataloq', 'Каталог', 'Catalog'),
  about: t('Haqqımızda', 'О нас', 'About'),
  ourStory: t('Bizim hekayəmiz', 'Наша история', 'Our Story'),
  ourValues: t('Dəyərlərimiz', 'Наши ценности', 'Our Values'),
  cart: t('Səbət', 'Корзина', 'Cart'),
  account: t('Kabinet', 'Кабинет', 'Account'),
  signin: t('Giriş', 'Войти', 'Sign In'),
  signout: t('Çıxış', 'Выйти', 'Sign Out'),
  addToCart: t('Səbətə əlavə et', 'В корзину', 'Add to Cart'),
  orderNow: t('Birbaşa sifariş', 'Заказать', 'Order Now'),
  inStock: t('Stokda var', 'В наличии', 'In Stock'),
  outOfStock: t('Stokda yoxdur', 'Нет в наличии', 'Out of Stock'),
  selectSize: t('Ölçü seçin', 'Выберите размер', 'Select Size'),
  order: t('Sifariş edin', 'Заказать', 'Place Order'),
  address: t('Ünvan', 'Адрес', 'Address'),
  phone: t('Telefon', 'Телефон', 'Phone'),
  notes: t('Qeyd', 'Заметка', 'Notes'),
  myOrders: t('Sifarişlərim', 'Мои заказы', 'My Orders'),
  back: t('Geri', 'Назад', 'Back'),
  new: t('Yeni', 'Новый', 'New'),
  confirmed: t('Təsdiq edildi', 'Подтверждён', 'Confirmed'),
  inDelivery: t('Yolda', 'В пути', 'In Delivery'),
  delivered: t('Çatdırıldı', 'Доставлен', 'Delivered'),
  cancelled: t('Ləğv edildi', 'Отменён', 'Cancelled'),
  cartEmpty: t('Səbət boşdur', 'Корзина пуста', 'Cart is empty'),
  backToCatalog: t('Kataloqa qayıt', 'В каталог', 'Back to catalog'),
  deliveryAddress: t('Çatdırılma ünvanı', 'Адрес доставки', 'Delivery address'),
  addressSelected: t('Seçildi', 'Выбрано', 'Selected'),
  extraInfo: t('Əlavə məlumat', 'Доп. информация', 'Extra info'),
  submitOrder: t('Sifariş edin', 'Оформить заказ', 'Place order'),
  orderForm: t('Sifariş', 'Заказ', 'Order'),
  submitting: t('Gondərilir...', 'Отправка...', 'Submitting...'),
  selectAddress: t('Ünvanı seçin', 'Выберите адрес', 'Select address'),
  pieces: t('ədəd', 'шт', 'pcs'),
  total: t('Cəm', 'Итого', 'Total'),
  orderSuccess: t('Sifarişiniz qəbul edildi!', 'Заказ принят!', 'Order received!'),
  orderSuccessMessage: t('Tezliklə sizinlə əlaqə saxlayacağıq.', 'Скоро с вами свяжемся.', 'We will contact you soon.'),
  backToCatalogBtn: t('Kataloqa qayıt', 'В каталог', 'Back to catalog'),
  selectSizeLabel: t('Ölçü seçin:', 'Выберите размер:', 'Select size:'),
  addToCartSuccess: t('Səbətə əlavə edildi!', 'Добавлено в корзину!', 'Added to cart!'),
  mapSearch: t('Küçə, ev nömrəsi axtar...', 'Поиск улицы, дома...', 'Search street, house...'),
  mapSearchBtn: t('Axtar', 'Искать', 'Search'),
  mapHint: t('Xəritədə klikləyin və ya ünvan axtarın', 'Кликните на карте или введите адрес', 'Click on map or search address'),
  mapSelected: t('Seçildi', 'Выбрано', 'Selected'),
  searchPlaceholder: t('Axtar...', 'Поиск...', 'Search...'),
  allCategories: t('Hamısı', 'Все', 'All'),
  prevPage: t('Əvvəlki', 'Назад', 'Previous'),
  nextPage: t('Növbəti', 'Вперёд', 'Next'),
  error: t('Xəta', 'Ошибка', 'Error'),
  tryAgain: t('Yenidən cəhd edin', 'Попробовать снова', 'Try again'),
  accountSettings: t('Hesab ayarları', 'Настройки аккаунта', 'Account settings'),
  displayName: t('Ad', 'Имя', 'Display name'),
  saveChanges: t('Yadda saxla', 'Сохранить', 'Save changes'),
  saving: t('Yadda saxlanılır...', 'Сохранение...', 'Saving...'),
  saved: t('Yadda saxlanıldı', 'Сохранено', 'Saved'),
  invalidPhone: t('Telefon nömrəsi düzgün deyil', 'Некорректный номер телефона', 'Invalid phone number'),
  avatarUrl: t('Avatar URL', 'Ссылка на аватар', 'Avatar URL'),
  shippingAddress: t('Çatdırılma ünvanı', 'Адрес доставки', 'Shipping address'),
  accountPhone: t('Telefon', 'Телефон', 'Phone'),
  updateEmail: t('E-mail-i dəyişdir', 'Сменить email', 'Update email'),
  newEmail: t('Yeni e-mail', 'Новый email', 'New email'),
  sendConfirmation: t('Təsdiq məktubunu göndər', 'Отправить подтверждение', 'Send confirmation'),
  confirmationSent: t('Təsdiq məktubu göndərildi', 'Письмо подтверждения отправлено', 'Confirmation email sent'),
  invalidEmail: t('E-mail düzgün deyil', 'Некорректный email', 'Invalid email'),
  removeAvatar: t('Avatarı sil', 'Удалить аватар', 'Remove avatar'),
  phoneFormatHint: t('+994 XX XXX XX XX', '+994 XX XXX XX XX', '+994 XX XXX XX XX'),
  invalidAvatarUrl: t('Avatar linki düzgün deyil', 'Некорректная ссылка аватара', 'Invalid avatar URL'),
  avatarNotReachable: t('Avatar yüklənmir, başqa link yoxlayın', 'Аватар не загружается, проверьте ссылку', 'Avatar is not reachable, try another URL'),
  orderProgress: t('Sifarişin statusu', 'Статус заказа', 'Order status'),
  orderCancelledHint: t(
    'Bu sifariş ləğv edilib',
    'Этот заказ отменён',
    'This order was cancelled'
  ),
  liveStatus: t('Canlı', 'Онлайн', 'Live'),
  noOrdersYet: t('Heç bir sifarişiniz yoxdur', 'Заказов пока нет', 'No orders yet'),
  startShopping: t('Alış-verişə başla', 'Начать покупки', 'Start shopping'),
  shippingLine: t('çatdırılma', 'доставка', 'shipping'),
  deliveryMethod: t('Çatdırılma növü', 'Способ доставки', 'Delivery method'),
  courierDelivery: t('Kuryerlə', 'Курьером', 'Courier'),
  pickupDelivery: t('Özün götür (mağaza)', 'Самовывоз (магазин)', 'Pickup (store)'),
  subtotal: t('Məhsullar', 'Товары', 'Subtotal'),
  shippingFee: t('Çatdırılma', 'Доставка', 'Shipping'),
  wishlist: t('Seçilmişlər', 'Избранное', 'Wishlist'),
  recentlyViewed: t('Son baxılanlar', 'Недавно смотрели', 'Recently viewed'),
  addToWishlist: t('Seçilmişlərə əlavə et', 'В избранное', 'Add to wishlist'),
  removeFromWishlist: t('Seçilmişlərdən sil', 'Убрать из избранного', 'Remove from wishlist'),
  wishlistEmpty: t('Seçilmişlər boşdur', 'Избранное пусто', 'Wishlist is empty'),
  openWishlist: t('Seçilmişlərə bax', 'Открыть избранное', 'Open wishlist'),
  loading: t('Yüklənir...', 'Загрузка...', 'Loading...'),
  contactUs: t('Əlaqə', 'Контакты', 'Contact'),
  followSocial: t('Bizi izləyin', 'Мы в соцсетях', 'Follow us'),
  yearsExp: t('İl təcrübəsi', 'Лет опыта', 'Years of experience'),
  happyCustomers: t('Məmnun müştərilər', 'Довольных клиентов', 'Happy customers'),
  warranty: t('Rəsmi zəmanət', 'Официальная гарантия', 'Official warranty'),
  readyToChange: t(
    'Yuxunuzu dəyişdirməyə hazırsınız?',
    'Готовы изменить свой сон?',
    'Ready to transform your sleep?'
  ),
  addressFromProfile: t(
    'Profilimdəki ünvan',
    'Адрес из профиля',
    'Saved profile address'
  ),
  addressPickOnMap: t(
    'Xəritədə yeni ünvan seçin',
    'Указать другой адрес на карте',
    'Choose a different address on the map'
  ),
  addressProfileHint: t(
    'Ünvanı xəritədə seçin — koordinatlar saxlanılır, sifarişdə istifadə edə bilərsiniz.',
    'Выберите адрес на карте — координаты сохранятся для заказов.',
    'Pick your address on the map — coordinates are saved for checkout.',
  ),
  addressDetailHint: t(
    'Mərtəbə, mənzil (istəyə görə)',
    'Этаж, квартира (необязательно)',
    'Floor, apt. (optional)'
  ),
  pickupNoAddressNeeded: t(
    'Özünüz götürmək üçün çatdırılma ünvanı tələb olunmur',
    'Для самовывоза адрес доставки не нужен',
    'Pickup — no delivery address needed',
  ),
  categories: {
    ortopedik: t('Ortopedik', 'Ортопедический', 'Orthopedic'),
    berk: t('Berk', 'Жёсткий', 'Firm'),
    yumshaq: t('Yumshaq', 'Мягкий', 'Soft'),
    topper: t('Topper', 'Топпер', 'Topper'),
    ushaq: t('Uşaq', 'Детский', 'Children'),
    yastig: t('Yastıq', 'Подушка', 'Pillow'),
  } as Record<string, { az: string, ru: string, en: string }>,
}
