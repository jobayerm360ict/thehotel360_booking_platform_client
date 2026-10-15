import React from "react";
import { LocaleSync } from "@/components/layout/LocaleSync";
import { Language } from "@/store/slices/languageSlice";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "bn" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale: Language = resolvedParams.locale === "bn" ? "bn" : "en";

  return (
    <>
      <LocaleSync locale={locale} />
      {children}
    </>
  );
}
