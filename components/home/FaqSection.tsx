"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";

export function FaqSection() {
  const { data: categories, loading, error, reload } = usePlatformData(platformService.faqs);
  const { data: home, loading: homeLoading, error: homeError, reload: reloadHome } = usePlatformData(platformService.homeContent);
  const FAQ_CATEGORIES = categories || [];
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const totalQuestions = FAQ_CATEGORIES.reduce(
    (acc, cat) => acc + cat.questions.length,
    0,
  );

  const toggleCategory = (catId: string) => {
    if (expandedCategory === catId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(catId);
    }
  };

  const toggleQuestion = (qId: number) => {
    if (expandedQuestionId === qId) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(qId);
    }
  };

  return (
    <section className="relative py-10 sm:py-14 md:py-16 border-t border-neutral-200/60 dark:border-neutral-800 overflow-hidden">
      {/* Background Soft Glow in Brand-Primary */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[300px] bg-brand-primary/5 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Context, Lang Switcher & CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            {/* Badge & Language Toggle */}
            <div className="flex items-center justify-between">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[11px] font-sans font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                <span>{lang === "en" ? "BEFORE YOU BOOK" : "বুকিংয়ের পূর্বে"}</span>
              </div>

              {/* Language Switcher Pill */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-3 py-1 rounded-full text-xs font-sans font-bold transition-all duration-150 cursor-pointer ${
                    lang === "en"
                      ? "bg-white dark:bg-neutral-900 text-brand-primary shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("bn")}
                  className={`px-3 py-1 rounded-full text-xs font-sans font-bold transition-all duration-150 cursor-pointer ${
                    lang === "bn"
                      ? "bg-white dark:bg-neutral-900 text-brand-primary shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  বাং
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2.5">
              {homeLoading && <p role="status" className="text-sm text-neutral-500">Loading section details...</p>}
              {homeError && <p role="alert" className="text-sm text-rose-600">Unable to load section details. <button type="button" onClick={reloadHome} className="underline">Try again</button></p>}
              {home?.settings?.faqHeading && <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.2]">
                {home.settings.faqHeading[lang] || home.settings.faqHeading.en}
              </h2>}
              {home?.settings?.faqDescription && <p className="font-serif text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                {home.settings.faqDescription[lang] || home.settings.faqDescription.en}
              </p>}
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-sans font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md shadow-brand-primary/20 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{lang === "en" ? "See all FAQs" : "সব প্রশ্ন দেখুন"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Total Questions Counter */}
            <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800">
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                {totalQuestions} {lang === "en" ? "QUESTIONS" : "টি প্রশ্ন"}
              </span>
            </div>
          </div>

          {/* Right Column: Sleek Compact Category List */}
          <div className="lg:col-span-7 divide-y divide-neutral-200/70 dark:divide-neutral-800">
            {loading && <p role="status" className="py-4 text-sm text-neutral-500">Loading questions...</p>}
            {error && <p role="alert" className="py-4 text-sm text-rose-600">Unable to load questions. <button type="button" onClick={reload} className="underline">Try again</button></p>}
            {!loading && !error && FAQ_CATEGORIES.length === 0 && <p className="py-4 text-sm text-neutral-500">No questions are published yet.</p>}
            {!loading && !error && FAQ_CATEGORIES.map((category) => {
              const isCatOpen = expandedCategory === category.id;

              return (
                <div key={category.id} className="py-3 first:pt-0 last:pb-0">
                  {/* Category Header Row */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between py-2 text-left cursor-pointer group hover:text-brand-primary transition-colors"
                  >
                    <span
                      className={`font-heading text-sm sm:text-base font-bold transition-colors ${
                        isCatOpen
                          ? "text-brand-primary"
                          : "text-neutral-900 dark:text-white group-hover:text-brand-primary"
                      }`}
                    >
                      {category.title[lang]}
                    </span>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-sans font-semibold text-neutral-400 dark:text-neutral-500">
                        {category.questions.length}
                      </span>
                      {isCatOpen ? (
                        <ChevronUp className="w-4 h-4 text-brand-primary transition-transform" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-transform" />
                      )}
                    </div>
                  </button>

                  {/* Category Questions List (Compact Pill Style) */}
                  {isCatOpen && (
                    <div className="mt-2 space-y-2 pt-1 pb-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {category.questions.map((q) => {
                        const isQOpen = expandedQuestionId === q.id;

                        return (
                          <div
                            key={q.id}
                            className={`rounded-xl border transition-all duration-150 ${
                              isQOpen
                                ? "bg-brand-primary/5 dark:bg-brand-primary/10 border-brand-primary/30 p-3.5 shadow-2xs"
                                : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 p-3 hover:border-brand-primary/40 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
                            }`}
                          >
                            <div
                              onClick={() => toggleQuestion(q.id)}
                              className="flex items-center justify-between gap-3 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-sans font-bold text-[11px] text-neutral-400 shrink-0">
                                  {q.id < 10 ? `0${q.id}` : q.id}
                                </span>
                                <h4 className="font-heading font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                                  {q.question[lang]}
                                </h4>
                              </div>

                              <button
                                type="button"
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isQOpen
                                    ? "bg-brand-primary text-white"
                                    : "bg-brand-primary/10 text-brand-primary hover:scale-105"
                                }`}
                                aria-label="Toggle question"
                              >
                                {isQOpen ? (
                                  <Minus className="w-3 h-3" />
                                ) : (
                                  <Plus className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {/* Answer Area */}
                            {isQOpen && (
                              <div className="mt-2.5 pt-2.5 border-t border-brand-primary/15 animate-in fade-in duration-150">
                                <p className="font-serif text-xs text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                                  {q.answer[lang]}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
