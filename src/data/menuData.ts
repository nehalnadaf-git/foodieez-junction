
export type OfferType =
  | "bogo"
  | "percentage"
  | "new_tag"
  | "none";

export interface MenuItemSize {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  description?: string;
  price?: number;
  priceSmall?: number;
  priceLarge?: number;
  sizes?: MenuItemSize[];
  available?: boolean;
  isSpecial?: boolean;
  offerType?: OfferType;
  offerPercentage?: number;
  /** Path to individual product image inside /public (e.g. "/Products/Chicken/Chicken 65.png") */
  image?: string;
  imageSource?: "upload" | "url";

}

export interface Category {
  id: string;
  name: string;
  image: string;
  visible?: boolean;
  order?: number;
}

export type MenuCategory = Category;

export const categories: Category[] = [
  { id: "veg", name: "Veg Items", image: "/Products/Veg items/Veg Fried Rice.webp" },
  { id: "noodles", name: "Noodles", image: "/Products/Noodles/Chicken Noodles.webp" },
  { id: "soups", name: "Soups", image: "/Products/Soups/Veg Manchurian Soup.webp" },
  { id: "nonveg-rice", name: "Non Veg Rice", image: "/Products/Non-veg rice/Chicken Fried Rice.webp" },
  { id: "chicken", name: "Chicken", image: "/Products/Chicken/Chicken 65.webp" },
  { id: "manchurian", name: "Manchurian & Bhel", image: "/Products/Manchurian and Bhel/Gobi Manchurian.webp" },
  { id: "omelette", name: "Omelette", image: "/Products/Omelette/Omelette (double).webp" },
  { id: "combo", name: "Combo Rice", image: "/Products/Combo rice/Veg Manchurian Rice.webp" },
  { id: "fries", name: "French Fries", image: "/Products/French fries/Regular Salt French Fries.webp" },
  { id: "momos", name: "Momos", image: "/Products/Momos/Veg Steam Momos.webp" },
];

// Map category id to string path for menu items
const categoryImageMap: Record<string, string> = {};
categories.forEach((c) => {
  categoryImageMap[c.id] = c.image;
});

export const getCategoryImage = (categoryId: string): string =>
  categoryImageMap[categoryId] || "/Products/Veg items/Veg Fried Rice.webp";

