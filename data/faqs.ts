export interface FaqItem {
  id: number;
  question: {
    en: string;
    bn: string;
  };
  answer: {
    en: string;
    bn: string;
  };
}

export interface FaqCategory {
  id: string;
  title: {
    en: string;
    bn: string;
  };
  icon?: string;
  questions: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "nid-checkin",
    title: {
      en: "NID & Check-In Process",
      bn: "এনআইডি ও চেক-ইন প্রক্রিয়া",
    },
    questions: [
      {
        id: 1,
        question: {
          en: "What documents are required during check-in?",
          bn: "চেক-ইনের সময় কোন কোন কাগজপত্র প্রয়োজন?",
        },
        answer: {
          en: "A valid National ID (NID), Smart Card, or Passport copy is mandatory for all adult guests before or during check-in for safety and compliance with local authorities.",
          bn: "নিরাপত্তা ও স্থানীয় আইন মেনে চলার স্বার্থে সকল প্রাপ্তবয়স্ক অতিথির জাতীয় পরিচয়পত্র (NID), স্মার্ট কার্ড অথবা পাসপোর্টের কপি জমা দেওয়া আবশ্যক।",
        },
      },
      {
        id: 2,
        question: {
          en: "What is standard check-in and check-out time?",
          bn: "স্ট্যান্ডার্ড চেক-ইন এবং চেক-আউট সময় কত?",
        },
        answer: {
          en: "Standard check-in starts at 1:00 PM and check-out is by 11:00 AM. Early check-in or late check-out is subject to availability and can be requested via your host.",
          bn: "স্ট্যান্ডার্ড চেক-ইন দুপুর ১:০০ টা এবং চেক-আউট সকাল ১১:০০ টা। অগ্রিম চেক-ইন বা দেরিতে চেক-আউট প্রাপ্যতা সাপেক্ষে হোস্টের সাথে যোগাযোগ করে নেওয়া যাবে।",
        },
      },
      {
        id: 3,
        question: {
          en: "How does the smart digital keyless check-in work?",
          bn: "স্মার্ট ডিজিটাল কি-লেস চেক-ইন কীভাবে কাজ করে?",
        },
        answer: {
          en: "Once your booking is confirmed, you will receive a 6-digit dynamic passcode and check-in video guide 2 hours prior to arrival via SMS/Email.",
          bn: "বুকিং নিশ্চিত হওয়ার পর চেক-ইন করার ২ ঘণ্টা আগে এসএমএস ও ইমেইলের মাধ্যমে আপনি ৬ সংখ্যার ডায়নামিক ডিজিটাল পাসকোড এবং ভিডিও গাইড পাবেন।",
        },
      },
      {
        id: 4,
        question: {
          en: "Can foreigners check in using an international passport and visa?",
          bn: "বিদেশি নাগরিকরা কি পাসপোর্ট এবং ভিসা দিয়ে চেক-ইন করতে পারবেন?",
        },
        answer: {
          en: "Yes, international guests can easily check in by providing a valid passport and valid Bangladesh arrival visa or entry seal.",
          bn: "হ্যাঁ, আন্তর্জাতিক অতিথিরা বৈধ পাসপোর্ট এবং বাংলাদেশের বৈধ ভিসা বা এন্ট্রি সিলের মাধ্যমে খুব সহজেই চেক-ইন করতে পারবেন।",
        },
      },
    ],
  },
  {
    id: "apartment-details",
    title: {
      en: "Apartment Details",
      bn: "অ্যাপার্টমেন্ট ও রুমের বিস্তারিত",
    },
    questions: [
      {
        id: 5,
        question: {
          en: "Is high-speed Wi-Fi and 24/7 power backup available?",
          bn: "হাই-স্পিড ওয়াইফাই এবং ২৪/৭ বিদ্যুৎ ব্যাকআপ কি আছে?",
        },
        answer: {
          en: "Yes! All our premium stays are equipped with 50+ Mbps dedicated optic-fiber Wi-Fi and automatic IPS/Generator backup for uninterrupted electricity.",
          bn: "হ্যাঁ! আমাদের সকল প্রিমিয়াম স্টে-তে ৫০+ এমবিপিএস অপটিক-ফাইবার ওয়াইফাই এবং নিরবচ্ছিন্ন বিদ্যুতের জন্য অটোমেটিক আইপিএস/জেনারেটর ব্যাকআপ রয়েছে।",
        },
      },
      {
        id: 6,
        question: {
          en: "Are the kitchen utensils and cooking equipment provided?",
          bn: "রান্নার সামগ্রী এবং কিচেন সরঞ্জাম কি সরবরাহ করা হয়?",
        },
        answer: {
          en: "Full apartments come with fully functional kitchens including induction/gas stoves, microwave, refrigerator, cookware, and dining sets.",
          bn: "সম্পূর্ণ অ্যাপার্টমেন্টগুলোতে গ্যাস/ইন্ডাকশন ওভেন, মাইক্রোওয়েভ, ফ্রিজ, ফ্রাইপ্যান, হাঁড়ি ও ডাইনিং সেটসহ সম্পূর্ণ কিচেন সুবিধা থাকে।",
        },
      },
      {
        id: 7,
        question: {
          en: "Is daily housekeeping and fresh linen provided?",
          bn: "প্রতিদিনের হাউসকিপিং ও পরিষ্কার বিছানার চাদর কি দেওয়া হয়?",
        },
        answer: {
          en: "Fresh linens and sanitized towels are provided prior to check-in. For multi-day stays, complimentary housekeeping is available every 2 days upon request.",
          bn: "চেক-ইনের আগে জীবাণুমুক্ত টাওয়েল ও নতুন চাদর পরানো থাকে। দীর্ঘকালীন স্টে-এর জন্য প্রতি ২ দিন অন্তর হাউসকিপিং সেবা পাওয়া যায়।",
        },
      },
    ],
  },
  {
    id: "payment-price",
    title: {
      en: "Payment & Price",
      bn: "পেমেন্ট এবং মূল্য সংক্রান্ত",
    },
    questions: [
      {
        id: 8,
        question: {
          en: "What payment methods are supported?",
          bn: "কোন কোন পেমেন্ট মাধ্যম গ্রহণ করা হয়?",
        },
        answer: {
          en: "We support bKash, Nagad, Rocket, local Visa/Mastercard debit and credit cards, as well as international cards (Amex, UnionPay, Apple Pay).",
          bn: "আমরা বিকাশ, নগদ, রকেট, স্থানীয় ও আন্তর্জাতিক ভিসা, মাস্টারকার্ড, আমেরিকান এক্সপ্রেস এবং ক্রেডিট/ডেবিট কার্ড সমর্থন করি।",
        },
      },
      {
        id: 9,
        question: {
          en: "Are there any hidden fees, VAT, or service charges?",
          bn: "কোনো গোপন ফি, ভ্যাট বা অতিরিক্ত সার্ভিস চার্জ আছে কি?",
        },
        answer: {
          en: "No hidden charges! The final price shown on checkout includes all applicable service fees, platform charges, and local cleaning fees.",
          bn: "কোনো গোপন চার্জ নেই! চেকআউটে প্রদর্শিত মূল্যের মধ্যেই সার্ভিস চার্জ, প্ল্যাটফর্ম ফি এবং ক্লিনিং ফি অন্তর্ভুক্ত থাকে।",
        },
      },
      {
        id: 10,
        question: {
          en: "What is the cancellation and refund policy?",
          bn: "বুকিং বাতিল ও রিফান্ড পলিসি কী?",
        },
        answer: {
          en: "Cancel up to 48 hours before check-in for a 100% full refund. Cancellations made within 48 hours are subject to 50% refund or host policy.",
          bn: "চেক-ইনের ৪৮ ঘণ্টা পূর্বে বাতিল করলে ১০০% সম্পূর্ণ রিফান্ড পাবেন। ৪৮ ঘণ্টার মধ্যে বাতিলের ক্ষেত্রে ৫০% রিফান্ড প্রযোজ্য হয়।",
        },
      },
    ],
  },
  {
    id: "location-accessibility",
    title: {
      en: "Location & Accessibility",
      bn: "লোকেশন এবং যাতায়াত সুবিধা",
    },
    questions: [
      {
        id: 11,
        question: {
          en: "Is secure car parking available at the building?",
          bn: "ভবনে নিরাপদ গাড়ি পার্কিং সুবিধা আছে কি?",
        },
        answer: {
          en: "Most apartments have dedicated basement car parking with 24/7 CCTV surveillance and security guards. Check the listing specs for parking details.",
          bn: "অধিকাংশ অ্যাপার্টমেন্টেই ২৪/৭ সিসিটিভি ও দারোয়ান সম্বলিত নিরাপদ বেসমেন্ট পার্কিং সুবিধা রয়েছে। লিস্টিংয়ের বিবরণীতে পার্কিং সুবিধা উল্লেখ থাকে।",
        },
      },
      {
        id: 12,
        question: {
          en: "Is there a functional elevator/lift in multi-story buildings?",
          bn: "বহুতল ভবনে কি লিফট সুবিধা চালু থাকে?",
        },
        answer: {
          en: "Yes, all multi-floor sanctuaries and high-rise apartments feature modern passenger elevators with generator power backup.",
          bn: "হ্যাঁ, বহুতল প্রতিটি অ্যাপার্টমেন্টেই আধুনিক লিফট এবং বিদ্যুৎ চলে গেলেও লিফট সচল রাখার জন্য জেনারেটর ব্যাকআপ রয়েছে।",
        },
      },
    ],
  },
  {
    id: "guests-visitors",
    title: {
      en: "Guests & Visitors",
      bn: "অতিথি ও দর্শনার্থী নিয়মাবলী",
    },
    questions: [
      {
        id: 13,
        question: {
          en: "Are bachelor groups and unmarried couples allowed?",
          bn: "ব্যাচেলর গ্রুপ অথবা অবিবাহিত কাপল কি বুকিং করতে পারবেন?",
        },
        answer: {
          en: "Each listing has its clear house rules set by the host. Many of our premium apartments welcome bachelor groups and couples with valid NIDs.",
          bn: "প্রতিটি লিস্টিংয়ে হোস্টের নির্দিষ্ট নিয়ম উল্লেখ থাকে। আমাদের প্ল্যাটফর্মের অধিকাংশ অ্যাপার্টমেন্টেই বৈধ এনআইডি সাপেক্ষে অতিথিদের স্বাগতম জানানো হয়।",
        },
      },
      {
        id: 14,
        question: {
          en: "Can daytime outside visitors visit the apartment?",
          bn: "দিনের বেলা কোনো বহিরাগত অতিথি বা বন্ধু কি দেখা করতে আসতে পারবে?",
        },
        answer: {
          en: "Visitors are allowed until 9:00 PM with security entry registration. Overnight stays require adding the guest to the active reservation.",
          bn: "নিরাপত্তা রেজিস্টারে নাম এন্ট্রি সাপেক্ষে রাত ৯:০০ টা পর্যন্ত ভিজিটর আসতে পারেন। রাতে থাকার জন্য বুকিংয়ে অতিরিক্ত অতিথি হিসেবে যুক্ত করতে হবে।",
        },
      },
    ],
  },
  {
    id: "food-delivery",
    title: {
      en: "Food & Delivery",
      bn: "খাবার এবং ফুড ডেলিভারি",
    },
    questions: [
      {
        id: 15,
        question: {
          en: "Can I order from Foodpanda or any food delivery app?",
          bn: "আমি কি ফুডপ্যান্ডা বা যেকোনো ফুড ডেলিভারি অ্যাপ থেকে খাবার অর্ডার করতে পারব?",
        },
        answer: {
          en: "Yes! Foodpanda, Pathao Food, and local restaurant deliveries can deliver right to your building entrance or directly to your door.",
          bn: "হ্যাঁ! ফুডপ্যান্ডা, পাঠাও ফুড বা যেকোনো হোম ডেলিভারি খাবার সরাসরি আপনার ভবনের গেটে বা ডোরস্টেপে রিসিভ করতে পারবেন।",
        },
      },
      {
        id: 16,
        question: {
          en: "Are local grocery delivery apps like Chaldal or Shwapno accessible?",
          bn: "চালডাল বা স্বপ্ন-এর মতো গ্রোসারি ডেলিভারি কি অ্যাপার্টমেন্টে আসে?",
        },
        answer: {
          en: "Absolutely. You can order fresh raw groceries, cooking oil, spices, and beverages directly to your apartment address.",
          bn: "অবশ্যই। রান্না করার জন্য কাঁচা বাজার, তেল-মশলা ও কোমল পানীয় সরাসরি অ্যাপার্টমেন্টের ঠিকানায় অর্ডার করতে পারবেন।",
        },
      },
    ],
  },
  {
    id: "activities-rules",
    title: {
      en: "Activities & Rules",
      bn: "হাউজ রুলস ও আচরণবিধি",
    },
    questions: [
      {
        id: 17,
        question: {
          en: "Is smoking permitted inside the apartment or balcony?",
          bn: "অ্যাপার্টমেন্ট বা ব্যালকনিতে কি ধূমপান করা যাবে?",
        },
        answer: {
          en: "Indoor smoking is strictly prohibited to keep air clean for all guests. Designated open balconies with ashtrays may be used.",
          bn: "রুমের ভেতরে ধূমপান সম্পূর্ণ নিষিদ্ধ। তবে অ্যাশট্রে সম্বলিত উন্মুক্ত ব্যালকনিতে ধূমপানের অনুমতি রয়েছে।",
        },
      },
      {
        id: 18,
        question: {
          en: "Are late-night loud parties or loud music allowed?",
          bn: "দেরি রাত পর্যন্ত লাউড মিউজিক বা পার্টির অনুমতি আছে কি?",
        },
        answer: {
          en: "Quiet hours start from 11:00 PM to maintain a tranquil, peaceful residential environment for neighbors and fellow residents.",
          bn: "আবাসিক পরিবেশ ও প্রতিবেশীদের শান্তির স্বার্থে রাত ১১:০০ টার পর উচ্চস্বরে গান বাজানো বা পার্টি করা নিষেধ।",
        },
      },
    ],
  },
];
