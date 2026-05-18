export function getBrandName(): string {
  return process.env.NEXT_PUBLIC_BRAND_NAME ?? "ReuniCheck";
}

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

export function getAgencyUrl(): string {
  return process.env.NEXT_PUBLIC_AGENCY_URL ?? "/";
}

export function getAgendarUrl(linkId: string): string {
  return `${getBaseUrl()}/agendar/${linkId}`;
}