export const menuItems: MenuItem[] = [
  // Veg Items
  {
    id: "v1",
    name: "Veg Fried Rice",
    category: "veg",
    isVeg: true,
    priceSmall: 40,
    priceLarge: 60,
    image: "/Products/Veg items/Veg Fried Rice.webp",
  },
  {
    id: "v2",
    name: "Veg Manchurian Rice",
    category: "veg",
    isVeg: true,
    priceSmall: 60,
    priceLarge: 80,
    image: "/Products/Veg items/Veg Manchurian Rice.webp",
  },
  {
    id: "v3",
    name: "Veg Triple Rice",
    category: "veg",
    isVeg: true,
    price: 70,
    image: "/Products/Veg items/Veg Tripple Rice.webp",
  },
  {
    id: "v4",
    name: "Veg Noodles",
    category: "veg",
    isVeg: true,
    priceSmall: 40,
    priceLarge: 60,
    image: "/Products/Veg items/Veg Noodles.webp",
  },
  {
    id: "v5",
    name: "Gobi Noodles (Veg)",
    category: "veg",
    isVeg: true,
    price: 60,
    image: "/Products/Veg items/Gobi Noodles.webp",
  },
  {
    id: "v6",
    name: "Veg Hakka Noodles",
    category: "veg",
    isVeg: true,
    price: 60,
    image: "/Products/Veg items/Veg Hakka Noodles.webp",
  },
  {
    id: "v7",
    name: "Veg Manchurian Noodles",
    category: "veg",
    isVeg: true,
    priceSmall: 60,
    priceLarge: 80,
    image: "/Products/Veg items/Veg Manchurian Noodles.webp",
  },

  // Noodles
  {
    id: "n1",
    name: "Chicken Noodles",
    category: "noodles",
    isVeg: false,
    priceSmall: 70,
    priceLarge: 100,
    image: "/Products/Noodles/Chicken Noodles.webp",
  },
  {
    id: "n2",
    name: "Chicken Hakka Noodles",
    category: "noodles",
    isVeg: false,
    price: 90,
    image: "/Products/Noodles/Chicken Hakka Noodles.webp",
  },
  {
    id: "n3",
    name: "Egg Hakka Noodles",
    category: "noodles",
    isVeg: false,
    price: 70,
    image: "/Products/Noodles/Egg Hakka Noodles.webp",
  },
  {
    id: "n4",
    name: "Gobi Egg Noodles",
    category: "noodles",
    isVeg: false,
    price: 70,
    image: "/Products/Noodles/Gobi Egg Noodles.webp",
  },
  {
    id: "n5",
    name: "Egg Noodles",
    category: "noodles",
    isVeg: false,
    priceSmall: 50,
    priceLarge: 70,
    image: "/Products/Noodles/Egg Noodles.webp",
  },

  // Soups
  {
    id: "s1",
    name: "Veg Manchurian Soup",
    category: "soups",
    isVeg: true,
    price: 40,
    image: "/Products/Soups/Veg Manchurian Soup.webp",
  },
  {
    id: "s2",
    name: "Egg Manchurian Soup",
    category: "soups",
    isVeg: false,
    price: 60,
    image: "/Products/Soups/Egg Manchurian Soup.webp",
  },
  {
    id: "s3",
    name: "Chicken Manchurian Soup",
    category: "soups",
    isVeg: false,
    price: 70,
    image: "/Products/Soups/Chicken Manchurian Soup.webp",
  },

  // Non Veg Rice
  {
    id: "nr1",
    name: "Chicken Fried Rice",
    category: "nonveg-rice",
    isVeg: false,
    priceSmall: 70,
    priceLarge: 100,
    image: "/Products/Non-veg rice/Chicken Fried Rice.webp",
  },
  {
    id: "nr2",
    name: "Chicken Triple Rice",
    category: "nonveg-rice",
    isVeg: false,
    price: 140,
    image: "/Products/Non-veg rice/Chicken Triple Rice.webp",
  },

  // Chicken
  {
    id: "c1",
    name: "Chicken Manchurian",
    category: "chicken",
    isVeg: false,
    price: 90,
    image: "/Products/Chicken/Chicken Manchurian.webp",
  },
  {
    id: "c2",
    name: "Chicken Chilli",
    category: "chicken",
    isVeg: false,
    price: 100,
    image: "/Products/Chicken/Chicken Chilli.webp",
  },
  {
    id: "c3",
    name: "Chicken 65",
    category: "chicken",
    isVeg: false,
    price: 90,
    image: "/Products/Chicken/Chicken 65.webp",
  },
  {
    id: "c4",
    name: "Egg Fried Rice",
    category: "chicken",
    isVeg: false,
    priceSmall: 50,
    priceLarge: 70,
    image: "/Products/Chicken/Egg fried rice.webp",
  },

  // Manchurian & Bhel
  {
    id: "m1",
    name: "Gobi Manchurian",
    category: "manchurian",
    isVeg: true,
    priceSmall: 40,
    priceLarge: 50,
    image: "/Products/Manchurian and Bhel/Gobi Manchurian.webp",
  },
  {
    id: "m2",
    name: "Gobi 65",
    category: "manchurian",
    isVeg: true,
    price: 60,
    image: "/Products/Manchurian and Bhel/Gobi 65.webp",
  },
  {
    id: "m3",
    name: "Chinese Bhel",
    category: "manchurian",
    isVeg: true,
    price: 50,
    image: "/Products/Manchurian and Bhel/Chinese Bhel.webp",
  },

  // Omelette
  {
    id: "o1",
    name: "Omelette (Double)",
    category: "omelette",
    isVeg: false,
    price: 40,
    image: "/Products/Omelette/Omelette (double).webp",
  },
  {
    id: "o2",
    name: "Half Fry (Single)",
    category: "omelette",
    isVeg: false,
    price: 20,
    image: "/Products/Omelette/Half fry (single).webp",
  },
  {
    id: "o3",
    name: "Half Fry (Double)",
    category: "omelette",
    isVeg: false,
    price: 40,
    image: "/Products/Omelette/Half fry (double).webp",
  },

  // Combo Rice
  {
    id: "cb1",
    name: "Veg Combination Rice",
    category: "combo",
    isVeg: true,
    price: 70,
    image: "/Products/Combo rice/Veg Manchurian Rice.webp",
  },
  {
    id: "cb2",
    name: "Egg Combination Rice",
    category: "combo",
    isVeg: false,
    price: 90,
    image: "/Products/Combo rice/Egg Combination Rice.webp",
  },
  {
    id: "cb3",
    name: "Chicken Combination Rice",
    category: "combo",
    isVeg: false,
    price: 100,
    image: "/Products/Combo rice/Chicken combination rice.webp",
  },

  // French Fries & Momos
  {
    id: "f1",
    name: "French Fries Regular/Salt",
    category: "fries",
    isVeg: true,
    price: 50,
    image: "/Products/French fries/Regular Salt French Fries.webp",
  },
  {
    id: "f2",
    name: "French Fries Peri Peri",
    category: "fries",
    isVeg: true,
    price: 60,
    image: "/Products/French fries/Peri Peri French fries.webp",
  },

  // Momos
  {
    id: "mo1",
    name: "Veg Steam Momos",
    category: "momos",
    isVeg: true,
    price: 60,
    image: "/Products/Momos/Veg Steam Momos.webp",
  },
  {
    id: "mo2",
    name: "Veg Cheese Steam Momos",
    category: "momos",
    isVeg: true,
    price: 70,
    image: "/Products/Momos/Veg Cheese Steam Momos.webp",
  },
  {
    id: "mo3",
    name: "Veg Peri-Peri Steam Momos",
    category: "momos",
    isVeg: true,
    price: 70,
    image: "/Products/Momos/Veg Peri-Peri Steam Momos.webp",
  },
  {
    id: "mo4",
    name: "Chicken Steam Momos",
    category: "momos",
    isVeg: false,
    price: 80,
    image: "/Products/Momos/Chicken Steam Momos.webp",
  },
  {
    id: "mo5",
    name: "Chicken Cheese Steam Momos",
    category: "momos",
    isVeg: false,
    price: 90,
    image: "/Products/Momos/Chicken Cheese Steam Momos.webp",
  },
  {
    id: "mo6",
    name: "Chicken Peri Peri Steam Momos",
    category: "momos",
    isVeg: false,
    price: 90,
    image: "/Products/Momos/Chicken Peri Peri Steam Momos.webp",
  },
  {
    id: "mo7",
    name: "Dumpling Momos",
    category: "momos",
    isVeg: true,
    price: 70,
    image: "/Products/Momos/Dumpling Momos.webp",
  },
  {
    id: "mo8",
    name: "Veg Fried Momos",
    category: "momos",
    isVeg: true,
    price: 70,
    image: "/Products/Momos/Veg fried momos.webp",
  },
  {
    id: "mo9",
    name: "Veg Cheese Fried Momos",
    category: "momos",
    isVeg: true,
    price: 80,
    image: "/Products/Momos/Veg Cheese Fried Momos.webp",
  },
  {
    id: "mo10",
    name: "Veg Peri-Peri Fried Momos",
    category: "momos",
    isVeg: true,
    price: 80,
    image: "/Products/Momos/Veg Peri-Peri Fried Momos.webp",
  },
  {
    id: "mo11",
    name: "Chicken Fried Momos",
    category: "momos",
    isVeg: false,
    price: 90,
    image: "/Products/Momos/Chicken Fried Momos.webp",
  },
  {
    id: "mo12",
    name: "Chicken Cheese Fried Momos",
    category: "momos",
    isVeg: false,
    price: 100,
    image: "/Products/Momos/Chicken Cheese Fried Momos.webp",
  },
  {
    id: "mo13",
    name: "Chicken Peri Peri Fried Momos",
    category: "momos",
    isVeg: false,
    price: 100,
    image: "/Products/Momos/Chicken Peri Peri Fried Momos.webp",
  },
];
