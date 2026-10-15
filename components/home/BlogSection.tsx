"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { BlogCard } from "@/components/blog/BlogCard";

export function BlogSection() {
  const { data: posts, loading, error, reload } = usePlatformData(platformService.blogs);
  const { data: home, loading: homeLoading, error: homeError, reload: reloadHome } = usePlatformData(platformService.homeContent);
  const { locale } = useParams<{ locale: string }>();
  const language = locale === "bn" ? "bn" : "en";
  const BLOG_POSTS = posts || [];
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);
  const categories = ["All", ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))];

  const filteredPosts =
    selectedCategory === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.category === selectedCategory);

  const gridPosts = filteredPosts.slice(0, 6);

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubscriptionMessage("");
    setSubscriptionError("");
    try {
      await platformService.subscribe(email.trim().toLowerCase());
      setEmail("");
      setSubscriptionMessage("Your email has been received. Thank you!");
    } catch (cause) {
      setSubscriptionError((cause as { message?: string })?.message || "Unable to subscribe right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update scroll status & active index on scroll
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const cardWidth = 320; // approximate mobile card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveSlideIndex(Math.min(index, gridPosts.length - 1));
  };

  const scrollToDirection = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = 320;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToSlide = (index: number) => {
    if (!sliderRef.current) return;
    const cardWidth = 320;
    sliderRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  // Reset scroll position when category changes
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
      setActiveSlideIndex(0);
    }
  }, [selectedCategory]);

  return (
    <section className="relative py-8 sm:py-10 md:py-14 border-t border-neutral-200/60 dark:border-neutral-800 overflow-hidden bg-[#fcfbf9] dark:bg-neutral-950">
      {/* Soft Ambient Radial Glow */}
      <div className="absolute top-1/4 right-5 w-96 h-80 bg-brand-primary/5 blur-3xl pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-10 left-5 w-80 h-72 bg-brand-secondary/5 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-5 sm:mb-7">
          <div className="space-y-2 max-w-2xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[11px] font-sans font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-brand-primary" />
              <span>THE TRAVISTAY JOURNAL</span>
            </div>

            {homeLoading && <p role="status" className="text-sm text-neutral-500">Loading section details...</p>}
            {homeError && <p role="alert" className="text-sm text-rose-600">Unable to load section details. <button type="button" onClick={reloadHome} className="underline">Try again</button></p>}
            {home?.settings?.storiesHeading && <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.2]">
              {home.settings.storiesHeading[language] || home.settings.storiesHeading.en}
            </h2>}
            {home?.settings?.storiesDescription && <p className="font-serif text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              {home.settings.storiesDescription[language] || home.settings.storiesDescription.en}
            </p>}
          </div>

          {/* Action Header Controls: Mobile Slider Arrows + Explore All */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            {/* Mobile/Tablet Slider Navigation Arrows */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollToDirection("left")}
                disabled={!canScrollLeft}
                aria-label="Previous story"
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                  canScrollLeft
                    ? "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 shadow-xs"
                    : "border-neutral-200/50 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-40"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToDirection("right")}
                disabled={!canScrollRight}
                aria-label="Next story"
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                  canScrollRight
                    ? "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 active:scale-95 shadow-xs"
                    : "border-neutral-200/50 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-40"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Explore All Button */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-semibold bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800 hover:border-brand-primary hover:text-brand-primary dark:hover:text-brand-primary transition shadow-2xs hover:shadow-xs group"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-brand-primary" />
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        {!loading && !error && BLOG_POSTS.length > 0 && <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-brand-primary text-white shadow-xs shadow-brand-primary/25 scale-[1.02]"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/70 dark:border-neutral-800 hover:border-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>}

        {loading && <p role="status" className="py-8 text-center text-sm text-neutral-500">Loading stories...</p>}
        {error && <p role="alert" className="py-8 text-center text-sm text-rose-600">Unable to load stories. <button type="button" onClick={reload} className="underline">Try again</button></p>}
        {!loading && !error && gridPosts.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">{BLOG_POSTS.length ? "No stories match this category." : "No stories are published yet."}</p>}

        {/* Mobile Slide (Carousel) + Desktop Grid */}
        {!loading && !error && gridPosts.length > 0 && <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="w-full flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none py-1"
        >
          {gridPosts.map((post) => (
            <div
              key={post.id}
              className="w-[82vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-start flex flex-col"
            >
              <BlogCard post={post} compact={true} />
            </div>
          ))}
        </div>}

        {/* Mobile Dot Indicators */}
        {gridPosts.length > 1 && (
          <div className="flex md:hidden items-center justify-center gap-1.5 pt-3">
            {gridPosts.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlideIndex === idx
                    ? "w-5 bg-brand-primary"
                    : "w-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        )}

        {/* Bottom Bar: Newsletter Curations (Refined & Compact) */}
        <div className="mt-10 sm:mt-12 p-6 sm:p-8 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-900/90 border border-neutral-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/20 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-primary-light">
                TRAVISTAY UPDATES
              </span>
              {home?.settings?.subscriptionHeading && <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white">
                {home.settings.subscriptionHeading[language] || home.settings.subscriptionHeading.en}
              </h3>}
              {home?.settings?.subscriptionDescription && <p className="font-serif text-xs text-neutral-300 font-light max-w-lg">
                {home.settings.subscriptionDescription[language] || home.settings.subscriptionDescription.en}
              </p>}
            </div>

            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto items-center gap-2">
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                placeholder="Enter your email address..."
                className="w-full md:w-64 px-3.5 py-2.5 rounded-full bg-neutral-800/90 border border-neutral-700 text-xs font-sans text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-primary transition"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold tracking-wide transition shadow-sm shrink-0 cursor-pointer disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Subscribe"}
              </button>
            </form>
          </div>
          {subscriptionMessage && <p role="status" className="relative z-10 mt-3 text-center md:text-right text-xs text-emerald-300">{subscriptionMessage}</p>}
          {subscriptionError && <p role="alert" className="relative z-10 mt-3 text-center md:text-right text-xs text-rose-300">{subscriptionError}</p>}
        </div>
      </div>
    </section>
  );
}
