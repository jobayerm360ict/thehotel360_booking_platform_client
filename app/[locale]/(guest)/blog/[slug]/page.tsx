import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  ChevronRight,
  Compass,
  CheckCircle2,
  ArrowRight,
  Building2,
  Heart,
} from "lucide-react";
import type { BlogPost } from "@/data/blogs";
import { baseURL } from "@/constants/request";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/BlogCard";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const response = await fetch(baseURL + '/blogs/' + encodeURIComponent(slug), { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Unable to load journal post');
  const post = (await response.json()).data as BlogPost;

  if (!post) {
    notFound();
  }

  const relatedResponse = await fetch(baseURL + '/blogs', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  const relatedPosts = relatedResponse.ok ? ((await relatedResponse.json()).data as BlogPost[]).filter(p => p.slug !== slug && p.category === post.category).slice(0,3) : [];

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 pb-20">
      {/* Top Header Progress / Breadcrumb Bar */}
      <div className="border-b border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md sticky top-20 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-neutral-600 hover:text-brand-primary dark:text-neutral-400 dark:hover:text-brand-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-sans text-neutral-400">
              Share Story:
            </span>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition"
              title="Bookmark story"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition"
              title="Share story"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Article Meta Header */}
        <div className="space-y-5 text-center sm:text-left">
          {/* Category & Read Time */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <Badge className="bg-brand-primary text-white border-none text-xs font-sans font-semibold px-3 py-1">
              {post.category}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs font-sans text-neutral-500 dark:text-neutral-400">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAt}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-sans text-neutral-500 dark:text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            {post.title}
          </h1>

          {/* Subtitle / Excerpt */}
          <p className="font-serif text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author Byline */}
          <div className="pt-4 border-t border-neutral-200/70 dark:border-neutral-800 flex items-center justify-center sm:justify-start gap-4">
            <Avatar className="w-12 h-12 border-2 border-brand-primary/20">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="font-sans font-bold text-sm text-neutral-900 dark:text-white">
                {post.author.name}
              </p>
              <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
                {post.author.role}
              </p>
            </div>
          </div>
        </div>

        {/* Cover Image Hero */}
        <div className="mt-8 sm:mt-10 rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-md">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-72 sm:h-[450px] object-cover"
          />
        </div>

        {/* Key Highlights / Takeaways Box */}
        {post.highlights && post.highlights.length > 0 && (
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-brand-primary-light/40 dark:bg-rose-950/20 border border-brand-primary/20 dark:border-brand-primary/30 space-y-3">
            <div className="flex items-center gap-2 text-brand-primary font-heading font-bold text-sm uppercase tracking-wider">
              <span>Sanctuary Curations & Key Highlights</span>
            </div>
            <ul className="space-y-2.5 pt-1">
              {post.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-serif text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-normal leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Body Content */}
        <div className="mt-10 sm:mt-12 space-y-8 font-serif text-base sm:text-lg text-neutral-800 dark:text-neutral-200 font-light leading-relaxed">
          {/* Intro Paragraph */}
          <p className="text-lg sm:text-xl text-neutral-900 dark:text-neutral-100 font-normal leading-relaxed first-letter:text-5xl first-letter:font-heading first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-brand-primary">
            {post.content.intro}
          </p>

          {/* Structured Sections */}
          {post.content.sections.map((section, idx) => (
            <div key={idx} className="space-y-6 pt-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white pt-2">
                {section.heading}
              </h2>

              {section.body.map((p, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {p}
                </p>
              ))}

              {section.image && (
                <figure className="my-8 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800">
                  <img
                    src={section.image}
                    alt={section.heading}
                    className="w-full h-72 sm:h-96 object-cover"
                  />
                  {section.imageCaption && (
                    <figcaption className="p-3 text-center text-xs font-sans text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900">
                      {section.imageCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {section.quote && (
                <blockquote className="my-8 p-6 sm:p-8 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900 border-l-4 border-brand-primary text-neutral-900 dark:text-white font-serif italic text-lg sm:text-xl leading-relaxed">
                  “{section.quote}”
                </blockquote>
              )}
            </div>
          ))}

          {/* Conclusion */}
          <div className="pt-6 border-t border-neutral-200/60 dark:border-neutral-800 space-y-4">
            <h3 className="font-heading text-xl font-bold text-neutral-900 dark:text-white">
              Planning Your Stay
            </h3>
            <p className="leading-relaxed">{post.content.conclusion}</p>
          </div>
        </div>

        {/* Tags & Share */}
        <div className="mt-12 pt-6 border-t border-neutral-200/70 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider mr-1">
              TAGS:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-sans font-medium text-neutral-700 dark:text-neutral-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 text-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Article</span>
            </Button>
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="w-16 h-16 shrink-0 border-2 border-brand-primary">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h4 className="font-heading font-bold text-base text-neutral-900 dark:text-white">
                Written by {post.author.name}
              </h4>
              <span className="text-xs font-sans text-brand-primary font-semibold">
                {post.author.role}
              </span>
            </div>
            <p className="font-serif text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
              {post.author.bio ||
                "Staff writer and travel curator at Travistay Journal."}
            </p>
          </div>
        </div>

        {/* Sanctuary Booking Callout Banner */}
        <div className="mt-12 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-brand-primary-light">
                <Compass className="w-4 h-4" />
                <span>EXPERIENCE THIS DESTINATION</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                Reserve Your Stay in{" "}
                {post.tags[post.tags.length - 1] || "Paradise"}
              </h3>
              <p className="font-serif text-xs sm:text-sm text-neutral-300 font-light max-w-md">
                Browse our verified sanctuaries, private villas, and heritage
                estates with 24/7 concierge support.
              </p>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold tracking-wide transition shadow-lg shrink-0 hover:scale-105 active:scale-95"
            >
              <span>Explore Sanctuaries</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-neutral-200/70 dark:border-neutral-800 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-brand-secondary">
                  RECOMMENDED STORIES
                </span>
                <h3 className="font-heading text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  More From the Travistay Journal
                </h3>
              </div>

              <Link
                href="/blog"
                className="text-xs font-sans font-bold text-brand-primary hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {relatedPosts.map((rPost) => (
                <BlogCard key={rPost.id} post={rPost} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
