"use client";

import { createContext, useContext } from "react";

export const preferences = createContext({
  language: "es" as "es" | "en",
  effects: true,
});

export function usePreferences() {
  return useContext(preferences);
}

export type Bilingual = { es: string; en: string };

export function T(text: Bilingual) {
  return text[usePreferences().language];
}
