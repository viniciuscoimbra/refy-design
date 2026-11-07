import type { ContentCardProps } from '../components/PropertyCard';

/** Local, neutral artwork used only by the catalog. */
export function sampleArtwork(color = '#c7d9ce', width = 1200, height = 800) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${color}"/><rect x="240" y="110" width="720" height="580" rx="16" fill="#fafbf8"/><rect x="300" y="170" width="280" height="340" rx="8" fill="#254e3e"/><circle cx="440" cy="305" r="86" fill="${color}"/><path d="M354 430h172" stroke="#fafbf8" stroke-width="8"/><path d="M630 194h256m-256 40h182m-182 80h256m-256 32h256m-256 32h210m-210 132h220M300 570h586m-586 32h380" stroke="#91a69a" stroke-width="12" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
export const sampleContent: ContentCardProps = {
  title: 'Collaboration guide', subtitle: 'Reference collection · updated today', value: '12 files',
  media: [{ src: sampleArtwork(), alt: 'Preview of a guide with an editorial layout' }, { src: sampleArtwork('#cbd4e4'), alt: 'Second version of the layout' }, { src: sampleArtwork('#e5d5bd'), alt: 'Third version of the layout' }],
  badges: [{ label: 'New', tone: 'info' }, { label: 'Available', tone: 'success' }],
  facts: [{ label: 'Format', value: 'PDF and images' }, { label: 'Size', value: '24 MB' }, { label: 'Version', value: '1.2' }],
  summary: 'References and guidelines to organize work and share decisions with the team.',
};
