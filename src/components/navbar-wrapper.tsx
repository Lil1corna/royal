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
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Navbar] Error getting user:', error)
        }
        
        setUserEmail(session?.user?.email)
      } catch (error) {
        console.error('[Navbar] Error getting user:', error)
      }
    }

    void getUser()

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email)
    })

    return () => {
      authSubscription.subscription.unsubscribe()
    }
  }, [supabase])

  return <Navbar userEmail={userEmail} />
}
