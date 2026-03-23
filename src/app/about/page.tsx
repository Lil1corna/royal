import AboutClient from './about-client'
import AboutSection from '@/components/about-section'

export default function AboutPage() {
  return (
    <>
      {/* Cinematic About Section at Top */}
      <AboutSection />
      
      {/* Full About Page Content */}
      <AboutClient
        stats={[
          { id: 'years', value: 25, numberSuffix: '+', labelKey: 'yearsExp' },
          { id: 'customers', value: 10000, numberSuffix: '+', labelKey: 'happyCustomers' },
          { id: 'models', value: 50, numberSuffix: '+', labelKey: 'matrasModels' },
          { id: 'warranty', value: 2, numberSuffix: ' il', labelKey: 'warranty' },
        ]}
      />
    </>
  )
}
