export const site = {
  name: 'Your Name',
  role: 'Frontend Developer / Web Developer',
  email: 'hello@example.com',
  githubUrl: 'https://github.com/your-username',
  linkedinUrl: 'https://www.linkedin.com/in/your-profile',
  instagramUrl: 'https://www.instagram.com/your-profile',
  /**
   * Production origin without a trailing slash, for example "https://example.com".
   * Leave empty until the canonical domain is known. DocumentMeta emits a
   * canonical link only when this value is set.
   */
  siteUrl: '',
  description:
    'Portfolio of a frontend developer working with React, Laravel, Shopify, and e-commerce.',
  focus: ['React', 'Laravel', 'Shopify', 'E-commerce'],
} as const;
