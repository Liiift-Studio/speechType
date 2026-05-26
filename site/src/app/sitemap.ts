// speechType/site/src/app/sitemap.ts — sitemap for speechtype.com
import type { MetadataRoute } from 'next'

/** Static sitemap for speechtype.com */
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://speechtype.com',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 1,
		},
	]
}
