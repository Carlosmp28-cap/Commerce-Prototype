type WebHeadOptions = {
  title: string;
  description: string;
  canonicalHref?: string;
};

/** Web-only helpers for updating document head tags. */

function ensureMetaName(name: string) {
  let meta = document.querySelector(`meta[name='${name}']`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  return meta;
}

function ensureMetaProperty(property: string) {
  let meta = document.querySelector(`meta[property='${property}']`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  return meta;
}

function ensureCanonical() {
  let canonical = document.querySelector("link[rel='canonical']");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  return canonical;
}

/**
 * Applies Home page head tags on web.
 * @param title - Document title
 * @param description - Meta description
 * @param canonicalHref - Canonical URL (optional)
 */
export function applyWebHead({
  title,
  description,
  canonicalHref,
}: WebHeadOptions) {
  if (typeof document === "undefined") return;
  document.title = title;

  ensureMetaName("description").setAttribute("content", description);

  // Basic Open Graph tags for Lighthouse SEO audits.
  ensureMetaProperty("og:title").setAttribute("content", title);
  ensureMetaProperty("og:description").setAttribute("content", description);
  ensureMetaProperty("og:type").setAttribute("content", "website");

  if (canonicalHref) {
    ensureCanonical().setAttribute("href", canonicalHref);
  }
}
