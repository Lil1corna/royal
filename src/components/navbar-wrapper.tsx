'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from './navbar'

export default function NavbarWrapper() {
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('[Navbar] Error getting user:', error)
        } else {
          console.log('[Navbar] User session:', user ? `Logged in as ${user.email}` : 'Not logged in')
        }
        
        setUserEmail(user?.email)
      } catch (error) {
        console.error('[Navbar] Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return <Navbar userEmail={userEmail} />
}
