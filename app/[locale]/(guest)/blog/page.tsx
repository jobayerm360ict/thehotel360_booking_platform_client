"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Clock, ArrowRight } from "lucide-react";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlogCard } from "@/components/blog/BlogCard";

export default function BlogIndexPage() {
  const { data: posts, loading, error, reload } = usePlatformData(platformService.blogs);
  const BLOG_POSTS = posts || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesQuery =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesCategory && matchesQuery;
  });

  const featuredPost =
    selectedCategory === "All" && !searchQuery
      ? BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0]
      : null;

  const displayList = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts;

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 pb-20">
      {/* Magazine Hero Header */}
      <section className="relative py-4 sm:py-8 md:py-12 border-b border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[11px] font-sans font-bold uppercase tracking-wider">
            <span>EDITORIAL & ARCHITECTURE JOURNAL</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-3xl mx-auto leading-tight">
            The Travistay Journal
          </h1>

          <p className="font-serif text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-light max-w-2xl mx-auto leading-relaxed">
            Stories of architectural wonder, secluded tea sanctuaries, culinary
            heritage, and thoughtful slow travel across Bangladesh.
          </p>

          {/* Search & Filter Input Bar */}
          <div className="max-w-md mx-auto pt-4 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics or destinations..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-[#fcfbf9] dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-sans text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition shadow-2xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Category Pills */}
        {!loading && !error && BLOG_POSTS.length > 0 && <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-sans font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/25 scale-[1.02]"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/70 dark:border-neutral-800 hover:border-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>}

        {loading && <p role="status" className="py-12 text-center text-sm text-neutral-500">Loading stories...</p>}
        {error && <p role="alert" className="py-12 text-center text-sm text-rose-600">Unable to load stories. <button type="button" onClick={reload} className="underline">Try again</button></p>}

        {/* Featured Big Story (When not searching) */}
        {featuredPost && (
          <div className="mb-10">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block relative rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[440px] overflow-hidden">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <Badge className="bg-brand-primary text-white border-none text-[11px] font-sans font-semibold px-3 py-1 shadow-xs">
                      {featuredPost.category}
                    </Badge>
                    <Badge className="bg-white/90 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 backdrop-blur-md border-none text-[11px] font-sans font-medium px-2.5 py-1">
                      Featured Cover Story
                    </Badge>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-sans text-neutral-400">
                      <span>{featuredPost.publishedAt}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>

                    <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white group-hover:text-brand-primary transition-colors leading-snug">
                      {featuredPost.title}
                    </h3>

                    <p className="font-serif text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {featuredPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-sans font-medium text-neutral-600 dark:text-neutral-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-neutral-200 dark:border-neutral-700">
                        <AvatarImage
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                        />
                        <AvatarFallback>
                          {featuredPost.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-sans font-bold text-neutral-900 dark:text-white">
                          {featuredPost.author.name}
                        </p>
                        <p className="text-[11px] font-sans text-neutral-400">
                          {featuredPost.author.role}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-brand-primary group-hover:translate-x-1 transition-transform">
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Results Counter if searching */}
        {!loading && !error && searchQuery && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-sans text-neutral-500">
              Showing{" "}
              <span className="font-bold text-neutral-900 dark:text-white">
                {filteredPosts.length}
              </span>{" "}
              articles matching &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-sans text-brand-primary hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Grid of Articles using shared BlogCard */}
        {!loading && !error && displayList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {displayList.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : !loading && !error && filteredPosts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="font-heading font-bold text-lg text-neutral-700 dark:text-neutral-300">
              {BLOG_POSTS.length ? "No stories match your search." : "No stories are published yet."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
