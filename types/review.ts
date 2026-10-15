/**
 * Bidirectional Review Domain Types (Guest & Host)
 */

export interface ReviewAuthor {
  id: string;
  name: string;
  avatar: string;
  isSuperhost?: boolean;
  role: "guest" | "host";
}

export interface ReviewResponse {
  authorName: string;
  authorAvatar: string;
  comment: string;
  createdAt: string;
}

export interface UserReview {
  id: string;
  type: "guest_review" | "host_review"; // guest_review = written ABOUT guest by host; host_review = written ABOUT listing/host by guest
  targetUserId: string;
  targetUserName: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: "guest" | "host";
  isSuperhost?: boolean;
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
  reservationId?: string;
  stayDates?: string;
  rating: number;
  subRatings?: {
    cleanliness?: number;
    accuracy?: number;
    communication?: number;
    location?: number;
    checkIn?: number;
    value?: number;
    houseRules?: number;
  };
  tags?: string[];
  comment: string;
  createdAt: string;
  response?: ReviewResponse;
}
