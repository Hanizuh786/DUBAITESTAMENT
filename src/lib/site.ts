const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dubaitestament.nl";

export const siteUrl = new URL(configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`);
