import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppRoutes } from './routes'
import { stories } from './stories'

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>
  )
}

export function getStories() {
  return stories.map(s => ({ id: s.id, title: s.title, description: s.description }))
}

// Re-exported so the build-time prerender resolves SEO from the same source as
// the runtime <Seo /> component.
export { getSeo } from './lib/seo'
