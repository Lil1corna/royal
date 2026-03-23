/** Контакты и соцсети — одно место для футера и при необходимости других блоков */
export const SITE_CONTACT = {
  phoneDisplay: '055 200 09 86',
  /** Для tel: и WhatsApp */
  phoneE164: '+994552000986',
  instagram: 'https://www.instagram.com/royal.matras.az/',
  tiktok: 'https://www.tiktok.com/@royal_matras',
} as const

export function whatsappChatUrl(): string {
  const n = SITE_CONTACT.phoneE164.replace(/\D/g, '')
  return `https://wa.me/${n}`
}
