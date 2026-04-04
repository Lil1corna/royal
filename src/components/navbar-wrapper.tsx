'use client'
import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import Navbar from './navbar'

export default function NavbarWrapper() {
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const supabase = useMemo(() => getSupabaseClient(), [])

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('[Navbar] Error getting user:', error)
        }
        
        setUserEmail(user?.email)
      } catch (error) {
        console.error('[Navbar] Error getting user:', error)
      }
    }

    getUser()
  }, [supabase])

  return <Navbar userEmail={userEmail} />
}
