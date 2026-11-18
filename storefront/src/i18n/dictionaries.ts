import arabic from "./ar.json";
import english from "./en.json";
import type { MockLocale } from "@/mock/types";

export type Dictionary = typeof arabic;

const dictionaries: Record<MockLocale, Dictionary> = {
  ar: arabic,
  en: english,
};

export function getDictionary(locale: MockLocale): Dictionary {
  return dictionaries[locale];
}
