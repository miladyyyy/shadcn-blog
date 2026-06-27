export const encodeTagSlug = (tag: string) => encodeURIComponent(tag)

export const decodeTagSlug = (slug: string) => {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export const getTagHref = (tag: string) => `/tags/${encodeTagSlug(tag)}`
