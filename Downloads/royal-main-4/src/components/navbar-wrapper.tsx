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
        const { data: { user } } = await supabase.auth.getUser()
        setUserEmail(user?.email)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return <Navbar userEmail={userEmail} />
}
