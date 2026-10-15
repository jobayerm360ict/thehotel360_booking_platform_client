export interface BlogSectionBlock {
  heading: string;
  body: string[];
  image?: string;
  imageCaption?: string;
  quote?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  readTime: string;
  publishedAt: string;
  featured?: boolean;
  author: {
    name: string;
    role: string;
    avatar: string;
    bio?: string;
  };
  tags: string[];
  highlights?: string[];
  content: {
    intro: string;
    sections: BlogSectionBlock[];
    conclusion: string;
  };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "hidden-tea-sanctuaries-sreemangal",
    title: "The Hidden Tea Sanctuaries of Sreemangal: A Journey into Mist & Colonial Heritage",
    excerpt: "Discover the secluded tea garden bungalows where emerald slopes meet morning fog, offering private plunge pools, artisanal single-estate brewing, and unmatched serenity.",
    coverImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    category: "Sanctuary Guides",
    readTime: "5 min read",
    publishedAt: "Oct 01, 2026",
    featured: true,
    author: {
      name: "Ayesha Rahman",
      role: "Luxury Travel Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: "Ayesha has spent over a decade documenting private sanctuaries and slow-travel retreats across South Asia.",
    },
    tags: ["Tea Estates", "Heritage Bungalows", "Slow Travel", "Sylhet"],
    highlights: [
      "Wake up to 360-degree views of undulating tea terraces veiled in morning mist.",
      "Private tea sommelier tastings pairing rare white tea flushes with artisanal pastries.",
      "Architectural restoration that blends British colonial brass fittings with modern sustainable solar heating.",
    ],
    content: {
      intro: "There is an ethereal silence that settles over Sreemangal at 5:30 in the morning. Before the estate pickers begin their rhythmic morning climb, the valleys are cloaked in a gossamer blanket of white mist, pierced only by the sharp calls of hornbills echoing through ancient bamboo groves.",
      sections: [
        {
          heading: "The Heritage Architecture of High-Altitude Stays",
          body: [
            "Historically constructed during the late 19th century by Scottish tea planters, these bungalows were designed for longevity and contemplative leisure. Vaulted teak ceilings, terracotta brickwork, and wide wraparound verandahs keep the rooms naturally cool during midday sun and warm as temperatures drop at dusk.",
            "Today's curated sanctuaries retain this colonial romance while integrating heated cedar soaking tubs, frameless panoramic glass walls, and locally sourced raw silk drapery that frames the terraced hillsides.",
          ],
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
          imageCaption: "Morning light over the heritage verandah overlooking rolling tea ridges.",
          quote: "True luxury is not the presence of excess, but the absolute absence of disturbance.",
        },
        {
          heading: "Artisanal Tea Ceremonies & Private Gastronomy",
          body: [
            "A stay at these secluded estates is incomplete without the afternoon single-estate brewing ceremony. Guests are guided through five distinct flushes—from delicate silver needle white tea to full-bodied smoked orthodox black tea harvested from bushes planted over eighty years ago.",
            "Dinners are curated around indigenous ingredients: slow-roasted wild river fish wrapped in banana leaves, aromatic Sylheti citrus *Shatkora* infused braised curries, and organic honey sourced from local bee reserves in Lawachara National Park.",
          ],
        },
      ],
      conclusion: "For the urban traveler seeking profound rest, Sreemangal's luxury bungalows represent the pinnacle of mindful rejuvenation. Booking early during the autumn and winter months is essential.",
    },
  },
  {
    id: "blog-2",
    slug: "coxs-bazar-private-coastal-villas",
    title: "Beyond the Crowds: Inside Inani's Most Exclusive Oceanfront Sanctuaries",
    excerpt: "Escape the main beach hustle and uncover private cliffside and beachfront villas along Marine Drive, featuring infinity pools overlooking the Bay of Bengal.",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    category: "Coastal Living",
    readTime: "4 min read",
    publishedAt: "Sep 28, 2026",
    featured: true,
    author: {
      name: "Farhan Chowdhury",
      role: "Architectural Critic",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      bio: "Farhan writes about coastal architecture, sustainable hospitality, and minimalist design.",
    },
    tags: ["Marine Drive", "Private Beach", "Coastal Villa", "Bay of Bengal"],
    highlights: [
      "Direct private access to golden coral stone beaches free of tourist crowds.",
      "Perched cliffside pavilions providing panoramic front-row sunset vistas.",
      "Dedicated butler service and custom seafood beachside barbeque stations.",
    ],
    content: {
      intro: "While Cox's Bazar is renowned for possessing the longest natural sea beach in the world, the true connoisseurs of coastal serenity head twenty-five kilometers south along the scenic Marine Drive towards Inani and Himchari.",
      sections: [
        {
          heading: "Minimalist Coral & Teakwood Design",
          body: [
            "Perched on the lush hillsides overlooking the Bay of Bengal, the newest wave of boutique beachfront sanctuaries showcases tropical modernism at its finest. Cast concrete walls blended with local limestone withstand the maritime breeze, while floor-to-ceiling pivoting glass doors dissolve the boundary between indoors and the crashing surf.",
            "Each villa is oriented to capture the south-westerly ocean trade winds, ensuring that even during the warmest summer afternoons, the ambient breeze carries the scent of salt and pine.",
          ],
          image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          imageCaption: "Private oceanview deck featuring saltwater infinity pool at sunset.",
          quote: "The sound of the ocean waves here replaces every playlist you have ever curated.",
        },
      ],
      conclusion: "Inani's secluded villas demonstrate how coastal luxury in Bangladesh has matured into world-class retreats that honor privacy, ocean preservation, and barefoot luxury.",
    },
  },
  {
    id: "blog-3",
    slug: "sajek-valley-cloud-cabins-architecture",
    title: "Living Above the Clouds: The Rise of Sustainable Cedar Architecture in Sajek",
    excerpt: "How modern architects and local tribal artisans are collaborating to create cantilevered cedar cottages floating above valleys of perpetual clouds.",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    category: "Architectural Wonders",
    readTime: "6 min read",
    publishedAt: "Sep 25, 2026",
    featured: false,
    author: {
      name: "Tasnim Nawal",
      role: "Eco-Design Researcher",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      bio: "Tasnim specializes in indigenous construction techniques and zero-carbon wilderness architecture.",
    },
    tags: ["Sajek Valley", "Cloud Cabins", "Eco Architecture", "Hill Escapes"],
    highlights: [
      "Zero-concrete foundations preserving the natural mountain topography.",
      "Custom cantilevered netting beds suspended directly over the mountain drop-off.",
      "Passive ventilation systems utilizing natural valley updrafts.",
    ],
    content: {
      intro: "At 1,800 feet above sea level along the Mizoram border ridge, Sajek Valley has transformed from a rugged frontier outpost into South Asia's most dramatic cloudscape sanctuary.",
      sections: [
        {
          heading: "Cantilevered Engineering Meets Tribal Woodcraft",
          body: [
            "Building on steep sandstone ridges prone to heavy monsoons presents immense architectural hurdles. Rather than flattening hillsides with destructive concrete terraces, forward-thinking designers teamed up with indigenous Lusai carpenters.",
            "Using treated mountain bamboo, reclaimed teak, and sustainable pine timbers, these structures hover weightlessly over the cliff edge. Floorboards are slightly spaced to let mountain updrafts breathe, while insulated double-pitch roofs deflect heavy cloud condensation.",
          ],
          image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
          imageCaption: "Morning cloud sea surrounding the timber mountain deck.",
        },
      ],
      conclusion: "Sajek proves that high-altitude architecture can be both radically striking and ecologically sensitive to tribal heritage.",
    },
  },
  {
    id: "blog-4",
    slug: "curating-luxury-stays-host-guide",
    title: "The Art of Slow Hospitality: 7 Secrets Behind Our Top-Rated Superhosts",
    excerpt: "From sensory arrivals to hyper-personalized local concierge itineraries, here is how Travistay hosts create indelible memories for discerning guests.",
    coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    category: "Hosting Excellence",
    readTime: "4 min read",
    publishedAt: "Sep 20, 2026",
    featured: false,
    author: {
      name: "Tanvir Ahmed",
      role: "Head of Host Community",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      bio: "Tanvir mentors hosts across Bangladesh to elevate guest experiences to five-star luxury standards.",
    },
    tags: ["Superhost Tips", "Hospitality", "Interior Styling", "Guest Delight"],
    highlights: [
      "Custom signature scents formulated with local sandalwood and lemongrass.",
      "Handwritten welcome notes paired with locally roasted single-origin coffees.",
      "Proactive 24/7 digital concierge with secret unlisted dining recommendations.",
    ],
    content: {
      intro: "What elevates a beautifully decorated villa into an unforgettable stay? The difference lies in the unseen details: the temperature of the room upon arrival, the tactile comfort of high thread-count linen, and the genuine warmth of hospitality.",
      sections: [
        {
          heading: "1. The 5-Minute Arrival Ritual",
          body: [
            "Our top hosts never simply hand over a set of keys. Guests are welcomed with chilled lemongrass towels, a refreshing native citrus drink, and soft acoustic ambient music playing in the background.",
            "This deliberate sensory transition allows travelers to instantly decompress from their flight or road journey before even unzipping their luggage.",
          ],
          quote: "Hospitality is not about what you do to people, but how you make them feel inside your sanctuary.",
        },
      ],
      conclusion: "Mastering the subtle art of hospitality is what distinguishes Travistay properties as sanctuaries of true belonging.",
    },
  },
  {
    id: "blog-5",
    slug: "culinary-journeys-chittagong-hill-tracts",
    title: "Wild Herbs, Bamboo Cooking & River Delicacies: A Food Lover’s Hill Tracts Guide",
    excerpt: "Immerse your palate in ancestral culinary techniques, organic mountain foraging, and bamboo-roasted feasts prepared by indigenous culinary masters.",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    category: "Culinary & Culture",
    readTime: "5 min read",
    publishedAt: "Sep 18, 2026",
    featured: false,
    author: {
      name: "Ayesha Rahman",
      role: "Luxury Travel Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: "Ayesha has spent over a decade documenting private sanctuaries and slow-travel retreats across South Asia.",
    },
    tags: ["Gastronomy", "Tribal Food", "Organic Farming", "Hill Tracts"],
    highlights: [
      "Authentic *Hebron* bamboo-roasted organic free-range poultry seasoned with wild ginger.",
      "Handmade rice wine tastings aged in traditional subterranean earthenware jars.",
      "Guided early morning foraging walks discovering medicinal forest herbs.",
    ],
    content: {
      intro: "The cuisine of the Chittagong Hill Tracts is one of Asia's great unheralded gastronomic traditions: oil-free, deeply aromatic, reliant on open-fire roasting, and infused with wild mountain aromatics.",
      sections: [
        {
          heading: "The Mastery of Green Bamboo Steaming",
          body: [
            "At our partner eco-retreats in Bandarban and Rangamati, private masterclasses introduce guests to the ancient culinary art of *Bansh Pora*. Fresh green bamboo culms are stuffed with fragrant *Binni* sticky rice, crushed mountain pepper, and river prawns caught at daybreak.",
            "Slow-roasted over glowing charcoal embers, the bamboo releases its natural sap, perfuming the food with a delicate sweet smoke impossible to replicate in modern kitchens.",
          ],
        },
      ],
      conclusion: "Exploring tribal gastronomy directly connects travelers with the ancient living ecosystems of the mountain forests.",
    },
  },
  {
    id: "blog-6",
    slug: "modernist-penthouses-dhaka-urban-escapes",
    title: "Skyline Serenity: The Best Architectural Penthouses in Gulshan & Banani",
    excerpt: "Step inside high-altitude urban sanctuaries featuring private rooftop gardens, heated plunge pools, and curated contemporary South Asian art collections.",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    category: "Curated Escapes",
    readTime: "4 min read",
    publishedAt: "Sep 15, 2026",
    featured: false,
    author: {
      name: "Farhan Chowdhury",
      role: "Architectural Critic",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      bio: "Farhan writes about coastal architecture, sustainable hospitality, and minimalist design.",
    },
    tags: ["Urban Luxury", "Penthouses", "Gulshan", "Dhaka Skyline"],
    highlights: [
      "Private 2,000 sq ft sky-gardens designed with indigenous ferns and trickling water features.",
      "Acoustic double-glazed panoramic windows silencing the city below.",
      "Curated museum-grade contemporary art collections and private wine cellars.",
    ],
    content: {
      intro: "For business executives, creative directors, and travelers on diplomatic stopovers, Dhaka's diplomatic zones now host an elite tier of penthouse apartments that rival luxury residences in London and Singapore.",
      sections: [
        {
          heading: "Oasis Above the Metropolitan Energy",
          body: [
            "Perched twenty storeys above the leafy avenues of Gulshan-2, these duplex penthouses combine raw exposed concrete with polished brass and deep mahogany. Floating staircases lead to private infinity-edge rooftop spas offering panoramic views of Banani Lake and the glowing city skyline.",
            "Smart-home automation controls motorized louvers, mood lighting scenarios, and multi-room acoustic soundscapes with a single tap.",
          ],
        },
      ],
      conclusion: "These urban penthouses offer an unrivaled sanctuary where fast-paced productivity effortlessly transitions into tranquil evening indulgence.",
    },
  },
  {
    id: "blog-7",
    slug: "wellness-forest-retreats-sundarbans",
    title: "Silence in the Mangroves: Experiencing Eco-Luxury Deep in the Sundarbans",
    excerpt: "A secluded voyage aboard handcrafted wooden houseboats and stilt eco-lodges situated at the edge of the world's largest UNESCO mangrove wilderness.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    category: "Wellness & Nature",
    readTime: "7 min read",
    publishedAt: "Sep 10, 2026",
    featured: false,
    author: {
      name: "Tasnim Nawal",
      role: "Eco-Design Researcher",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      bio: "Tasnim specializes in indigenous construction techniques and zero-carbon wilderness architecture.",
    },
    tags: ["Sundarbans", "Mangroves", "Wilderness Eco Lodge", "Wildlife"],
    highlights: [
      "Silent electric solar-powered catamarans navigating narrow tidal creeks.",
      "Elevated canopy stilt suites providing bird's-eye views of spotted deer and kingfishers.",
      "Off-grid digital detox wellness regimes paired with Ayurvedic botanical therapies.",
    ],
    content: {
      intro: "There is no cell phone signal deep within the Sundarbans mangrove network—only the gentle splash of tidal water against seasoned wooden hulls and the rustle of sundari leaves in the sea breeze.",
      sections: [
        {
          heading: "Sustainable Luxury on the Tidal Edge",
          body: [
            "Constructed entirely on stilts to accommodate eight-foot tidal fluctuations, the sanctuaries located near Mongla and Kotka offer an unprecedented blend of eco-preservation and supreme comfort.",
            "Filtered rainwater harvesting systems, zero-single-use plastics, and organic permaculture gardens ensure that every stay actively contributes to the preservation of this fragile mangrove habitat.",
          ],
          quote: "In the Sundarbans, nature sets the schedule. You learn to listen to the rhythm of the tides.",
        },
      ],
      conclusion: "A journey into the Sundarbans restores one's connection to pristine wild nature without compromising on refined elegance.",
    },
  },
  {
    id: "blog-8",
    slug: "heritage-havelis-zamindar-palace-stays",
    title: "Restored Grandeur: Living in 19th-Century Zamindar Heritage Palaces",
    excerpt: "Step back in time to the golden age of Bengal architecture: marble courtyards, stained glass chandeliers, and grand riverfront estates beautifully preserved for modern guests.",
    coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    category: "Heritage Retreats",
    readTime: "5 min read",
    publishedAt: "Sep 05, 2026",
    featured: false,
    author: {
      name: "Ayesha Rahman",
      role: "Luxury Travel Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: "Ayesha has spent over a decade documenting private sanctuaries and slow-travel retreats across South Asia.",
    },
    tags: ["Heritage Palaces", "Panam Nagar", "Zamindar Estates", "Living History"],
    highlights: [
      "Original Italian marble floors and antique four-poster brass beds from the 1880s.",
      "Classical evening sitar recitals performed inside inner open-air courtyards.",
      "Traditional multi-course regal dinners served on vintage brass tableware.",
    ],
    content: {
      intro: "Along the historic trade waterways of Sonargaon and the riverbanks of the Meghna, centuries-old terracotta mansions and neoclassical Zamindar estates are experiencing a breathtaking renaissance.",
      sections: [
        {
          heading: "Preserving Architectural Soul for the Next Century",
          body: [
            "Carefully conserved under the guidance of leading South Asian restoration historians, these palaces invite guests to experience the grandeur of historic Bengal.",
            "Thick lime-surkhi walls naturally maintain a cool interior climate, while Venetian stained glass windows cast jewel-toned reflections across sunlit corridors throughout the day.",
          ],
        },
      ],
      conclusion: "Staying in a restored heritage palace is not merely a vacation; it is an intimate living encounter with centuries of art, poetry, and architecture.",
    },
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.slug !== currentSlug).slice(0, limit);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
}
