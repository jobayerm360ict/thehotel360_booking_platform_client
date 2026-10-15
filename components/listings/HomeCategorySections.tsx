"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { MAIN_CATEGORIES } from "@/data/categories";
import { MainCategoryBar } from "@/components/layout/MainCategoryBar";
import { SubCategorySlider } from "./SubCategorySlider";

export function HomeCategorySections() {
  const allListings = useAppSelector((state) => state.listings.items);
  const [activeCategory, setActiveCategory] = useState<
    "apartments" | "rooms" | "hotels"
  >("rooms");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right",
  );

  const currentCategoryConfig =
    MAIN_CATEGORIES.find((c) => c.id === activeCategory) || MAIN_CATEGORIES[1];

  const handleCategorySelect = (
    newCategory: "apartments" | "rooms" | "hotels",
  ) => {
    if (newCategory === activeCategory) return;
    const oldIndex = MAIN_CATEGORIES.findIndex((c) => c.id === activeCategory);
    const newIndex = MAIN_CATEGORIES.findIndex((c) => c.id === newCategory);

    // Direction calculation: if moving rightwards (e.g. 0 -> 1 or 1 -> 2), slide in from right
    if (newIndex > oldIndex) {
      setSlideDirection("right");
    } else {
      setSlideDirection("left");
    }
    setActiveCategory(newCategory);
  };

  return (
    <div className="space-y-4">
      {/* 3 Main Categories Bar (Apartments, Rooms, Hotels) */}
      <MainCategoryBar
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Sub Category Sections Container with Directional Slide Animation */}
      <main
        key={activeCategory}
        className={`max-w-full mx-auto px-4 sm:px-6 lg:px-16 space-y-8 pb-16 ${
          slideDirection === "right"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        }`}
      >
        {currentCategoryConfig.subCategories.map((subCat) => {
          // Strictly filter listings for this main category & subcategory
          const matchingListings = allListings.filter((listing) => {
            // Must match the active main category
            const isMatchMain =
              listing.mainCategory === activeCategory ||
              (!listing.mainCategory &&
                ((activeCategory === "rooms" &&
                  (listing.specs.propertyType === "house" ||
                    listing.category === "rooms")) ||
                  (activeCategory === "apartments" &&
                    listing.specs.propertyType === "apartment") ||
                  (activeCategory === "hotels" &&
                    (listing.specs.propertyType === "villa" ||
                      listing.specs.propertyType === "mansion" ||
                      listing.category === "beachfront"))));

            if (!isMatchMain) return false;

            // Check subcategory match
            if (
              listing.subCategories &&
              listing.subCategories.includes(subCat.id)
            ) {
              return true;
            }

            // Subcategory heuristics
            if (subCat.id === "new-arrivals") return true;
            if (subCat.id === "budget-stays" && listing.pricePerNight < 60)
              return true;
            if (subCat.id === "ac-luxury" && listing.pricePerNight >= 25)
              return true;
            if (
              subCat.id === "attached-bath" &&
              listing.amenities.some((a) => a.toLowerCase().includes("bath"))
            )
              return true;
            if (subCat.id === "family-stays" && listing.specs.bedrooms >= 2)
              return true;
            if (
              subCat.id === "luxury-penthouses" &&
              listing.pricePerNight >= 100
            )
              return true;
            if (subCat.id === "luxury-suites" && listing.pricePerNight >= 100)
              return true;
            if (subCat.id === "city-center" || subCat.id === "boutique-resorts")
              return true;

            return false;
          });

          if (matchingListings.length === 0) return null;

          return (
            <SubCategorySlider
              key={`${activeCategory}-${subCat.id}`}
              title={subCat.label}
              description={subCat.description}
              listings={matchingListings}
            />
          );
        })}
      </main>
    </div>
  );
}
