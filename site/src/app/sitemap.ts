// speechType/site/src/app/sitemap.ts — sitemap for speechtype.vercel.app
import type { MetadataRoute } from 'next'

/** Static sitemap for speechtype.vercel.app */
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://speechtype.vercel.app',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 1,
		},
	]
}
