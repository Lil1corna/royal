import { CONTACTS } from '@/config/contacts'

/** @deprecated Use CONTACTS from @/config/contacts */
export const SITE_CONTACT = {
  phoneDisplay: CONTACTS.phone,
  phoneE164: CONTACTS.phoneHref.replace('tel:', ''),
  instagram: CONTACTS.instagram,
  tiktok: CONTACTS.tiktok,
} as const

export function whatsappChatUrl(): string {
  return CONTACTS.whatsapp
}
