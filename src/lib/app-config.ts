export interface OrderSettings {
  dineInWhatsappNumber: string;
  takeawayWhatsappNumber: string;
  openTimeIst: string;
  closeTimeIst: string;
  estimatedWaitTime: string;
  orderIdPrefix: string;
  minimumOrderValue: number;
  maxQuantityPerItem: number;
  dineInEnabled: boolean;
}

export interface UpiSettings {
  upiId: string;
  enableCash: boolean;
  enableUpi: boolean;
}

export interface RestaurantSettings {
  restaurantName: string;
  restaurantAddress: string;
  googleMapsLink: string;
  googleReviewLink: string;
  baseDomain: string;
  currencySymbol: string;
  maintenanceMode: boolean;
}

export interface ReviewSettings {
  showReviewsOnHome: boolean;
}

export interface DeliverySettings {
  deliveryEnabled: boolean;
  deliveryCharge: number;
  deliveryMinimumOrder: number;
  deliveryAreaDescription: string;
  deliveryMaxDistance: string;
  deliveryEstimatedTime: string;
  deliveryAvailableAreas: string;
  deliveryInstructions: string;
  deliveryWhatsappNumber: string;
}

export type ReviewStatus = "pending" | "approved";

export interface ReviewRecord {
  id: string;
  name: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  status: ReviewStatus;
  pinned: boolean;
}

export interface TableRecord {
  id: string;
  name: string;
  number: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AppSettings {
  order: OrderSettings;
  upi: UpiSettings;
  restaurant: RestaurantSettings;
  reviews: ReviewSettings;
  delivery: DeliverySettings;
}

export const STORAGE_KEYS = {
  cart: "fj-cart-v1",
  tableBannerDismissed: "fj-table-banner-dismissed-v1",
  djSession: "fj_dine_session",
} as const;

export const DEFAULT_ORDER_SETTINGS: OrderSettings = {
  dineInWhatsappNumber: "+91 9743862836",
  takeawayWhatsappNumber: "+91 9743862836",
  openTimeIst: "14:00",
  closeTimeIst: "23:00",
  estimatedWaitTime: "15-20 mins",
  orderIdPrefix: "FJ",
  minimumOrderValue: 80,
  maxQuantityPerItem: 10,
  dineInEnabled: false,
};

export const DEFAULT_UPI_SETTINGS: UpiSettings = {
  upiId: "nehalnadaf@ptyes",
  enableCash: true,
  enableUpi: true,
};

export const DEFAULT_RESTAURANT_SETTINGS: RestaurantSettings = {
  restaurantName: "Foodieez Junction",
  restaurantAddress: "Bengeri/Vidya Nagar, Hubballi, Karnataka",
  googleMapsLink: "",
  googleReviewLink: "https://search.google.com/local/writereview",
  baseDomain: "https://foodieezjunction.com",
  currencySymbol: "₹",
  maintenanceMode: false,
};

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  showReviewsOnHome: true,
};

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  deliveryEnabled: false,
  deliveryCharge: 0,
  deliveryMinimumOrder: 0,
  deliveryAreaDescription: "",
  deliveryMaxDistance: "",
  deliveryEstimatedTime: "30-45 mins",
  deliveryAvailableAreas: "",
  deliveryInstructions: "",
  deliveryWhatsappNumber: "",
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  order: DEFAULT_ORDER_SETTINGS,
  upi: DEFAULT_UPI_SETTINGS,
  restaurant: DEFAULT_RESTAURANT_SETTINGS,
  reviews: DEFAULT_REVIEW_SETTINGS,
  delivery: DEFAULT_DELIVERY_SETTINGS,
};
