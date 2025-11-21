import { PerformancePageContent } from '@/components/pages/PerformancePageContent'
import { SeoJsonLd } from '@/components/SeoJsonLd'
import { breadcrumbListJsonLd, createPageMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata = createPageMetadata({
  title: 'Performance Dashboard | Eventura',
  description: 'Monitor Core Web Vitals and ensure Eventura stays in the “Good” range for all SEO-critical metrics.',
  path: '/performance',
  keywords: ['core web vitals', 'performance dashboard', 'Eventura performance'],
})

export default function PerformancePage() {
  return (
    <>
      <SeoJsonLd
        data={breadcrumbListJsonLd([
          { name: 'Home', item: siteConfig.url },
          { name: 'Performance', item: `${siteConfig.url}/performance` },
        ])}
      />
      <PerformancePageContent />
    </>
  )
}
