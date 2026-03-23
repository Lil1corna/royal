import AboutClient from './about-client'

export default function AboutPage() {
  return (
    <AboutClient
      stats={[
        { id: 'years', value: 25, numberSuffix: '+', labelKey: 'yearsExp' },
        { id: 'customers', value: 10000, numberSuffix: '+', labelKey: 'happyCustomers' },
        { id: 'models', value: 50, numberSuffix: '+', labelKey: 'matrasModels' },
        { id: 'warranty', value: 2, numberSuffix: ' il', labelKey: 'warranty' },
      ]}
    />
  )
}

