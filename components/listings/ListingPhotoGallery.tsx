"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Check,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  Image as ImageIcon,
  Download,
  Eye,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ListingPhotoGalleryProps {
  images: string[];
  title: string;
}

export function ListingPhotoGallery({ images, title }: ListingPhotoGalleryProps) {
  const { isBengali } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"viewer" | "grid">("viewer");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [mobileSlideIdx, setMobileSlideIdx] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Touch swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const safeImages = images && images.length > 0 ? images : ["/placeholder.jpg"];

  useEffect(() => {
    setMounted(true);
  }, []);

  const openLightboxAt = (index: number, mode: "viewer" | "grid" = "viewer") => {
    setActivePhotoIdx(index);
    setViewMode(mode);
    setZoomLevel(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setLightboxOpen(false);
    setZoomLevel(1);
  };

  const showNextPhoto = useCallback(() => {
    setZoomLevel(1);
    setActivePhotoIdx((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const showPrevPhoto = useCallback(() => {
    setZoomLevel(1);
    setActivePhotoIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleDoubleTapZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 2 : 1));
  };

  const handleDownload = () => {
    const currentImg = safeImages[activePhotoIdx];
    const link = document.createElement("a");
    link.href = currentImg;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-photo-${activePhotoIdx + 1}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbnailContainerRef.current) return;
    const activeEl = thumbnailContainerRef.current.children[activePhotoIdx] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activePhotoIdx]);

  // Sync fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard navigation & lock scroll
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        showNextPhoto();
      } else if (e.key === "ArrowLeft") {
        showPrevPhoto();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      } else if (e.key === "f" || e.key === "F") {
        toggleNativeFullscreen();
      } else if (e.key === "g" || e.key === "G") {
        setViewMode((prev) => (prev === "viewer" ? "grid" : "viewer"));
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, showNextPhoto, showPrevPhoto]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 50) {
      showNextPhoto();
    } else if (distance < -50) {
      showPrevPhoto();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Fullscreen Modal JSX rendered via React Portal directly into body
  const lightboxModal = mounted && lightboxOpen ? createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 top-0 left-0 w-screen h-screen w-full h-[100dvh] z-[999999] bg-black/98 backdrop-blur-2xl flex flex-col justify-between select-none overflow-hidden m-0 p-0"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Top Bar / Header Controls */}
      <div className="w-full flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 text-white z-50 shrink-0 bg-neutral-950/90 backdrop-blur-md">
        {/* Left: Close Button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={closeLightbox}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-semibold cursor-pointer shrink-0 border border-white/10 text-white"
            title={isBengali ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
          >
            <X className="w-4 h-4" />
            <span>{isBengali ? "বন্ধ করুন" : "Close"}</span>
          </button>

          <span className="hidden md:inline-block text-xs text-neutral-300 font-medium truncate max-w-xs xl:max-w-md">
            {title}
          </span>
        </div>

        {/* Middle: Mode Switcher (Viewer vs All Photos Grid) */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode("viewer")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              viewMode === "viewer"
                ? "bg-brand-primary text-white shadow-md"
                : "text-neutral-300 hover:text-white"
            }`}
            title="Single Image Cinema View"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBengali ? "ভিউয়ার" : "Cinema"}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              viewMode === "grid"
                ? "bg-brand-primary text-white shadow-md"
                : "text-neutral-300 hover:text-white"
            }`}
            title="All Photos Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBengali ? "সব ছবি" : "All Photos"}</span>
          </button>
        </div>

        {/* Right: Actions Toolbar */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls (Active in viewer mode) */}
          {viewMode === "viewer" && (
            <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white transition cursor-pointer"
                title={isBengali ? "ছোট করুন (-)" : "Zoom Out (-)"}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 text-[11px] font-bold text-neutral-300 hover:text-white transition cursor-pointer"
                title={isBengali ? "রিসেট (0)" : "Reset Zoom (0)"}
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white transition cursor-pointer"
                title={isBengali ? "বড় করুন (+)" : "Zoom In (+)"}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Native Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleNativeFullscreen}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 text-white border border-white/10"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">
              {isFullscreen
                ? isBengali
                  ? "স্বাভাবিক"
                  : "Exit Full"
                : isBengali
                  ? "ফুলস্ক্রিন"
                  : "Fullscreen"}
            </span>
          </button>

          {/* Download photo */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 text-white border border-white/10"
            title={isBengali ? "ছবি ডাউনলোড করুন" : "Download photo"}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isBengali ? "ডাউনলোড" : "Save"}</span>
          </button>

          {/* Share link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 text-white border border-white/10"
            title={isBengali ? "লিংক শেয়ার করুন" : "Share link"}
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 hidden md:inline">
                  {isBengali ? "কপি হয়েছে!" : "Copied!"}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isBengali ? "শেয়ার" : "Share"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= MODE 1: CINEMA / FULLSCREEN VIEWER ================= */}
      {viewMode === "viewer" ? (
        <>
          {/* Main Photo Canvas occupying 100vw and viewport height */}
          <div
            className="relative flex-1 w-full h-full flex items-center justify-center p-3 sm:p-6 overflow-hidden min-h-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Navigation Arrow */}
            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={showPrevPhoto}
                className="absolute left-4 sm:left-8 z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md shadow-2xl"
                aria-label="Previous photo"
                title={isBengali ? "আগের ছবি (Arrow Left)" : "Previous (Arrow Left)"}
              >
                <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Huge Photo Display Frame */}
            <div
              onDoubleClick={handleDoubleTapZoom}
              className="relative w-full h-full max-w-[95vw] max-h-[78vh] sm:max-h-[82vh] flex items-center justify-center cursor-zoom-in overflow-hidden select-none"
              title={isBengali ? "ডাবল ক্লিক করে বড়/ছোট করুন" : "Double-click to zoom in/out"}
            >
              <div
                className="relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  key={activePhotoIdx}
                  src={safeImages[activePhotoIdx]}
                  alt={`${title} - Photo ${activePhotoIdx + 1}`}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain drop-shadow-2xl transition-opacity duration-300 rounded-lg"
                />
              </div>
            </div>

            {/* Right Navigation Arrow */}
            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={showNextPhoto}
                className="absolute right-4 sm:right-8 z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md shadow-2xl"
                aria-label="Next photo"
                title={isBengali ? "পরের ছবি (Arrow Right)" : "Next (Arrow Right)"}
              >
                <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Counter & Hint Pill at bottom center */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/85 backdrop-blur-md border border-white/15 px-5 py-2 rounded-full text-white text-xs font-semibold flex items-center gap-3 shadow-2xl z-20">
              <span className="font-bold">
                {activePhotoIdx + 1} / {safeImages.length}
              </span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="hidden sm:inline text-neutral-300 font-normal">
                {isBengali
                  ? "কীবোর্ড অ্যারো বা সোয়াইপ করুন"
                  : "Use ← → keys or swipe"}
              </span>
            </div>
          </div>

          {/* Bottom Thumbnail Strip */}
          {safeImages.length > 1 && (
            <div className="w-full px-4 sm:px-8 py-3.5 border-t border-white/10 shrink-0 overflow-x-auto no-scrollbar bg-neutral-950/90 backdrop-blur-md">
              <div
                ref={thumbnailContainerRef}
                className="flex items-center gap-2.5 sm:gap-3 max-w-6xl mx-auto min-w-max justify-start md:justify-center"
              >
                {safeImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActivePhotoIdx(idx);
                      setZoomLevel(1);
                    }}
                    className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer ${
                      activePhotoIdx === idx
                        ? "ring-3 ring-brand-primary scale-105 opacity-100 shadow-xl"
                        : "opacity-40 hover:opacity-85 hover:scale-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-bold">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ================= MODE 2: ALL PHOTOS GRID / WALL ================= */
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                {isBengali ? "সকল ফটো গ্যালারি" : "All Photos Gallery"}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                {isBengali
                  ? `মোট ${safeImages.length}টি হাই-রেজোলিউশন ফটো`
                  : `${safeImages.length} high-resolution captures`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("viewer")}
              className="px-5 py-2.5 rounded-full bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover transition shadow-md cursor-pointer"
            >
              {isBengali ? "ভিউয়ারে দেখুন" : "Back to Viewer"}
            </button>
          </div>

          {/* Photo Masonry / Adaptive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pb-16">
            {safeImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActivePhotoIdx(idx);
                  setViewMode("viewer");
                  setZoomLevel(1);
                }}
                className="group relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer shadow-xl hover:border-brand-primary transition-all duration-300"
              >
                <Image
                  src={img}
                  alt={`${title} - Gallery Photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/70 backdrop-blur-md">
                    Photo {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {isBengali ? "বড় করুন" : "Enlarge"}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative my-6">
      {/* ================= MOBILE VIEW (< md): Interactive Carousel ================= */}
      <div className="block md:hidden relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900 group">
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={() => openLightboxAt(mobileSlideIdx, "viewer")}
        >
          <Image
            src={safeImages[mobileSlideIdx] || safeImages[0]}
            alt={`${title} - Photo ${mobileSlideIdx + 1}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Quick Click Hint Overlay */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
            <Eye className="w-3.5 h-3.5 text-brand-primary" />
            <span>{isBengali ? "ফুলস্ক্রিন দেখতে ট্যাপ করুন" : "Tap for Fullscreen"}</span>
          </div>
        </div>

        {/* Mobile Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSlideIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md text-neutral-900 dark:text-white flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSlideIdx((prev) => (prev + 1) % safeImages.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md text-neutral-900 dark:text-white flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
          <span>
            {mobileSlideIdx + 1} / {safeImages.length}
          </span>
        </div>

        {/* Dots Indicators */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {safeImages.slice(0, 7).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileSlideIdx(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  mobileSlideIdx === idx
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= DESKTOP VIEW (md+): Adaptive Collage Grid ================= */}
      <div className="hidden md:block">
        {safeImages.length >= 5 ? (
          <div className="grid grid-cols-4 gap-2.5 rounded-3xl overflow-hidden h-[420px] lg:h-[480px]">
            {/* Main Photo (Spans 2 columns) */}
            <div
              onClick={() => openLightboxAt(0, "viewer")}
              className="col-span-2 relative h-full w-full bg-neutral-200 dark:bg-neutral-800 group overflow-hidden cursor-pointer"
              title={isBengali ? "ফুলস্ক্রিনে বড় করে দেখুন" : "Click to view full screen"}
            >
              <Image
                src={safeImages[0]}
                alt={`${title} - Photo 1`}
                fill
                priority
                sizes="(max-width: 1200px) 50vw, 600px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="px-3.5 py-2 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 shadow-lg scale-95 group-hover:scale-100 transition-all">
                  <Maximize2 className="w-3.5 h-3.5 text-brand-primary" />
                  {isBengali ? "বড় করে দেখুন" : "Enlarge Fullscreen"}
                </span>
              </div>
            </div>

            {/* Middle 2 Photos */}
            <div className="grid grid-rows-2 gap-2.5 h-full">
              <div
                onClick={() => openLightboxAt(1, "viewer")}
                className="relative h-full w-full bg-neutral-200 dark:bg-neutral-800 group overflow-hidden cursor-pointer"
                title={isBengali ? "ফুলস্ক্রিনে বড় করে দেখুন" : "Click to view full screen"}
              >
                <Image
                  src={safeImages[1]}
                  alt={`${title} - Photo 2`}
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-5 h-5 text-white drop-shadow-md scale-90 group-hover:scale-100 transition-all" />
                </div>
              </div>
              <div
                onClick={() => openLightboxAt(2, "viewer")}
                className="relative h-full w-full bg-neutral-200 dark:bg-neutral-800 group overflow-hidden cursor-pointer"
                title={isBengali ? "ফুলস্ক্রিনে বড় করে দেখুন" : "Click to view full screen"}
              >
                <Image
                  src={safeImages[2]}
                  alt={`${title} - Photo 3`}
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-5 h-5 text-white drop-shadow-md scale-90 group-hover:scale-100 transition-all" />
                </div>
              </div>
            </div>

            {/* Right 2 Photos */}
            <div className="grid grid-rows-2 gap-2.5 h-full">
              <div
                onClick={() => openLightboxAt(3, "viewer")}
                className="relative h-full w-full bg-neutral-200 dark:bg-neutral-800 group overflow-hidden cursor-pointer"
                title={isBengali ? "ফুলস্ক্রিনে বড় করে দেখুন" : "Click to view full screen"}
              >
                <Image
                  src={safeImages[3]}
                  alt={`${title} - Photo 4`}
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-5 h-5 text-white drop-shadow-md scale-90 group-hover:scale-100 transition-all" />
                </div>
              </div>
              <div
                onClick={() => openLightboxAt(4, "viewer")}
                className="relative h-full w-full bg-neutral-200 dark:bg-neutral-800 group overflow-hidden cursor-pointer"
                title={isBengali ? "ফুলস্ক্রিনে বড় করে দেখুন" : "Click to view full screen"}
              >
                <Image
                  src={safeImages[4]}
                  alt={`${title} - Photo 5`}
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-5 h-5 text-white drop-shadow-md scale-90 group-hover:scale-100 transition-all" />
                </div>
              </div>
            </div>
          </div>
        ) : safeImages.length === 3 || safeImages.length === 4 ? (
          <div className="grid grid-cols-3 gap-2.5 rounded-3xl overflow-hidden h-[420px] lg:h-[480px]">
            {/* Main Photo (Spans 2 columns) */}
            <div
              onClick={() => openLightboxAt(0, "viewer")}
              className="col-span-2 relative h-full w-full bg-neutral-200 dark:bg-neutral-800 group overflow-hidden cursor-pointer"
            >
              <Image
                src={safeImages[0]}
                alt={`${title} - Photo 1`}
                fill
                priority
                sizes="(max-width: 1200px) 66vw, 800px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="px-3.5 py-2 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5 text-brand-primary" />
                  {isBengali ? "বড় করে দেখুন" : "Enlarge Fullscreen"}
                </span>
              </div>
            </div>

            {/* Side Photos */}
            <div className={`grid ${safeImages.length === 4 ? "grid-rows-3" : "grid-rows-2"} gap-2.5 h-full`}>
              {safeImages.slice(1).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightboxAt(idx + 1, "viewer")}
                  className="relative h-full w-full bg-neutral-200 dark:bg-neutral-800 group overflow-hidden cursor-pointer"
                >
                  <Image
                    src={img}
                    alt={`${title} - Photo ${idx + 2}`}
                    fill
                    sizes="33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : safeImages.length === 2 ? (
          <div className="grid grid-cols-2 gap-2.5 rounded-3xl overflow-hidden h-[420px] lg:h-[480px]">
            {safeImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightboxAt(idx, "viewer")}
                className="relative h-full w-full bg-neutral-200 dark:bg-neutral-800 group overflow-hidden cursor-pointer"
              >
                <Image
                  src={img}
                  alt={`${title} - Photo ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  sizes="50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => openLightboxAt(0, "viewer")}
            className="relative rounded-3xl overflow-hidden h-[420px] lg:h-[480px] bg-neutral-200 dark:bg-neutral-800 group cursor-pointer"
          >
            <Image
              src={safeImages[0]}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="px-3.5 py-2 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
                <Maximize2 className="w-3.5 h-3.5 text-brand-primary" />
                {isBengali ? "বড় করে দেখুন" : "Enlarge Fullscreen"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Show All Photos Button */}
      <button
        type="button"
        onClick={() => openLightboxAt(0, "grid")}
        className="absolute bottom-4 right-4 bg-white/95 dark:bg-neutral-900/95 hover:bg-white text-neutral-900 dark:text-white px-4 py-2.5 rounded-2xl shadow-xl border border-neutral-200/90 dark:border-neutral-700 text-xs font-bold backdrop-blur-md flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer z-10"
      >
        <LayoutGrid className="w-4 h-4 text-brand-primary" />
        <span>
          {isBengali
            ? `সব ছবি দেখুন (${safeImages.length})`
            : `Show all ${safeImages.length} photos`}
        </span>
      </button>

      {/* Render Portal Lightbox */}
      {lightboxModal}
    </div>
  );
}
