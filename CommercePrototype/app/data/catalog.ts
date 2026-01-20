/**
 * In-memory product catalog used by screens.
 *
 * This is intentionally local-only for the prototype. When we introduce a real
 * backend/API, this file becomes either:
 * - a mock/stub used by tests, or
 * - a fallback dataset used when offline.
 */
import type { ImageSourcePropType } from "react-native";

export type CategoryId = "new" | "men" | "women" | "sale" | "new arrivals";

export type Category = {
  id: CategoryId;
  label: string;
  query: string;
};

export const categories: Category[] = [
  { id: "new", label: "New", query: "new" },
  { id: "men", label: "Men", query: "men" },
  { id: "women", label: "Women", query: "women" },
  { id: "sale", label: "Sale", query: "sale" },
  { id: "new arrivals", label: "New Arrivals", query: "arrivals" },
];

const placeholderImage = (seed: string): ImageSourcePropType => ({
  // Deterministic images per product, no local assets required.
  // picsum supports arbitrary seeds and returns a valid image for web + native.
  uri: `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`,
});

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  quantityAvailable: number;
  categoryId: CategoryId;
  image: ImageSourcePropType;
  images?: ImageSourcePropType[];
  description?: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  shipping?: {
    shippingType?: string;
    estimatedDays?: string;
  };
  /** PDP details copy block (title + paragraphs). This is independent copy (not derived). */
  details: {
    title: string;
    paragraphs: string[];
  };
};
export const products: CatalogProduct[] = [
  // New (5)
  {
    id: "sku-new-001",
    name: "Lightweight Tee",
    details: {
      title: "Details",
      paragraphs: [
        "A lightweight tee with a clean drape and an easy, everyday cut—made for repeat wear.",
        "Finished with smooth seams and a soft hand-feel so it layers comfortably under shirts or jackets.",
      ],
    },
    price: 18.99,
    quantityAvailable: 42,
    categoryId: "new",
    image: placeholderImage("sku-new-001"),
    images: [placeholderImage("sku-new-001-1"), placeholderImage("sku-new-001-2"), placeholderImage("sku-new-001-3"), placeholderImage("sku-new-001-4")],
    description: "Perfect everyday tee made from premium cotton blend",
    rating: 4.5,
    reviewCount: 128,
    features: ["Breathable", "Lightweight", "Eco-friendly"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
  },
  {
    id: "sku-new-002",
    name: "Minimal Hoodie",
    details: {
      title: "Details",
      paragraphs: [
        "A streamlined hoodie built around a sharp silhouette, with a cozy interior that doesn't look bulky.",
        "Minimal detailing and structured cuffs keep it looking polished for travel, errands, or lounging.",
      ],
    },
    price: 54.9,
    quantityAvailable: 11,
    categoryId: "new",
    image: placeholderImage("sku-new-002"),
    images: [placeholderImage("sku-new-002-1"), placeholderImage("sku-new-002-2"),placeholderImage("sku-new-002-3"), placeholderImage("sku-new-002-4")],
    description: "Comfortable hoodie with minimalist design",
    rating: 4.8,
    reviewCount: 256,
    features: ["Comfortable", "Modern design", "Warm"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
  },
  {
    id: "sku-new-003",
    name: "Running Sneaker",
    price: 89.0,
    quantityAvailable: 6,
    categoryId: "new",
    image: placeholderImage("sku-new-003"),
    images: [placeholderImage("sku-new-003-1"), placeholderImage("sku-new-003-2"), placeholderImage("sku-new-003-3"), placeholderImage("sku-new-003-4")],
    description: "High-performance sneakers for running and training",
    rating: 4.7,
    reviewCount: 342,
    features: ["Cushioned", "Durable", "Lightweight"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Responsive cushioning and a stable platform help you transition from quick intervals to longer runs.",
        "A grippy outsole pattern adds confidence on pavement and light trails without feeling heavy.",
      ],
    },
  },
  {
    id: "sku-new-004",
    name: "Everyday Jeans",
    price: 62.5,
    quantityAvailable: 19,
    categoryId: "new",
    image: placeholderImage("sku-new-004"),
    images: [placeholderImage("sku-new-004-1"), placeholderImage("sku-new-004-2"), placeholderImage("sku-new-004-3"), placeholderImage("sku-new-004-4")],
    description: "Classic fit jeans perfect for any occasion",
    rating: 4.6,
    reviewCount: 198,
    features: ["Classic fit", "Durable", "Comfortable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Straightforward, go-anywhere denim with a balanced rise and a leg shape that works with sneakers or boots.",
        "Designed to break in nicely over time while keeping a neat look through the hips and thigh.",
      ],
    },
  },
  {
    id: "sku-new-005",
    name: "Windbreaker Jacket",
    price: 99.99,
    quantityAvailable: 4,
    categoryId: "new",
    image: placeholderImage("sku-new-005"),
    images: [placeholderImage("sku-new-005-1"), placeholderImage("sku-new-005-2"), placeholderImage("sku-new-005-3"), placeholderImage("sku-new-005-4")],
    description: "Water-resistant jacket for outdoor activities",
    rating: 4.4,
    reviewCount: 89,
    features: ["Water-resistant", "Lightweight", "Packable"],
    shipping: { shippingType: "Express shipping", estimatedDays: "1-2 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A packable outer layer that cuts the wind and adds a crisp finish to casual outfits.",
        "Lightweight construction makes it ideal for layering over tees in changing weather.",
      ],
    },
  },
  {
    id: "sku-new-006",
    name: "Cotton Sweatpants",
    price: 42.0,
    quantityAvailable: 28,
    categoryId: "new",
    image: placeholderImage("sku-new-006"),
    images: [placeholderImage("sku-new-006-1"), placeholderImage("sku-new-006-2"), placeholderImage("sku-new-006-3"), placeholderImage("sku-new-006-4")],
    description: "Relaxed fit sweatpants for ultimate comfort",
    rating: 4.6,
    reviewCount: 167,
    features: ["Soft cotton", "Elastic waist", "Relaxed fit"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Relaxed joggers with a tidy profile—comfortable enough for downtime, clean enough for a quick coffee run.",
        "Soft interior and a flexible waistband keep the fit easy from morning to evening.",
      ],
    },
  },
  {
    id: "sku-new-007",
    name: "Leather Backpack",
    price: 129.0,
    quantityAvailable: 8,
    categoryId: "new",
    image: placeholderImage("sku-new-007"),
    images: [placeholderImage("sku-new-007-1"), placeholderImage("sku-new-007-2"), placeholderImage("sku-new-007-3"), placeholderImage("sku-new-007-4")],
    description: "Premium leather backpack with laptop compartment",
    rating: 4.9,
    reviewCount: 412,
    features: ["Genuine leather", "Laptop pocket", "Spacious"],
    shipping: { shippingType: "Express shipping", estimatedDays: "1-2 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A structured backpack that elevates daily carry, with thoughtful organization for work essentials.",
        "Reinforced base and comfortable straps make it a dependable option for commuting or weekend trips.",
      ],
    },
  },
  {
    id: "sku-new-008",
    name: "Baseball Cap",
    price: 24.5,
    quantityAvailable: 65,
    categoryId: "new",
    image: placeholderImage("sku-new-008"),
    images: [placeholderImage("sku-new-008-1"), placeholderImage("sku-new-008-2"), placeholderImage("sku-new-008-3"), placeholderImage("sku-new-008-4")],
    description: "Adjustable cotton baseball cap with embroidered logo",
    rating: 4.3,
    reviewCount: 89,
    features: ["Adjustable", "Cotton", "Embroidered"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A classic cap shape with a curved brim and a comfortable fit that works year-round.",
        "Simple detailing keeps it easy to pair with streetwear, athleisure, or denim.",
      ],
    },
  },
  {
    id: "sku-new-009",
    name: "Wool Scarf",
    price: 38.0,
    quantityAvailable: 22,
    categoryId: "new",
    image: placeholderImage("sku-new-009"),
    images: [placeholderImage("sku-new-009-1"), placeholderImage("sku-new-009-2"), placeholderImage("sku-new-009-3"), placeholderImage("sku-new-009-4")],
    description: "Soft merino wool scarf for cold weather",
    rating: 4.7,
    reviewCount: 134,
    features: ["Merino wool", "Warm", "Soft"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A cozy scarf with a refined finish—warm without feeling overly bulky around the neck.",
        "It drapes nicely and adds texture to coats, jackets, and knitwear in colder weather.",
      ],
    },
  },
  {
    id: "sku-new-010",
    name: "Training Shorts",
    price: 32.99,
    quantityAvailable: 45,
    categoryId: "new",
    image: placeholderImage("sku-new-010"),
    images: [placeholderImage("sku-new-010-1"), placeholderImage("sku-new-010-2"), placeholderImage("sku-new-010-3"), placeholderImage("sku-new-010-4")],
    description: "Moisture-wicking shorts for athletic performance",
    rating: 4.5,
    reviewCount: 201,
    features: ["Quick-dry", "Breathable", "Stretchy"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Training shorts designed for movement, with a lightweight feel that stays comfortable during workouts.",
        "Cut to avoid bunching and to keep airflow where you need it most.",
      ],
    },
  },

  // Men (10)
  {
    id: "sku-men-001",
    name: "Men's Polo",
    price: 34.99,
    quantityAvailable: 23,
    categoryId: "men",
    image: placeholderImage("sku-men-001"),
    images: [placeholderImage("sku-men-001-1"), placeholderImage("sku-men-001-2"), placeholderImage("sku-men-001-3"), placeholderImage("sku-men-001-4")],
    description: "Elegant polo shirt for casual or semi-formal wear",
    rating: 4.5,
    reviewCount: 167,
    features: ["Premium fabric", "Breathable", "Elegant"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A smart-casual polo with a crisp collar and a clean placket for an elevated look.",
        "Easy to dress up with chinos or down with denim—ideal for office days and weekends.",
      ],
    },
  },
  {
    id: "sku-men-002",
    name: "Chino Pants",
    price: 49.5,
    quantityAvailable: 9,
    categoryId: "men",
    image: placeholderImage("sku-men-002"),
    images: [placeholderImage("sku-men-002-1"), placeholderImage("sku-men-002-2"), placeholderImage("sku-men-002-3"), placeholderImage("sku-men-002-4")],
    description: "Versatile chino pants for work or casual wear",
    rating: 4.6,
    reviewCount: 213,
    features: ["Comfortable", "Versatile", "Machine washable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Everyday chinos with a tailored line through the leg and enough room to stay comfortable all day.",
        "A dependable choice for work, travel, and casual dinners—pairs well with tees or button-downs.",
      ],
    },
  },
  {
    id: "sku-men-003",
    name: "Leather Belt",
    price: 24.0,
    quantityAvailable: 31,
    categoryId: "men",
    image: placeholderImage("sku-men-003"),
    images: [placeholderImage("sku-men-003-1"), placeholderImage("sku-men-003-2"), placeholderImage("sku-men-003-3"), placeholderImage("sku-men-003-4")],
    description: "Premium genuine leather belt with quality buckle",
    rating: 4.7,
    reviewCount: 156,
    features: ["Genuine leather", "Quality buckle", "Durable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A classic belt with a sturdy buckle and a timeless width that works with jeans or trousers.",
        "Built to age well—expect the finish to develop character with wear.",
      ],
    },
  },
  {
    id: "sku-men-004",
    name: "Oxford Shirt",
    price: 44.0,
    quantityAvailable: 13,
    categoryId: "men",
    image: placeholderImage("sku-men-004"),
    images: [placeholderImage("sku-men-004-1"), placeholderImage("sku-men-004-2"), placeholderImage("sku-men-004-3"), placeholderImage("sku-men-004-4")],
    description: "Classic oxford shirt for formal occasions",
    rating: 4.8,
    reviewCount: 234,
    features: ["Classic style", "Premium cotton", "Easy care"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A wardrobe staple with a structured collar and a reliable, crisp look that holds up throughout the day.",
        "Wear it tucked for formal settings or open over a tee for a relaxed twist.",
      ],
    },
  },
  {
    id: "sku-men-005",
    name: "Trail Sneaker",
    price: 92.0,
    quantityAvailable: 0,
    categoryId: "men",
    image: placeholderImage("sku-men-005"),
    images: [placeholderImage("sku-men-005-1"), placeholderImage("sku-men-005-2"), placeholderImage("sku-men-005-3"), placeholderImage("sku-men-005-4")],
    description: "Rugged sneakers designed for trail hiking",
    rating: 4.9,
    reviewCount: 298,
    features: ["Grip sole", "Waterproof", "Lightweight"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Trail-ready footwear with a supportive chassis and confident traction for uneven ground.",
        "A protective build helps on longer walks while staying comfortable for everyday wear.",
      ],
    },
  },
  {
    id: "sku-men-006",
    name: "Bomber Jacket",
    price: 119.0,
    quantityAvailable: 7,
    categoryId: "men",
    image: placeholderImage("sku-men-006"),
    images: [placeholderImage("sku-men-006-1"), placeholderImage("sku-men-006-2"), placeholderImage("sku-men-006-3"), placeholderImage("sku-men-006-4")],
    description: "Classic bomber jacket with ribbed collar and cuffs",
    rating: 4.7,
    reviewCount: 189,
    features: ["Classic style", "Warm", "Versatile"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A classic bomber profile with clean lines and a versatile length that layers easily.",
        "Works across seasons—throw it over knits or tees for an instant upgrade.",
      ],
    },
  },
  {
    id: "sku-men-007",
    name: "Denim Jacket",
    price: 79.0,
    quantityAvailable: 16,
    categoryId: "men",
    image: placeholderImage("sku-men-007"),
    images: [placeholderImage("sku-men-007-1"), placeholderImage("sku-men-007-2"), placeholderImage("sku-men-007-3"), placeholderImage("sku-men-007-4")],
    description: "Timeless denim jacket with vintage wash",
    rating: 4.6,
    reviewCount: 234,
    features: ["Durable denim", "Vintage wash", "Classic"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A rugged denim layer with a vintage-inspired look that gets better the more you wear it.",
        "Great for layering—add it over hoodies, flannels, or simple tees.",
      ],
    },
  },
  {
    id: "sku-men-008",
    name: "Wool Sweater",
    price: 68.0,
    quantityAvailable: 12,
    categoryId: "men",
    image: placeholderImage("sku-men-008"),
    images: [placeholderImage("sku-men-008-1"), placeholderImage("sku-men-008-2"), placeholderImage("sku-men-008-3"), placeholderImage("sku-men-008-4")],
    description: "Soft wool sweater perfect for layering",
    rating: 4.8,
    reviewCount: 176,
    features: ["Warm wool", "Soft", "Comfortable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A warm knit with a balanced thickness—cozy on its own and easy under a coat.",
        "Clean finishing at the cuffs and hem gives it a polished, everyday feel.",
      ],
    },
  },
  {
    id: "sku-men-009",
    name: "Cargo Shorts",
    price: 44.0,
    quantityAvailable: 28,
    categoryId: "men",
    image: placeholderImage("sku-men-009"),
    images: [placeholderImage("sku-men-009-1"), placeholderImage("sku-men-009-2"), placeholderImage("sku-men-009-3"), placeholderImage("sku-men-009-4")],
    description: "Utility cargo shorts with multiple pockets",
    rating: 4.4,
    reviewCount: 145,
    features: ["Multiple pockets", "Durable", "Comfortable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Utility shorts with practical pocketing and a comfortable fit for warm days and travel.",
        "Built to move in—ideal for outdoor errands, walks, and casual weekends.",
      ],
    },
  },
  {
    id: "sku-men-010",
    name: "Henley Shirt",
    price: 36.0,
    quantityAvailable: 34,
    categoryId: "men",
    image: placeholderImage("sku-men-010"),
    images: [placeholderImage("sku-men-010-1"), placeholderImage("sku-men-010-2"), placeholderImage("sku-men-010-3"), placeholderImage("sku-men-010-4")],
    description: "Long sleeve henley shirt in soft cotton",
    rating: 4.5,
    reviewCount: 198,
    features: ["Soft cotton", "Long sleeve", "Casual"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A long-sleeve henley with a relaxed vibe and a neat neckline that stands out from a basic tee.",
        "Looks great layered under jackets or worn solo with denim.",
      ],
    },
  },

  // Women (10)
  {
    id: "sku-women-001",
    name: "Women's Blouse",
    price: 39.99,
    quantityAvailable: 17,
    categoryId: "women",
    image: placeholderImage("sku-women-001"),
    images: [placeholderImage("sku-women-001-1"), placeholderImage("sku-women-001-2"), placeholderImage("sku-women-001-3"), placeholderImage("sku-women-001-4")],
    description: "Elegant blouse perfect for work or special occasions",
    rating: 4.6,
    reviewCount: 145,
    features: ["Elegant", "Breathable", "Professional"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A refined blouse with an easy drape and a flattering shape that transitions from desk to dinner.",
        "Light and polished—pair it with tailored pants or denim for a simple, elevated outfit.",
      ],
    },
  },
  {
    id: "sku-women-002",
    name: "High-Waist Jeans",
    price: 69.0,
    quantityAvailable: 8,
    categoryId: "women",
    image: placeholderImage("sku-women-002"),
    images: [placeholderImage("sku-women-002-1"), placeholderImage("sku-women-002-2"), placeholderImage("sku-women-002-3"), placeholderImage("sku-women-002-4")],
    description: "Trendy high-waist jeans with flattering fit",
    rating: 4.7,
    reviewCount: 287,
    features: ["Flattering fit", "Trendy", "Comfortable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "High-rise denim that defines the waist and creates a long, clean line through the leg.",
        "Style tip: pairs especially well with cropped knits, tucked tees, or a structured blazer.",
      ],
    },
  },
  {
    id: "sku-women-003",
    name: "Soft Cardigan",
    price: 59.0,
    quantityAvailable: 5,
    categoryId: "women",
    image: placeholderImage("sku-women-003"),
    images: [placeholderImage("sku-women-003-1"), placeholderImage("sku-women-003-2"), placeholderImage("sku-women-003-3"), placeholderImage("sku-women-003-4")],
    description: "Cozy cardigan perfect for layering",
    rating: 4.8,
    reviewCount: 176,
    features: ["Soft fabric", "Warm", "Versatile"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A cozy cardigan that's perfect for layering—soft, relaxed, and easy to throw on.",
        "Designed for versatile styling: buttoned up as a top or open over dresses and tees.",
      ],
    },
  },
  {
    id: "sku-women-004",
    name: "Everyday Dress",
    price: 74.99,
    quantityAvailable: 12,
    categoryId: "women",
    image: placeholderImage("sku-women-004"),
    images: [placeholderImage("sku-women-004-1"), placeholderImage("sku-women-004-2"), placeholderImage("sku-women-004-3"), placeholderImage("sku-women-004-4")],
    description: "Comfortable dress suitable for any day",
    rating: 4.5,
    reviewCount: 312,
    features: ["Comfortable", "Versatile", "Stylish"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "An effortless dress with an easy silhouette that feels put-together without trying.",
        "Works across seasons—add sneakers for daytime or boots and a jacket for evenings.",
      ],
    },
  },
  {
    id: "sku-women-005",
    name: "Comfort Sneaker",
    price: 84.0,
    quantityAvailable: 2,
    categoryId: "women",
    image: placeholderImage("sku-women-005"),
    images: [placeholderImage("sku-women-005-1"), placeholderImage("sku-women-005-2"), placeholderImage("sku-women-005-3"), placeholderImage("sku-women-005-4")],
    description: "All-day comfort sneakers for active women",
    rating: 4.6,
    reviewCount: 224,
    features: ["Cushioned", "Lightweight", "Stylish"],
    shipping: { shippingType: "Express shipping", estimatedDays: "1-2 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Cushioned everyday sneakers built for long days on your feet and quick city walks.",
        "A clean profile keeps them easy to style with jeans, skirts, or dresses.",
      ],
    },
  },
  {
    id: "sku-women-006",
    name: "Midi Skirt",
    price: 54.0,
    quantityAvailable: 18,
    categoryId: "women",
    image: placeholderImage("sku-women-006"),
    images: [placeholderImage("sku-women-006-1"), placeholderImage("sku-women-006-2"), placeholderImage("sku-women-006-3"), placeholderImage("sku-women-006-4")],
    description: "Flowing midi skirt with elastic waistband",
    rating: 4.5,
    reviewCount: 156,
    features: ["Flowing fabric", "Elastic waist", "Versatile"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A flowing midi skirt with movement and a flattering length that works for casual or dressed-up looks.",
        "Wear it with a fitted tee for balance, or layer with a sweater when it gets cooler.",
      ],
    },
  },
  {
    id: "sku-women-007",
    name: "Denim Jacket",
    price: 72.0,
    quantityAvailable: 11,
    categoryId: "women",
    image: placeholderImage("sku-women-007"),
    images: [placeholderImage("sku-women-007-1"), placeholderImage("sku-women-007-2"), placeholderImage("sku-women-007-3"), placeholderImage("sku-women-007-4")],
    description: "Classic denim jacket with modern cut",
    rating: 4.7,
    reviewCount: 289,
    features: ["Classic style", "Modern fit", "Durable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A modern-cut denim jacket that adds structure to outfits without feeling stiff.",
        "Perfect for layering over dresses and tees—an easy, year-round staple.",
      ],
    },
  },
  {
    id: "sku-women-008",
    name: "Yoga Leggings",
    price: 48.0,
    quantityAvailable: 36,
    categoryId: "women",
    image: placeholderImage("sku-women-008"),
    images: [placeholderImage("sku-women-008-1"), placeholderImage("sku-women-008-2"), placeholderImage("sku-women-008-3"), placeholderImage("sku-women-008-4")],
    description: "High-waisted leggings with moisture-wicking fabric",
    rating: 4.8,
    reviewCount: 412,
    features: ["Moisture-wicking", "High-waisted", "Stretchy"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "High-rise leggings designed to stay in place through stretches, walks, and daily errands.",
        "A smooth feel and supportive fit make them a go-to for studio sessions and casual wear.",
      ],
    },
  },
  {
    id: "sku-women-009",
    name: "Silk Scarf",
    price: 42.0,
    quantityAvailable: 24,
    categoryId: "women",
    image: placeholderImage("sku-women-009"),
    images: [placeholderImage("sku-women-009-1"), placeholderImage("sku-women-009-2"), placeholderImage("sku-women-009-3"), placeholderImage("sku-women-009-4")],
    description: "Elegant silk scarf with floral pattern",
    rating: 4.6,
    reviewCount: 98,
    features: ["Pure silk", "Floral design", "Elegant"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A silky accessory that adds color and polish—tie it at the neck, in hair, or on a bag.",
        "Lightweight drape makes it easy to style without overwhelming an outfit.",
      ],
    },
  },
  {
    id: "sku-women-010",
    name: "Crossbody Bag",
    price: 68.0,
    quantityAvailable: 14,
    categoryId: "women",
    image: placeholderImage("sku-women-010"),
    images: [placeholderImage("sku-women-010-1"), placeholderImage("sku-women-010-2"), placeholderImage("sku-women-010-3"), placeholderImage("sku-women-010-4")],
    description: "Compact crossbody bag with adjustable strap",
    rating: 4.7,
    reviewCount: 267,
    features: ["Compact", "Adjustable strap", "Stylish"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A compact crossbody built for everyday essentials, with a shape that sits comfortably at your side.",
        "The adjustable strap lets you wear it high and close or lower for a relaxed look.",
      ],
    },
  },

  // Sale (10)
  {
    id: "sku-sale-001",
    name: "Sale Tee",
    price: 12.99,
    quantityAvailable: 50,
    categoryId: "sale",
    image: placeholderImage("sku-sale-001"),
    images: [placeholderImage("sku-sale-001-1"), placeholderImage("sku-sale-001-2"), placeholderImage("sku-sale-001-3"), placeholderImage("sku-sale-001-4")],
    description: "Amazing deal on premium tee shirt",
    rating: 4.3,
    reviewCount: 98,
    features: ["Affordable", "Quality", "Great value"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A go-to tee that's easy to wear—simple, comfortable, and ready for daily rotation.",
        "Clean finishing makes it great as a base layer under overshirts and jackets.",
      ],
    },
  },
  {
    id: "sku-sale-002",
    name: "Sale Hoodie",
    price: 39.99,
    quantityAvailable: 16,
    categoryId: "sale",
    image: placeholderImage("sku-sale-002"),
    images: [placeholderImage("sku-sale-002-1"), placeholderImage("sku-sale-002-2"), placeholderImage("sku-sale-002-3"), placeholderImage("sku-sale-002-4")],
    description: "Limited time deal on comfortable hoodie",
    rating: 4.5,
    reviewCount: 187,
    features: ["Warm", "Affordable", "Comfortable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A cozy hoodie with a relaxed feel and an easy fit that works for weekends or travel days.",
        "Pairs well with denim or joggers for a low-effort, put-together look.",
      ],
    },
  },
  {
    id: "sku-sale-003",
    name: "Sale Jeans",
    price: 45.0,
    quantityAvailable: 7,
    categoryId: "sale",
    image: placeholderImage("sku-sale-003"),
    images: [placeholderImage("sku-sale-003-1"), placeholderImage("sku-sale-003-2"), placeholderImage("sku-sale-003-3"), placeholderImage("sku-sale-003-4")],
    description: "Discounted classic jeans while stock lasts",
    rating: 4.4,
    reviewCount: 156,
    features: ["Classic fit", "Affordable", "Durable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Classic denim with a timeless look—built for everyday wear and easy styling.",
        "A solid option for casual outfits when you want something reliable and understated.",
      ],
    },
  },
  {
    id: "sku-sale-004",
    name: "Sale Jacket",
    price: 69.0,
    quantityAvailable: 3,
    categoryId: "sale",
    image: placeholderImage("sku-sale-004"),
    images: [placeholderImage("sku-sale-004-1"), placeholderImage("sku-sale-004-2"), placeholderImage("sku-sale-004-3"), placeholderImage("sku-sale-004-4")],
    description: "Last chance to get this jacket at sale price",
    rating: 4.6,
    reviewCount: 134,
    features: ["Stylish", "Affordable", "Quality"],
    shipping: { shippingType: "Express shipping", estimatedDays: "1-2 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A versatile jacket that adds structure and warmth, making it an easy grab-and-go layer.",
        "Works well with tees, knits, and denim for a simple, elevated outfit.",
      ],
    },
  },
  {
    id: "sku-sale-005",
    name: "Sale Sneaker",
    price: 59.0,
    quantityAvailable: 0,
    categoryId: "sale",
    image: placeholderImage("sku-sale-005"),
    images: [placeholderImage("sku-sale-005-1"), placeholderImage("sku-sale-005-2"), placeholderImage("sku-sale-005-3"), placeholderImage("sku-sale-005-4")],
    description: "Out of stock - Check back soon for restocks",
    rating: 4.7,
    reviewCount: 267,
    features: ["Affordable", "Comfortable", "Popular"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A comfortable sneaker profile designed for daily wear and casual styling.",
        "If your size is unavailable, check back—restocks rotate in regularly.",
      ],
    },
  },
  {
    id: "sku-sale-006",
    name: "Sale Polo Shirt",
    price: 24.99,
    quantityAvailable: 38,
    categoryId: "sale",
    image: placeholderImage("sku-sale-006"),
    images: [placeholderImage("sku-sale-006-1"), placeholderImage("sku-sale-006-2"), placeholderImage("sku-sale-006-3"), placeholderImage("sku-sale-006-4")],
    description: "Classic polo shirt at clearance price",
    rating: 4.4,
    reviewCount: 176,
    features: ["Classic style", "Affordable", "Quality"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A classic polo shape with an easy, smart-casual vibe that looks good beyond the weekend.",
        "Wear it solo or under a light jacket for a clean, layered look.",
      ],
    },
  },
  {
    id: "sku-sale-007",
    name: "Sale Backpack",
    price: 54.0,
    quantityAvailable: 9,
    categoryId: "sale",
    image: placeholderImage("sku-sale-007"),
    images: [placeholderImage("sku-sale-007-1"), placeholderImage("sku-sale-007-2"), placeholderImage("sku-sale-007-3"), placeholderImage("sku-sale-007-4")],
    description: "Spacious backpack with laptop compartment on sale",
    rating: 4.6,
    reviewCount: 234,
    features: ["Spacious", "Laptop pocket", "Durable"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "An everyday backpack with a practical layout—made to handle work, school, or weekend plans.",
        "Comfortable carry and durable build help it hold up to daily commuting.",
      ],
    },
  },
  {
    id: "sku-sale-008",
    name: "Sale Sunglasses",
    price: 29.0,
    quantityAvailable: 22,
    categoryId: "sale",
    image: placeholderImage("sku-sale-008"),
    images: [placeholderImage("sku-sale-008-1"), placeholderImage("sku-sale-008-2"), placeholderImage("sku-sale-008-3"), placeholderImage("sku-sale-008-4")],
    description: "Polarized sunglasses with UV protection",
    rating: 4.5,
    reviewCount: 189,
    features: ["Polarized", "UV protection", "Stylish"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: {
      title: "Details",
      paragraphs: [
        "Everyday sunglasses with a modern shape that suits a wide range of face styles.",
        "Lightweight and easy to wear—ideal for commuting, travel, and weekend outings.",
      ],
    },
  },
  {
    id: "sku-sale-009",
    name: "Sale Watch",
    price: 79.0,
    quantityAvailable: 5,
    categoryId: "sale",
    image: placeholderImage("sku-sale-009"),
    images: [placeholderImage("sku-sale-009-1"), placeholderImage("sku-sale-009-2"), placeholderImage("sku-sale-009-3"), placeholderImage("sku-sale-009-4")],
    description: "Minimalist watch with leather strap",
    rating: 4.7,
    reviewCount: 312,
    features: ["Minimalist", "Leather strap", "Quality"],
    shipping: { shippingType: "Express shipping", estimatedDays: "1-2 days" },
    details: {
      title: "Details",
      paragraphs: [
        "A minimalist watch that adds a refined touch without feeling flashy.",
        "Clean dial design keeps it versatile across casual and dressed looks.",
      ],
    },
  },
  {
    id: "sku-sale-010",
    name: "Sale Wallet",
    price: 19.99,
    quantityAvailable: 41,
    categoryId: "sale",
    details: {
      title: "Details",
      paragraphs: [
        "A slim wallet designed to keep essentials organized without bulk in your pocket.",
        "A practical everyday piece with a clean finish and a sturdy, structured feel.",
      ],
    },
    image: placeholderImage("sku-sale-010"),
    images: [placeholderImage("sku-sale-010-1"), placeholderImage("sku-sale-010-2"), placeholderImage("sku-sale-010-3"), placeholderImage("sku-sale-010-4")],
    description: "Slim leather wallet with RFID protection",
    rating: 4.3,
    reviewCount: 145,
    features: ["Slim design", "RFID protection", "Leather"],
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
  },
];

export const getProductById = (id: string) => products.find((p) => p.id === id);

export const getProductsByQuery = (q?: string) => {
  // Simple filtering to keep screens light. Swap for API query params later.
  const normalized = (q ?? "").trim().toLowerCase();
  if (!normalized) return products;

  // Category query (e.g. "men", "sale")
  const match = categories.find((c) => c.query === normalized);
  if (match) return products.filter((p) => p.categoryId === match.id);

  // Free-text search (e.g. from Home Searchbar)
  return products.filter((p) => p.name.toLowerCase().includes(normalized));
};

export const getFeaturedProducts = () => {
  // Keep Home light: show a curated slice
  return [
    products.find((p) => p.id === "sku-new-003"),
    products.find((p) => p.id === "sku-men-001"),
    products.find((p) => p.id === "sku-women-004"),
    products.find((p) => p.id === "sku-sale-002"),
    products.find((p) => p.id === "sku-new-001"),
  ].filter(Boolean) as CatalogProduct[];
};
