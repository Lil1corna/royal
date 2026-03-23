'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from './navbar'

export default function NavbarWrapper() {
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)
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
