import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getSeo, OG_IMAGE_PATH, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from '@/lib/seo'

/** Create or update <meta>/<link> elements in <head> by a unique selector. */
function upsert(
  tag: 'meta' | 'link',
  attrs: Record<string, string>,
  keyAttr: string
) {
  const selector = `${tag}[${keyAttr}="${attrs[keyAttr]}"]`
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = document.createElement(tag)
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
}

function setJsonLd(jsonLd: Record<string, unknown>[]) {
  const existing = document.getElementById('seo-jsonld')
  if (existing) existing.remove()
  if (!jsonLd.length) return
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'seo-jsonld'
  script.textContent = JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd)
  document.head.appendChild(script)
}

/**
 * Runtime head manager. Keeps document title and SEO meta tags correct in dev
 * and during client-side navigation (the static prerender handles crawlers).
 * Renders nothing.
 */
export function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : undefined
    const seo = getSeo(pathname, origin)
    const ogImage = `${origin ?? ''}${OG_IMAGE_PATH}`

    document.title = seo.title

    upsert('meta', { name: 'description', content: seo.description }, 'name')
    upsert('link', { rel: 'canonical', href: seo.url }, 'rel')

    upsert('meta', { property: 'og:title', content: seo.title }, 'property')
    upsert('meta', { property: 'og:description', content: seo.description }, 'property')
    upsert('meta', { property: 'og:url', content: seo.url }, 'property')
    upsert('meta', { property: 'og:image', content: ogImage }, 'property')
    upsert('meta', { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) }, 'property')
    upsert('meta', { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) }, 'property')

    upsert('meta', { name: 'twitter:title', content: seo.title }, 'name')
    upsert('meta', { name: 'twitter:description', content: seo.description }, 'name')
    upsert('meta', { name: 'twitter:image', content: ogImage }, 'name')

    setJsonLd(seo.jsonLd)
  }, [pathname])

  return null
}
