import type { MockLocale } from "@/mock/types";

export type QueryValues = Record<string, string | string[] | undefined>;

export function getLocale(value: string | string[] | undefined): MockLocale {
  const locale = Array.isArray(value) ? value[0] : value;
  return locale === "en" ? "en" : "ar";
}

export function createLocaleHref(
  path: string,
  query: QueryValues,
  locale: MockLocale,
): string {
  const hashIndex = path.indexOf("#");
  const pathname = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  params.set("lang", locale);
  return `${pathname}?${params.toString()}${hash}`;
}
