'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from './navbar'

export default function NavbarWrapper() {
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)

  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient()
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
  }, [])

  return <Navbar userEmail={userEmail} />
}
