import meta from "../meta.json";

export const SITE = "https://www.ezekielspace.cc";
export const NAME = "Ezekiel Akinfenwa";

const PERSON_ID = `${SITE}/#person`;
const WEBSITE_ID = `${SITE}/#website`;

/**
 * Serialise a schema object for `<script type="application/ld+json">`.
 * Escaping `<` stops a title containing markup from closing the script tag early.
 */
export const toJsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

/** Profiles that actually are filled in — empty entries in meta.json are skipped. */
const sameAs = Object.values(meta.socials).filter(
  (url): url is string => typeof url === "string" && url.trim() !== "",
);

/** The author entity. Every other node references this by `@id`. */
export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: NAME,
  alternateName: "Ezekiel",
  url: `${SITE}/`,
  jobTitle: "Full Stack Software Engineer & Designer",
  description:
    "Software engineer based in Lagos, Nigeria, building in Go, TypeScript and SvelteKit.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
  knowsAbout: [
    "Go",
    "TypeScript",
    "SvelteKit",
    "Software Engineering",
    "Product Design",
    "Web Performance",
  ],
  sameAs,
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE}/`,
  name: NAME,
  description:
    "Essays on software engineering, AI tooling and building things for the fun of it.",
  author: { "@id": PERSON_ID },
  publisher: { "@id": PERSON_ID },
  inLanguage: "en",
};

interface BlogPostingInput {
  title: string;
  description?: string;
  date: Date;
  tags: string[];
  /** Root-relative, trailing-slashed path of the post. */
  path: string;
}

export const blogPostingSchema = ({
  title,
  description,
  date,
  tags,
  path,
}: BlogPostingInput) => {
  const url = new URL(path, SITE).href;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description,
    datePublished: date.toISOString(),
    // no revision tracking in the content collection yet, so the two agree
    dateModified: date.toISOString(),
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(tags.length > 0 ? { keywords: tags.join(", ") } : {}),
    inLanguage: "en",
  };
};

export const breadcrumbSchema = ({
  title,
  path,
}: {
  title: string;
  path: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Essays", item: `${SITE}/essays/` },
    { "@type": "ListItem", position: 3, name: title, item: new URL(path, SITE).href },
  ],
});
