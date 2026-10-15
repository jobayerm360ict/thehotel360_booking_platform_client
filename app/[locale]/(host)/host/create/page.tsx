"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createListing } from "@/store/slices/listingsSlice";

import { PropertyType, CreateListingDTO } from "@/types";
import { listingService } from "@/services/listingService";
import { formatPrice } from "@/lib/utils";
import { platformService } from "@/services/platformService";
import { usePlatformData } from "@/hooks/usePlatformData";
import { ImageUploadField, ImageUploadItem } from "@/components/common/InputFields";
import { toast } from "sonner";
import {
  ChevronLeft,
  Sparkles,
  Home,
  Building2,
  Palmtree,
  Trees,
  Castle,
  Check,
  ShieldCheck,
  BedDouble,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const PROPERTY_TYPES: {
  id: PropertyType;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "hotel", label: "Hotel", icon: Building2 },
  { id: "house", label: "House", icon: Home },
  { id: "apartment", label: "Apartment", icon: Building2 },
  { id: "villa", label: "Villa", icon: Palmtree },
  { id: "cabin", label: "Cabin", icon: Trees },
  { id: "mansion", label: "Mansion", icon: Castle },
  { id: "treehouse", label: "Treehouse", icon: Sparkles },
];

export default function HostCreateListingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: categories, loading: categoriesLoading, error: categoriesError, reload: reloadCategories } = usePlatformData(listingService.getCategories);
  const { data: amenityCatalog, loading: amenitiesLoading, error: amenitiesError } = usePlatformData(platformService.amenities);
  const amenityOptions = amenityCatalog?.amenities ?? [];

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem("token") && !sessionStorage.getItem("token")) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const roomTypes = useAppSelector((state) => state.roomTypes.items);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(
    roomTypes.length > 0 ? roomTypes[0].id : null
  );

  // Form State
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number | "">("");
  const [maxGuests, setMaxGuests] = useState<number | "">("");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [beds, setBeds] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");

  const handleSelectRoomType = (id: number) => {
    setSelectedRoomTypeId(id);
    const rt = roomTypes.find((item) => item.id === id);
    if (rt) {
      if (!title.trim()) setTitle(rt.name);
      if (!description.trim()) setDescription(rt.description);
      setPricePerNight(rt.base_price);
      setMaxGuests(rt.max_adults + rt.max_childrens);
      setBedrooms(rt.bedroom_count);
      setBeds(rt.bed_count);
      setBathrooms(rt.bathroom_count);
      if (rt.photos && rt.photos.length > 0) {
        setImages(rt.photos.map((p, index) => ({ id: String(p.id ?? index), url: p.url })));
      }
    }
  };
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5) {
      toast.error("Listing title must contain at least 5 characters.");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Please add a listing description of at least 10 characters.");
      return;
    }
    if (!category || !propertyType) {
      toast.error("Choose a listing category and property type.");
      return;
    }
    if (!city.trim() || !country.trim()) {
      toast.error("Enter the listing city and country.");
      return;
    }
    if (!pricePerNight || Number(pricePerNight) <= 0 || !maxGuests || Number(maxGuests) < 1) {
      toast.error("Enter a valid nightly rate and guest capacity.");
      return;
    }
    if (!images.length) {
      toast.error("Upload at least one listing photo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const files = images.flatMap((image) => image.file ? [image.file] : []);
      const uploadedFiles = files.length ? await platformService.upload(files) : [];
      let uploadedIndex = 0;
      const imageUrls = images.map((image) => {
        if (!image.file) return image.url;
        const uploaded = uploadedFiles[uploadedIndex++];
        if (!uploaded?.url) throw new Error("A listing photo could not be uploaded.");
        return uploaded.url;
      });

      const newListing: CreateListingDTO = {
        title: title.trim(),
        ...(tagline.trim() ? { tagline: tagline.trim() } : {}),
        description: description.trim(),
        category,
        mainCategory: propertyType === "hotel" ? "hotels" : "apartments",
        location: {
          city: city.trim(),
          country: country.trim(),
        },
        pricePerNight: Number(pricePerNight),
        images: imageUrls,
        specs: {
          maxGuests: Number(maxGuests),
          bedrooms: Number(bedrooms) || 0,
          beds: Number(beds) || 0,
          bathrooms: Number(bathrooms) || 0,
          propertyType,
        },
        amenities,
        ...(cancellationPolicy ? { cancellationPolicy } : {}),
      };

      const saved = await dispatch(createListing(newListing)).unwrap();
      router.push(saved.mainCategory === "hotels" ? "/host/room-types/create" : "/host/listings");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create listing.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isAuthenticated) return null;
  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <Link
            href="/host"
            className="flex items-center gap-2 text-sm font-sans font-semibold text-neutral-600 dark:text-neutral-400 hover:text-brand-primary transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Host Sanctuary Hub</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-sans font-semibold text-brand-secondary uppercase tracking-wider">
              Host Publishing Studio
            </span>
          </div>
        </div>

        {/* Layout Grid: Form on Left + Live Preview on Right */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4"
        >
          {/* Left Columns Form */}
          <div className="lg:col-span-2 space-y-8 bg-white dark:bg-neutral-900 p-7 sm:p-9 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
            {/* Step 0: Room Type & Unit Specification */}
            <div className="p-5 rounded-2xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-xs shrink-0">
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">
                      Linked Room Type / Listing Unit
                    </h3>
                    <p className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400">
                      Link this property to a configured room type (auto-syncs beds, capacity &amp; baseline pricing).
                    </p>
                  </div>
                </div>

                <Link
                  href="/host/room-types/create"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white text-[11px] font-sans font-semibold transition cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Room Type</span>
                </Link>
              </div>

              {/* Room Types Selector Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {roomTypes.map((rt) => {
                  const isSelected = selectedRoomTypeId === rt.id;
                  return (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={() => handleSelectRoomType(rt.id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-sans transition cursor-pointer text-left flex items-center gap-2 ${
                        isSelected
                          ? "border-brand-primary bg-white dark:bg-neutral-800 text-brand-primary ring-2 ring-brand-primary/20 font-bold shadow-xs"
                          : "border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:border-brand-primary/50"
                      }`}
                    >
                      <BedDouble className="w-3.5 h-3.5 shrink-0" />
                      <span>{rt.name}</span>
                      <span className="text-[10px] font-normal opacity-75">
                        (${rt.base_price}/nt)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 1: Title & Tagline */}
            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 dark:text-white">
                1. Property Name & Essence
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                  Sanctuary Title
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a name guests can recognize"
                  className="text-sm font-serif py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                  Poetic Tagline
                </label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Add a short description of the listing"
                  className="text-sm font-serif py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                  Sanctuary Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the property, its features, and what guests should know."
                  className="w-full p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* Step 2: Category & Property Type */}
            <div className="space-y-4 pt-7 border-t border-neutral-100 dark:border-neutral-800">
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 dark:text-white">
                2. Architectural Style & Category
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {PROPERTY_TYPES.map((pt) => {
                  const Icon = pt.icon;
                  const isSelected = propertyType === pt.id;
                  return (
                    <button
                      type="button"
                      key={pt.id}
                      onClick={() => setPropertyType(pt.id)}
                      className={`p-4 rounded-2xl border text-left flex flex-col items-start transition ${
                        isSelected
                          ? "border-brand-primary bg-brand-primary-light dark:bg-rose-950/30 text-brand-primary ring-2 ring-brand-primary/20"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <span className="text-sm font-heading font-semibold">
                        {pt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                  Featured Category Collection
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full" disabled={categoriesLoading || !!categoriesError || !categories?.length}>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {(categories ?? []).filter((cat) => cat.id !== "all").map((cat) => (
                      <SelectItem key={String(cat.id)} value={String(cat.id)}>
                        {cat.label}{cat.description ? " — " + cat.description : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriesLoading && <p className="text-xs text-neutral-500">Loading categories…</p>}
                {categoriesError && <button type="button" onClick={reloadCategories} className="text-xs text-rose-600 underline">Unable to load categories. Retry</button>}
              </div>
            </div>

            {/* Step 3: Location */}
            <div className="space-y-4 pt-7 border-t border-neutral-100 dark:border-neutral-800">
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 dark:text-white">
                3. Geographic Setting
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                    City / Region
                  </label>
                  <Input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter the city or region"
                    className="text-sm font-serif py-3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                    Country
                  </label>
                  <Input
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter the country"
                    className="text-sm font-serif py-3"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Specs & Pricing */}
            <div className="space-y-4 pt-7 border-t border-neutral-100 dark:border-neutral-800">
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 dark:text-white">
                4. Specifications & Nightly Rate
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-brand-secondary">
                    Max Guests
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-sm font-serif py-2.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-brand-secondary">
                    Bedrooms
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-sm font-serif py-2.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-brand-secondary">
                    Beds
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-sm font-serif py-2.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-brand-secondary">
                    Bathrooms
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-sm font-serif py-2.5"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 mt-4 flex items-center justify-between">
                <div>
                  <label className="text-sm font-heading font-semibold text-neutral-900 dark:text-white block">
                    Base Nightly Rate (BDT)
                  </label>
                  <p className="text-xs font-serif text-neutral-500">
                    Nightly pricing for guests
                  </p>
                </div>
                <div className="w-40">
                  <Input
                    type="number"
                    min="10"
                    step="5"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-lg font-heading font-semibold text-right pr-4 py-2.5"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Cancellation policy</label>
                <Select value={cancellationPolicy} onValueChange={setCancellationPolicy}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select a policy (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Step 5: Amenities */}
            <div className="space-y-4 pt-7 border-t border-neutral-100 dark:border-neutral-800">
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 dark:text-white">
                5. Selected Amenities
              </h2>

              {amenitiesLoading && <p className="text-sm text-neutral-500">Loading available amenities…</p>}
              {amenitiesError && <p role="alert" className="text-sm text-rose-600">{amenitiesError}</p>}
              {!amenitiesLoading && !amenitiesError && amenityOptions.length === 0 && <p className="text-sm text-neutral-500">No amenities are available yet.</p>}
              <div className="grid grid-cols-2 gap-3">
                {amenityOptions.map((item) => {
                  const isSelected = amenities.includes(item.name);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleAmenity(item.name)}
                      className={isSelected ? "flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-sans font-medium transition border-brand-primary bg-brand-primary-light text-brand-primary dark:bg-rose-950/40 dark:text-rose-300" : "flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-sans font-medium transition border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"}
                    >
                      <span className="w-4 h-4 rounded-md border flex items-center justify-center">
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 6: Photos */}
            <div className="space-y-4 pt-7 border-t border-neutral-100 dark:border-neutral-800">
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 dark:text-white">
                6. Photography Showcase
              </h2>

              <ImageUploadField label="Listing Photos" images={images} onChange={setImages} maxFiles={12} />
              <p className="text-xs text-neutral-500">Upload at least one photo. The first photo is used as the cover.</p>
            </div>

<div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-2xl font-sans font-semibold text-sm shadow-xl shadow-brand-primary/20 transition active:scale-98 flex items-center justify-center gap-2.5"
              >
                <span>
                  {isSubmitting
                    ? "Publishing Sanctuary..."
                    : "Publish & Go Live on Travistay"}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Guest Card Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3.5">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                  Live Guest Preview
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-sans font-semibold">
                  Preview only
                </span>
              </div>

              {/* Card visual */}
              <div className="rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                <div className="relative aspect-[4/3] w-full bg-neutral-200">
                  {images[0]?.url ? <Image src={images[0].url} alt="Listing photo preview" fill className="object-cover" unoptimized /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500"><Building2 className="w-8 h-8 mb-2" /><span className="text-xs">Upload a cover photo</span></div>}
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <h4 className="font-heading font-semibold text-base text-neutral-900 dark:text-white line-clamp-1">
                      {title || "Listing title"}
                    </h4>
                    <span className="text-xs font-sans text-neutral-500">Not rated yet</span>
                  </div>

                  <p className="text-xs font-serif text-neutral-500 truncate">
                    {city || "Location not set"}{country ? ", " + country : ""}
                  </p>
                  <p className="text-xs font-sans text-neutral-400">
                    {maxGuests || "—"} guests · {beds || "—"} beds · {bathrooms || "—"} baths
                  </p>

                  <div className="pt-2 flex items-baseline gap-1.5">
                    <span className="font-heading font-semibold text-lg text-neutral-900 dark:text-white">
                      {pricePerNight ? formatPrice(Number(pricePerNight)) : "Set nightly rate"}
                    </span>
                    <span className="text-xs font-sans text-neutral-500">
                      / night
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-secondary-light dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 text-xs">
                <p className="font-heading font-semibold text-brand-secondary dark:text-neutral-200">
                  Before you publish
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 font-serif leading-relaxed mt-1">
                  Add accurate details and photos so guests can review your listing.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
