import React from "react";
import { HomeCategorySections } from "@/components/listings/HomeCategorySections";
import { DestinationExploreSection } from "@/components/home/DestinationExploreSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { DownloadAppSection } from "@/components/home/DownloadAppSection";
import { FaqSection } from "@/components/home/FaqSection";
import { BlogSection } from "@/components/home/BlogSection";

export default function Home() {
  return (
    <div className="flex-1 bg-[#fcfbf9] dark:bg-neutral-950 pb-12 space-y-4 sm:space-y-6">
      <HomeCategorySections />
      <DestinationExploreSection />
      <WhyChooseUs />
      <DownloadAppSection />
      <FaqSection />
      <BlogSection />
    </div>
  );
}
