"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import { BlogPost } from "@/data/blogs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlogCardProps {
  post: BlogPost;
  className?: string;
  compact?: boolean;
}

export function BlogCard({ post, className, compact = false }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col h-full rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs hover:shadow-xl hover:border-brand-primary/40 transition-all duration-300 hover:-translate-y-1 ${
        className || ""
      }`}
    >
      {/* Cover Image with 16/10 aspect ratio */}
      <div className={`relative ${compact ? "aspect-[16/10]" : "aspect-[16/10] sm:aspect-[16/10]"} w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800`}>
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Subtle Bottom Gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Category Badge Top-Left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold tracking-wide bg-white/95 dark:bg-neutral-900/90 text-brand-primary dark:text-brand-primary-light backdrop-blur-md shadow-xs border border-white/30 dark:border-neutral-700/40">
            {post.category}
          </span>
        </div>

        {/* Read Time Badge Top-Right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium text-white bg-black/50 backdrop-blur-md">
            <Clock className="w-2.5 h-2.5" />
            <span>{post.readTime}</span>
          </span>
        </div>
      </div>

      {/* Card Body - compact, balanced padding */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Published Date */}
          <div className="text-[10px] sm:text-[11px] font-sans font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            {post.publishedAt}
          </div>

          {/* Title */}
          <h4 className="font-heading font-bold text-sm sm:text-[15px] text-neutral-900 dark:text-neutral-100 group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h4>

          {/* Excerpt */}
          <p className="font-serif text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        </div>

        {/* Footer: Author & Read Action */}
        <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6 shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="text-[10px]">{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-sans font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {post.author.name}
            </span>
          </div>

          <span className="text-xs font-sans font-bold text-brand-primary flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <span>Read</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
