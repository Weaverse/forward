# Editorial image sources

Repository-owned record for every non-product editorial image used by the
Forward static demo. All images are Unsplash photos from the approved source
set, downloaded once, optimized to WebP, and served locally from
`public/images/editorial/`. Nothing is production-hotlinked.

## License

All photos are distributed under the [Unsplash License](https://unsplash.com/license):
free to use for commercial and non-commercial purposes, no permission needed,
attribution appreciated but not required. Photos may not be sold unmodified or
used to replicate Unsplash.

## Images

| Local file | Unsplash photo ID | Original source URL | Downloaded as | Route / role |
| --- | --- | --- | --- | --- |
| `hero-open-sky.webp` | `photo-1522163182402-834f871fd851` | https://images.unsplash.com/photo-1522163182402-834f871fd851 | `?w=2000&q=78&fm=webp&fit=max` (2000×1445) | `/` — climbing/open-sky home hero |
| `alpine-traverse.webp` | `photo-1551632811-561732d1e306` | https://images.unsplash.com/photo-1551632811-561732d1e306 | `?w=1800&q=70&fm=webp&fit=max` (1800×1201) | `/journal`, `/journal/[articleHandle]` — alpine traverse editorial lead |
| `camp-tent.webp` | `photo-1504280390367-361c6d9f38f4` | https://images.unsplash.com/photo-1504280390367-361c6d9f38f4 | `?w=2000&q=78&fm=webp&fit=max` (2000×1334) | `/journal/[articleHandle]`, `/shop/[collectionHandle]` — camp/tent scene |
| `mountain-ridges.webp` | `photo-1464822759023-fed622ff2c3b` | https://images.unsplash.com/photo-1464822759023-fed622ff2c3b | `?w=1800&q=72&fm=webp&fit=max` (1800×1200) | `/pages/[pageHandle]` (about), `/` — mountain ridge planes |
| `trail-movement.webp` | `photo-1551698618-1dfe5d97d256` | https://images.unsplash.com/photo-1551698618-1dfe5d97d256 | `?w=2000&q=78&fm=webp&fit=max` (2000×1333) | `/shop/[collectionHandle]`, `/` — trail movement |
| `campfire.webp` | `photo-1475483768296-6163e08872a1` | https://images.unsplash.com/photo-1475483768296-6163e08872a1 | `?w=2000&q=78&fm=webp&fit=max` (2000×1333) | `/journal` — campfire/camp evening scene |
| `hero-ridge-lookout.webp` | `photo-1542359649-31e03cd4d909` | https://images.unsplash.com/photo-1542359649-31e03cd4d909 (W T, Tatra Mountains, Poland) | `?w=3200&q=80&fm=webp&fit=max` (3200×2400) | `/` — home hero slide 1 (hiker on a ledge under a clear sky) |
| `hero-pack-climb.webp` | `photo-1511715885542-a3713331633d` | https://images.unsplash.com/photo-1511715885542-a3713331633d (Holly Mandarich, Gore Range, USA) | `?w=3200&q=80&fm=webp&fit=max` (3200×2133) | `/` — home hero slide 2 (hikers with packs on a sunny slope) |

The `Downloaded as` query string records the exact Unsplash CDN render used to
produce the local optimized WebP (single fetch at implementation time,
2026-08-05). Product imagery never uses stock photography — products use only
their own media from the Shopify store.
