import { useEffect } from 'react';
import { Platform } from 'react-native';

interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

/**
 * Hook para definir meta tags SEO dinamicamente na web
 * No native, não faz nada (não há meta tags em apps)
 */
export function useMetaTags(tags: MetaTags) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Title
    if (tags.title) {
      document.title = tags.title;
    }

    // Meta Description
    if (tags.description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', tags.description);
    }

    // Meta Keywords
    if (tags.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', tags.keywords);
    }

    // Open Graph Title
    if (tags.ogTitle) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', tags.ogTitle);
    }

    // Open Graph Description
    if (tags.ogDescription) {
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', tags.ogDescription);
    }

    // Open Graph Image
    if (tags.ogImage) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', tags.ogImage);
    }
  }, [tags.title, tags.description, tags.keywords, tags.ogTitle, tags.ogDescription, tags.ogImage]);
}
