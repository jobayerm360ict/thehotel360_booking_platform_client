"use client";

import { platformService } from "@/services/platformService";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  DoorOpen,
  Users2,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  Layers,
  Sparkles,
  Save,
  Check,
  ChevronRight,
  Info,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  SpaceType,
  RoomType,
  CreateRoomTypeDTO,
  RoomTypeStatus,
  Listing,
} from "@/types";
import { usePlatformData } from "@/hooks/usePlatformData";
import {
  InputField,
  TextareaField,
  SelectField,
  CounterField,
  ImageUploadField,
  ImageUploadItem,
} from "@/components/common/InputFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RoomTypeFormProps {
  initialData?: RoomType | null;
  onSubmit: (data: CreateRoomTypeDTO) => void | Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  listingId?: number;
}

export function RoomTypeForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  listingId,
}: RoomTypeFormProps) {
  const router = useRouter();
  const { data: amenityCatalog } = usePlatformData(platformService.amenities);
  const AMENITY_HEADS = amenityCatalog?.heads || [];
  const INITIAL_AMENITIES = amenityCatalog?.amenities || [];
  const [hostListings, setHostListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingLoadError, setListingLoadError] = useState("");
  const [selectedListingId, setSelectedListingId] = useState<string | number>(listingId || initialData?.listing_id || "");

  useEffect(() => {
    let active = true;
    platformService.hostListings()
      .then((listings) => {
        if (!active) return;
        setHostListings(listings.filter((listing) =>
          listing.mainCategory === "hotels" || listing.specs?.propertyType === "hotel",
        ));
        setListingLoadError("");
      })
      .catch(() => {
        if (active) setListingLoadError("Could not load your hotel listings. Check your backend connection and try again.");
      })
      .finally(() => {
        if (active) setListingsLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Active navigation tab
  const [activeSection, setActiveSection] = useState<
    "basic" | "capacity" | "amenities" | "pricing"
  >("basic");

  // Form State: 1. Basic Info
  const [spaceType, setSpaceType] = useState<SpaceType>(
    initialData?.space_type || "entire_place",
  );
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [status, setStatus] = useState<string>(initialData?.status || "active");

  // Form State: 2. Capacity & Dimensions
  const [maxAdults, setMaxAdults] = useState<number>(
    initialData?.max_adults ?? 0,
  );
  const [maxChildrens, setMaxChildrens] = useState<number>(
    initialData?.max_childrens ?? 0,
  );
  const [maxInfants, setMaxInfants] = useState<number>(
    initialData?.max_infants ?? 0,
  );
  const [bedroomCount, setBedroomCount] = useState<number>(
    initialData?.bedroom_count ?? 0,
  );
  const [bedCount, setBedCount] = useState<number>(initialData?.bed_count ?? 0);
  const [bathroomCount, setBathroomCount] = useState<number>(
    initialData?.bathroom_count ?? 0,
  );
  const [area, setArea] = useState<number | string>(initialData?.area ?? "");

  // Form State: 3. Amenities
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>(
    initialData?.amenity_ids ?? [],
  );
  const [selectedAmenityHead, setSelectedAmenityHead] = useState<number | null>(null);
  const activeAmenityHead = selectedAmenityHead ?? AMENITY_HEADS[0]?.id ?? 0;

  // Form State: 4. Photos & Pricing
  const [basePrice, setBasePrice] = useState<number | string>(
    initialData?.base_price ?? "",
  );
  const [totalInventory, setTotalInventory] = useState<number>((initialData as RoomType & { total_inventory?: number })?.total_inventory ?? 0);
  const [images, setImages] = useState<ImageUploadItem[]>(
    initialData?.photos?.map((p, idx) => ({
      id: `init-${idx}`,
      url: p.url,
    })) || [],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-slugify when name changes if slug wasn't manually edited
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData || slug === "") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const toggleAmenity = (id: number) => {
    if (selectedAmenityIds.includes(id)) {
      setSelectedAmenityIds(selectedAmenityIds.filter((item) => item !== id));
    } else {
      setSelectedAmenityIds([...selectedAmenityIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!selectedListingId) newErrors.listing = "Select the hotel listing this room belongs to";

    if (!name.trim()) newErrors.name = "Room type name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!basePrice || Number(basePrice) <= 0)
      newErrors.basePrice = "Please enter a valid base price";
    if (maxAdults < 1) newErrors.maxAdults = "At least one adult is required";
    if (bedCount < 1) newErrors.bedCount = "At least one bed is required";
    if (bathroomCount < 1) newErrors.bathroomCount = "At least one bathroom is required";
    if (totalInventory < 1) newErrors.totalInventory = "Inventory must be at least one room";
    if (!area || Number(area) <= 0)
      newErrors.area = "Please specify room area in sq ft";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(Object.values(newErrors)[0] || "Please fill in the required fields before saving.");
      return;
    }

    setErrors({});

    const payload: CreateRoomTypeDTO = {
      listing_id: Number(selectedListingId),
      space_type: spaceType,
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: description.trim(),
      base_price: Number(basePrice),
      max_adults: maxAdults,
      max_childrens: maxChildrens,
      max_infants: maxInfants,
      bedroom_count: bedroomCount,
      bed_count: bedCount,
      bathroom_count: bathroomCount,
      area: Number(area),
      status,
      amenity_ids: selectedAmenityIds,
      total_inventory: totalInventory,
      photos: await Promise.all(images.map(async img => ({ url: img.file ? (await platformService.upload([img.file]))[0].url : img.url }))),
    };

    await onSubmit(payload);
  };

  const spaceTypeOptions: {
    id: SpaceType;
    title: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "entire_place",
      title: "An Entire Sanctuary / Unit",
      icon: Home,
    },
    {
      id: "private_room",
      title: "Private Bedroom Suite",
      icon: DoorOpen,
    },
    {
      id: "shared_room",
      title: "Shared Suite / Dormitory",
      icon: Users2,
    },
  ];

  const currentHeadAmenities = INITIAL_AMENITIES.filter(
    (a) => a.head_id === activeAmenityHead,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
<label className="block text-sm font-semibold">Hotel listing
  <select required disabled={!!initialData || listingsLoading} className="block w-full rounded border p-3 mt-2" value={selectedListingId} onChange={e => setSelectedListingId(e.target.value)}>
    <option value="">{listingsLoading ? "Loading hotel listings..." : "Select hotel listing"}</option>
    {hostListings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
  </select>
  {listingLoadError && <span className="text-red-600">{listingLoadError}</span>}
  {!listingsLoading && !listingLoadError && hostListings.length === 0 && !initialData && <span className="block mt-2 text-sm text-neutral-600">No hotel listings found. <Link href="/host/create" className="underline text-brand-primary">Create a hotel listing</Link> first.</span>}
  {errors.listing && <span className="text-red-600">{errors.listing}</span>}
</label>

      {/* Top Section Nav Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-2 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: "basic", label: "1. Space & Basic Info", icon: Home },
          { id: "capacity", label: "2. Capacity & Layout", icon: Users2 },
          { id: "amenities", label: "3. Amenities Catalog", icon: Sparkles },
          { id: "pricing", label: "4. Photos & Pricing", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold transition shrink-0 cursor-pointer ${
                isActive
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SPACE TYPE & BASIC INFORMATION                                 */}
      {/* ========================================================================= */}
      {activeSection === "basic" && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-fade-in">
          <div>
            <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-brand-primary" />
              <span>Space Type &amp; Room Details</span>
            </h3>
          </div>

          {/* Space Type Cards */}
          <div className="space-y-2">
            <label className="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 block">
              Space Privacy Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {spaceTypeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = spaceType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSpaceType(opt.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-2 ring-brand-primary/20 shadow-xs"
                        : "border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? "bg-brand-primary text-white"
                              : "bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-sans font-bold text-neutral-900 dark:text-white">
                        {opt.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputField
                label="Room Type Name"
                required
                placeholder="e.g. Deluxe Oceanview Suite"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                error={errors.name}
              />
            </div>

            <div>
              <SelectField
                label="Room Type Status"
                value={status}
                onChange={(val) => setStatus(val)}
                options={[
                  { value: "active", label: "Active (Bookable by guests)" },
                  { value: "inactive", label: "Inactive (Hidden)" },
                  { value: "draft", label: "Draft (Under configuration)" },
                ]}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <TextareaField
              label="Room Description & Highlights"
              required
              rows={4}
              placeholder="Highlight the architectural design, atmosphere, unique bed configuration, and special view..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: "" }));
                }
              }}
              error={errors.description}
            />
          </div>

          {/* Status Select */}
          <div className="max-w-xs"></div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CAPACITY & DIMENSIONS                                          */}
      {/* ========================================================================= */}
      {activeSection === "capacity" && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-fade-in">
          <div>
            <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Users2 className="w-5 h-5 text-brand-primary" />
              <span>Guest Capacity &amp; Room Layout</span>
            </h3>
          </div>

          {/* Guest Capacity Steppers */}
          <div className="space-y-3">
            <h4 className="text-xs font-sans font-semibold text-neutral-500 uppercase tracking-wider">
              Guest Occupancy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <CounterField
                label="Max Adults"
                description="Age 13 and above"
                value={maxAdults}
                onChange={setMaxAdults}
                min={1}
                max={20}
              />
              <CounterField
                label="Max Children"
                description="Ages 2 to 12"
                value={maxChildrens}
                onChange={setMaxChildrens}
                min={0}
                max={15}
              />
            </div>
          </div>

          {/* Bed & Bath Steppers */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-sans font-semibold text-neutral-500 uppercase tracking-wider">
              Beds &amp; Baths
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <CounterField
                label="Bedroom Count"
                description="Dedicated bedrooms in room"
                value={bedroomCount}
                onChange={setBedroomCount}
                min={0}
                max={15}
                icon={<DoorOpen className="w-4 h-4" />}
              />
              <CounterField
                label="Bed Count"
                description="Total beds available"
                value={bedCount}
                onChange={setBedCount}
                min={1}
                max={20}
                icon={<Bed className="w-4 h-4" />}
              />
              <CounterField
                label="Bathroom Count"
                description="Full and half bathrooms"
                value={bathroomCount}
                onChange={setBathroomCount}
                min={1}
                max={10}
                icon={<Bath className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Room Area Dimension */}
          <div className="pt-2 max-w-sm">
            <InputField
              label="Room Area (in square feet)"
              required
              type="number"
              min={50}
              max={15000}
              placeholder="e.g. 450"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              error={errors.area}
              leftIcon={<Maximize2 className="w-4 h-4" />}
              // helperText="Approximate interior floor size of this room type."
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: CATEGORIZED AMENITIES                                          */}
      {/* ========================================================================= */}
      {activeSection === "amenities" && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-fade-in">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <span>Room Amenities &amp; Features</span>
              </h3>
              <Badge className="bg-brand-primary/10 text-brand-primary border-none text-xs font-semibold px-2.5 py-1">
                {selectedAmenityIds.length} Amenities Selected
              </Badge>
            </div>
          </div>

          {/* Category Heads Pills Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {AMENITY_HEADS.map((head) => {
              const isSelected = activeAmenityHead === head.id;
              const countInHead = INITIAL_AMENITIES.filter(
                (a) =>
                  a.head_id === head.id && selectedAmenityIds.includes(a.id),
              ).length;

              return (
                <button
                  key={head.id}
                  type="button"
                  onClick={() => setSelectedAmenityHead(head.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-brand-primary text-white shadow-2xs"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
                  }`}
                >
                  <span>{head.name}</span>
                  {countInHead > 0 && (
                    <span
                      className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                        isSelected
                          ? "bg-white text-brand-primary"
                          : "bg-brand-primary text-white"
                      }`}
                    >
                      {countInHead}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentHeadAmenities.map((amenity) => {
              const isChecked = selectedAmenityIds.includes(amenity.id);
              return (
                <div
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-1 ring-brand-primary/20 shadow-2xs"
                      : "border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30"
                  }`}
                >
                  <span className="text-xs font-sans font-medium text-neutral-800 dark:text-neutral-200">
                    {amenity.name}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                      isChecked
                        ? "bg-brand-primary border-brand-primary text-white"
                        : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700"
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: PHOTOS, INVENTORY & PRICING                                    */}
      {/* ========================================================================= */}
      {activeSection === "pricing" && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-fade-in">
          <div>
            <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-primary" />
              <span>Base Pricing, Inventory &amp; Photos</span>
            </h3>
          </div>

          {/* Pricing & Inventory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputField
                label="Base Price per Night (BDT)"
                required
                type="number"
                min={1}
                placeholder="220"
                value={basePrice}
                onChange={(e) => {
                  setBasePrice(e.target.value);
                  if (errors.basePrice) {
                    setErrors((prev) => ({ ...prev, basePrice: "" }));
                  }
                }}
                error={errors.basePrice}
                leftIcon={<DollarSign className="w-4 h-4" />}
                // helperText="Standard baseline night rate for this room type before seasonal adjustments."
              />
            </div>

            <div>
              <CounterField
                label="Total Inventory Count"
                description="Number of identical rooms available"
                value={totalInventory}
                onChange={setTotalInventory}
                min={1}
                max={100}
                icon={<Layers className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Image Upload Gallery */}
          <div className="pt-2">
            <ImageUploadField
              label="Room Type Photos Gallery"
              // description="Upload high-res photos showcasing this room's interior, bed, and ensuite bathroom."
              images={images}
              onChange={setImages}
              maxFiles={12}
            />
          </div>
        </div>
      )}

      {/* Form Action Controls */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-neutral-500 font-serif">
          Configuring:{" "}
          <strong className="text-neutral-800 dark:text-neutral-200">
            {name || "New Room Type"}
          </strong>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-full px-6 text-xs font-sans font-semibold cursor-pointer"
            >
              Cancel
            </Button>
          )}

          {activeSection !== "pricing" ? (
            <Button
              type="button"
              onClick={() => {
                const next: Record<
                  "basic" | "capacity" | "amenities" | "pricing",
                  "basic" | "capacity" | "amenities" | "pricing"
                > = {
                  basic: "capacity",
                  capacity: "amenities",
                  amenities: "pricing",
                  pricing: "pricing",
                };
                setActiveSection(next[activeSection] || "basic");
              }}
              className="rounded-full px-7 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-sans font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full px-8 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Room Type...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {initialData ? "Update Room Type" : "Create Room Type"}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

