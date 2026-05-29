import { stories } from '../stories'

/** Canonical production origin. The prerender may override the origin it bakes
 *  in via SITE_URL, but JSON-LD / canonical fall back to this. */
export const SITE_URL = 'https://vibecode-db.geekyants.com'
export const OG_IMAGE_PATH = '/og-image.png'
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 600

export interface SeoData {
  title: string
  description: string
  /** Path part, always starts with "/". */
  path: string
  /** Absolute canonical URL. */
  url: string
  /** JSON-LD structured-data objects for this page. */
  jsonLd: Record<string, unknown>[]
}

const LANDING_TITLE = 'Vibecode DB — The Frontend Database API Gateway'
const LANDING_DESC =
  'Build apps without waiting on a backend. Prototype instantly with runtime data, then connect to real backends (Supabase, Firebase, GraphQL, REST) without rewriting your front-end.'

const SITE_NAME = 'Vibecode DB'

const ORGANIZATION = {
  '@type': 'Organization',
  name: 'GeekyAnts',
  url: 'https://geekyants.com',
} as const

function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  // strip query/hash and trailing slash
  const clean = path.split(/[?#]/)[0]
  return clean.length > 1 && clean.endsWith('/') ? clean.slice(0, -1) : clean
}

/**
 * Resolve the SEO metadata for a given route. Shared by the runtime <Seo />
 * head manager and the build-time prerender so they never drift apart.
 */
export function getSeo(rawPath: string, baseUrl: string = SITE_URL): SeoData {
  const path = normalizePath(rawPath)
  const url = `${baseUrl}${path === '/' ? '/' : path}`
  const ogImage = `${baseUrl}${OG_IMAGE_PATH}`

  // ── Landing page ──────────────────────────────────────
  if (path === '/') {
    return {
      title: LANDING_TITLE,
      description: LANDING_DESC,
      path,
      url,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: `${baseUrl}/`,
          description: LANDING_DESC,
          publisher: ORGANIZATION,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web, iOS, Android',
          description: LANDING_DESC,
          url: `${baseUrl}/`,
          image: ogImage,
          author: ORGANIZATION,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      ],
    }
  }

  // ── Story (doc / example) page ────────────────────────
  const storyId = path.replace(/^\//, '')
  const story = stories.find((s) => s.id === storyId)

  if (story) {
    const title = `${story.title} - @vibecode-db/client`
    const description = story.description
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: story.category },
        { '@type': 'ListItem', position: 3, name: story.title, item: url },
      ],
    }

    if (story.type === 'doc') {
      return {
        title,
        description,
        path,
        url,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: story.title,
            description,
            url,
            image: ogImage,
            author: ORGANIZATION,
            publisher: ORGANIZATION,
            isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${baseUrl}/` },
          },
          breadcrumb,
        ],
      }
    }

    // example pages (runnable code snippets)
    return {
      title,
      description,
      path,
      url,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: story.title,
          description,
          url,
          codeSampleType: 'snippet',
          programmingLanguage: 'TypeScript',
          author: ORGANIZATION,
        },
        breadcrumb,
      ],
    }
  }

  // ── Fallback ──────────────────────────────────────────
  return {
    title: LANDING_TITLE,
    description: LANDING_DESC,
    path,
    url,
    jsonLd: [],
  }
}
