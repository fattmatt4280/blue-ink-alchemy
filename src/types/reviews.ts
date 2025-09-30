// Security-safe types for customer reviews that exclude email addresses

export interface PublicCustomerReview {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
}

export interface CustomerReviewForAdmin {
  id: string;
  name: string;
  email: string;
  rating: number;
  title: string | null;
  content: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

// Type-safe column selection strings
export const PUBLIC_REVIEW_COLUMNS = 'id, name, rating, title, content, created_at' as const;
export const ADMIN_REVIEW_COLUMNS = '*' as const;