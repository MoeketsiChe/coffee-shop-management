import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const ORDER_STATUSES = [
  "Pending",
  "Preparing",
  "Ready",
  "Collected"
];

const PRODUCT_CATEGORIES = [
  "Coffee",
  "Cold Drinks",
  "Tea",
  "Bakery",
  "Food",
  "Desserts",
  "Snacks"
];

const HERO_SLIDES = [
  {
    eyebrow: "WELCOME TO KOFI & CO",
    title: "A better day starts with better coffee.",
    description:
      "Discover carefully prepared coffee, refreshing drinks and freshly made treats.",
    button: "Explore Our Menu",
    image: "hero-coffee"
  },
  {
    eyebrow: "CRAFTED FOR YOUR MOMENTS",
    title: "Find your perfect coffee moment.",
    description:
      "From rich espresso to refreshing iced favourites, there is something waiting for you.",
    button: "Shop Coffee",
    image: "hero-latte"
  },
  {
    eyebrow: "GOOD COFFEE. GOOD COMPANY.",
    title: "Make every moment a little richer.",
    description:
      "Explore our menu and order your favourites from Kofi & CO.",
    button: "Order Now",
    image: "hero-cafe"
  }
];

function getLesothoDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Maseru",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}-${month}-${day}`;
}

function formatMoney(amount) {
  return `M ${Number(amount || 0).toFixed(2)}`;
}

/* =========================================
   AUTOMATIC PRODUCT IMAGES
   Name keywords are checked first, then the category.
========================================= */

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;

// Every image lives here. If a photo looks wrong or is broken,
// change only its ID on the matching line.
const COFFEE_IMAGES = {
  // General
  coffee: unsplash("photo-1509042239860-f550ce710b93"),
  latte: unsplash("photo-1461023058943-07fcbe16d735"),
  cold: unsplash("photo-1517701604599-bb29b565090c"),
  bakery: unsplash("photo-1555507036-ab1f4038808a"),
  food: unsplash("photo-1509440159596-0249088772ff"),
  cafe: unsplash("photo-1445116572660-236099ec97a0"),
  water: unsplash("photo-1548839140-29a749e1cf4d"),
  tea: unsplash("photo-1544787219-7f47ccb76574"),
  smoothie: unsplash("photo-1505252585461-04db1eb84625"),
  donut: unsplash("photo-1551024601-bec78aea704b"),
  cake: unsplash("photo-1578985545062-69928b1d9587"),
  cookie: unsplash("photo-1499636136210-6f4ee915583e"),
  sandwich: unsplash("photo-1528735602780-2552fd46c7af"),
  burger: unsplash("photo-1568901346375-23c9450c58cd"),
  pizza: unsplash("photo-1565299624946-b28f40a0ae38"),
  dessert: unsplash("photo-1565958011703-44f9829ba187"),

  // Coffee
  espresso: unsplash("photo-1510707577719-ae7c14805e3a"),
  cappuccino: unsplash("photo-1572442388796-11668a67e53d"),
  "caffe-latte": unsplash("photo-1570968915860-54d5c301fa9f"),
  americano: unsplash("photo-1551030173-122aabc4489c"),
  mocha: unsplash("photo-1607260550778-aa9d29444ce1"),

  // Cold Drinks
  "iced-latte": unsplash("photo-1517701604599-bb29b565090c"),
  "iced-mocha": unsplash("photo-1578314675249-a6910f80cc4e"),
  "cold-brew": unsplash("photo-1517701550927-30cf4ba1dba5"),
  "choc-shake": unsplash("photo-1572490122747-3968b75cc699"),
  "vanilla-shake": unsplash("photo-1579954115545-a95591f28bfc"),
  "oreo-shake": unsplash("photo-1541658016709-82535e94bc69"),
  "mango-smoothie": unsplash("photo-1623065422902-30a2d299bbe4"),
  "strawberry-banana": unsplash("photo-1553530666-ba11a7da3888"),
  "peach-tea": unsplash("photo-1556679343-c7306c1976bc"),
  "lemon-tea": unsplash("photo-1499638673689-79a0b5115d87"),
  lemonade: unsplash("photo-1621263764928-df1444c5e859"),
  "passion-fruit": unsplash("photo-1546171753-97d7676e4602"),

  // Snacks
  nuggets: unsplash("photo-1562967914-608f82629710"),
  fries: unsplash("photo-1573080496219-bb080dd4f877"),
  wrap: unsplash("photo-1626700051175-6818013e1d4f"),
  toastie: unsplash("photo-1528735602780-2552fd46c7af"),
  "garlic-bread": unsplash("photo-1573140247632-f8fd74997d5c"),

  // Desserts
  brownie: unsplash("photo-1564355808539-22fda35bed7e"),
  cheesecake: unsplash("photo-1533134242443-d4fd215305ad"),
  lava: unsplash("photo-1624353365286-3f8d62daad51"),
  tiramisu: unsplash("photo-1571877227200-a0d98ea607e9"),
  sundae: unsplash("photo-1563805042-7684c019e1cb"),

  // Food
  "chicken-burger": unsplash("photo-1568901346375-23c9450c58cd"),
  "grilled-sandwich": unsplash("photo-1606755962773-d324e0a13086"),
  alfredo: unsplash("photo-1645112411341-6c4fd023714a"),
  lasagna: unsplash("photo-1574894709920-11b28e7367e3"),
  salad: unsplash("photo-1512621776951-a57141f2eefd"),

  // Tea
  "english-tea": unsplash("photo-1544787219-7f47ccb76574"),
  "green-tea": unsplash("photo-1556881286-fc6915169721"),

  // Bakery
  croissant: unsplash("photo-1555507036-ab1f4038808a"),
  muffin: unsplash("photo-1607958996333-41aef7caefaa"),
  "cinnamon-roll": unsplash("photo-1509365465985-25d11c17e812"),
  "choc-cookie": unsplash("photo-1499636136210-6f4ee915583e"),
  "banana-bread": unsplash("photo-1585478259715-876acc5be8eb")
};

// Menu items staff can pick when adding a product.
// Each entry is [item name, image key from COFFEE_IMAGES, description].
// The description is filled in automatically when the item is chosen.
// A category with groups shows them as headings in the dropdown.
const MENU_PRESETS = {
  Coffee: [
    {
      group: null,
      items: [
        ["Espresso", "espresso", "A short, intense shot of freshly pulled espresso with a rich golden crema."],
        ["Cappuccino", "cappuccino", "Equal parts espresso, steamed milk and thick velvety foam, finished with a light dusting of cocoa."],
        ["Caffè Latte", "caffe-latte", "Smooth espresso topped with plenty of silky steamed milk and a thin layer of foam."],
        ["Americano", "americano", "Bold espresso lengthened with hot water for a clean, full-bodied cup."],
        ["Mocha", "mocha", "Espresso blended with rich chocolate and steamed milk, topped with cream."]
      ]
    }
  ],
  "Cold Drinks": [
    {
      group: "Iced Coffee",
      items: [
        ["Iced Latte", "iced-latte", "Chilled espresso poured over ice and cold milk for a smooth, refreshing coffee."],
        ["Iced Mocha", "iced-mocha", "Espresso, chocolate and cold milk over ice, finished with whipped cream."],
        ["Cold Brew", "cold-brew", "Coffee steeped slowly for 18 hours, served over ice. Smooth, low in acidity and naturally sweet."]
      ]
    },
    {
      group: "Milkshakes",
      items: [
        ["Chocolate Milkshake", "choc-shake", "Thick and creamy milkshake made with rich chocolate and vanilla ice cream."],
        ["Vanilla Milkshake", "vanilla-shake", "A classic milkshake blended with real vanilla ice cream and cold milk."],
        ["Oreo Milkshake", "oreo-shake", "Creamy milkshake blended with crushed Oreo cookies and topped with whipped cream."]
      ]
    },
    {
      group: "Smoothies",
      items: [
        ["Mango Smoothie", "mango-smoothie", "Sweet ripe mango blended with yoghurt and ice into a tropical, silky smoothie."],
        ["Strawberry Banana Smoothie", "strawberry-banana", "Fresh strawberries and banana blended with yoghurt for a fruity, filling drink."]
      ]
    },
    {
      group: "Iced Tea",
      items: [
        ["Peach Iced Tea", "peach-tea", "Black tea chilled over ice with sweet peach flavour."],
        ["Lemon Iced Tea", "lemon-tea", "Crisp black tea served cold with a fresh squeeze of lemon."]
      ]
    },
    {
      group: "Refreshers",
      items: [
        ["Lemonade", "lemonade", "Freshly squeezed lemons, a touch of sugar and plenty of ice. Tangy and cooling."],
        ["Passion Fruit Refresher", "passion-fruit", "A bright, tangy passion fruit drink served over ice with a hint of sweetness."]
      ]
    }
  ],
  Snacks: [
    {
      group: null,
      items: [
        ["Chicken Nuggets", "nuggets", "Golden crumbed chicken pieces, crispy outside and tender inside, served with dipping sauce."],
        ["French Fries", "fries", "Thick-cut potato fries fried until golden and lightly salted."],
        ["Chicken Wrap", "wrap", "Grilled chicken, crisp lettuce and creamy sauce rolled in a warm tortilla."],
        ["Cheese Toastie", "toastie", "Toasted bread filled with melted cheese, crisp on the outside and gooey inside."],
        ["Garlic Bread", "garlic-bread", "Toasted bread brushed with garlic butter and herbs."]
      ]
    }
  ],
  Desserts: [
    {
      group: null,
      items: [
        ["Chocolate Brownie", "brownie", "Dense, fudgy chocolate brownie with a soft centre and crackly top."],
        ["Cheesecake", "cheesecake", "Creamy baked cheesecake on a buttery biscuit base."],
        ["Chocolate Lava Cake", "lava", "Warm chocolate cake with a molten centre that flows when you cut into it."],
        ["Tiramisu", "tiramisu", "Layers of coffee-soaked sponge and mascarpone cream, dusted with cocoa."],
        ["Ice Cream Sundae", "sundae", "Scoops of vanilla ice cream with sauce, whipped cream and a cherry on top."]
      ]
    }
  ],
  Food: [
    {
      group: null,
      items: [
        ["Chicken Burger", "chicken-burger", "Crispy chicken fillet in a toasted bun with lettuce, tomato and mayo."],
        ["Grilled Chicken Sandwich", "grilled-sandwich", "Juicy grilled chicken breast with fresh salad and sauce between toasted bread."],
        ["Chicken Alfredo Pasta", "alfredo", "Tender chicken and pasta in a rich, creamy parmesan Alfredo sauce."],
        ["Beef Lasagna", "lasagna", "Layers of pasta, slow-cooked beef ragù and creamy sauce, baked with melted cheese."],
        ["Chicken Salad", "salad", "Fresh greens, grilled chicken, tomato and cucumber with a light dressing."]
      ]
    }
  ],
  Tea: [
    {
      group: null,
      items: [
        ["English Breakfast Tea", "english-tea", "A robust black tea blend with a full flavour, lovely with or without milk."],
        ["Green Tea", "green-tea", "Light, fresh and gently earthy green tea served hot."]
      ]
    }
  ],
  Bakery: [
    {
      group: null,
      items: [
        ["Croissants", "croissant", "Flaky, buttery layers baked golden and served fresh."],
        ["Blueberry Muffins", "muffin", "Soft, moist muffins bursting with juicy blueberries."],
        ["Cinnamon Rolls", "cinnamon-roll", "Warm, soft rolls swirled with cinnamon sugar and topped with sweet icing."],
        ["Chocolate Chip Cookies", "choc-cookie", "Chewy cookies packed with melting chocolate chips."],
        ["Banana Bread", "banana-bread", "Moist homemade-style loaf made with ripe bananas."]
      ]
    }
  ]
};

// Lowercase, trim, and drop a trailing "s" so "Croissant" = "Croissants".
const normalizeName = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/s$/, "");

// Quick lookup: normalized name -> { name, key }
const PRESET_BY_NAME = {};

Object.values(MENU_PRESETS).forEach((groups) => {
  groups.forEach((group) => {
    group.items.forEach(([name, key, description]) => {
      PRESET_BY_NAME[normalizeName(name)] = { name, key, description };
    });
  });
});

// Used when the name is not in the list above (typed by hand).
// Most specific keywords first. The first match wins.
const IMAGE_RULES = [
  [/water|sparkling|mineral/, "water"],
  [/oreo/, "oreo-shake"],
  [/milkshake|shake/, "choc-shake"],
  [/mango/, "mango-smoothie"],
  [/strawberry|banana smoothie/, "strawberry-banana"],
  [/smoothie|juice/, "smoothie"],
  [/passion/, "passion-fruit"],
  [/lemonade/, "lemonade"],
  [/peach/, "peach-tea"],
  [/lemon/, "lemon-tea"],
  [/iced mocha|iced chocolate/, "iced-mocha"],
  [/cold brew/, "cold-brew"],
  [/iced|frappe|frappuccino/, "iced-latte"],
  [/green tea|matcha/, "green-tea"],
  [/english|breakfast tea|chai|tea/, "english-tea"],
  [/cappuccino/, "cappuccino"],
  [/mocha/, "mocha"],
  [/americano/, "americano"],
  [/espresso|ristretto|doppio/, "espresso"],
  [/latte|flat white|macchiato/, "caffe-latte"],
  [/espresso|americano|coffee/, "coffee"],
  [/donut|doughnut/, "donut"],
  [/croissant/, "croissant"],
  [/muffin/, "muffin"],
  [/cinnamon/, "cinnamon-roll"],
  [/banana bread/, "banana-bread"],
  [/pastry|scone|bread|bagel|danish/, "bakery"],
  [/cheesecake/, "cheesecake"],
  [/lava/, "lava"],
  [/tiramisu/, "tiramisu"],
  [/sundae|ice cream/, "sundae"],
  [/brownie/, "brownie"],
  [/cake|pudding|waffle/, "cake"],
  [/cookie|biscuit/, "choc-cookie"],
  [/nugget/, "nuggets"],
  [/fries|chips/, "fries"],
  [/garlic bread/, "garlic-bread"],
  [/wrap/, "wrap"],
  [/toastie|toast/, "toastie"],
  [/grilled.*sandwich|chicken sandwich/, "grilled-sandwich"],
  [/sandwich|panini|club/, "sandwich"],
  [/burger/, "chicken-burger"],
  [/pizza/, "pizza"],
  [/alfredo|pasta|spaghetti/, "alfredo"],
  [/lasagna|lasagne/, "lasagna"],
  [/salad/, "salad"],
  [/crisps|popcorn|nuts|snack/, "cookie"]
];

// Used when nothing in the name matches: pick by category.
const CATEGORY_DEFAULTS = {
  coffee: "coffee",
  "cold drinks": "cold",
  tea: "tea",
  bakery: "bakery",
  food: "food",
  desserts: "dessert",
  snacks: "fries"
};

// Order: 1) exact menu item, 2) keywords in the name, 3) category.
function getFallbackProductImage(item = {}) {
  const name = String(item.name || "").toLowerCase();
  const category = String(item.category || "").toLowerCase();

  const preset = PRESET_BY_NAME[normalizeName(item.name)];
  if (preset) return COFFEE_IMAGES[preset.key];

  for (const [pattern, key] of IMAGE_RULES) {
    if (pattern.test(name)) return COFFEE_IMAGES[key];
  }

  const categoryKey = CATEGORY_DEFAULTS[category];
  if (categoryKey) return COFFEE_IMAGES[categoryKey];

  return COFFEE_IMAGES.coffee;
}

// A custom image URL always wins over the automatic image.
function getProductImage(item = {}) {
  if (
    typeof item.imageUrl === "string" &&
    item.imageUrl.trim()
  ) {
    return item.imageUrl.trim();
  }

  return getFallbackProductImage(item);
}

function getCategoryImage(category = "") {
  const key = CATEGORY_DEFAULTS[String(category).toLowerCase()];
  return COFFEE_IMAGES[key] || COFFEE_IMAGES.coffee;
}

function getCategoryClass(category = "") {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

// If an image fails to load, try the automatic image for the item,
// then the category image, then a general cafe image.
function handleImageError(event, item) {
  const image = event.currentTarget;
  const step = Number(image.dataset.fallbackStep || 0);

  const options = [
    getFallbackProductImage(item),
    getCategoryImage(item.category),
    COFFEE_IMAGES.cafe
  ];

  if (step >= options.length) return;

  image.dataset.fallbackStep = String(step + 1);
  image.src = options[step];
}

function ProductCard({ item, onAdd }) {
  return (
    <article className="product-card">
      <div className={`product-photo ${getCategoryClass(item.category)}`}>
        <span className="product-photo-label">KOFI SELECTION</span>

        <img
          className="product-photo-image"
          src={getProductImage(item)}
          alt={item.name}
          loading="lazy"
          onError={(event) => handleImageError(event, item)}
        />

        {!item.available && (
          <span className="stock-badge">OUT OF STOCK</span>
        )}
      </div>

      <div className="product-card-content">
        <div className="product-card-category">
          {item.category}
        </div>

        <h3>{item.name}</h3>

        <p className="product-description">
          {item.description}
        </p>

        <div className="product-card-bottom">
          <strong>{formatMoney(item.price)}</strong>

          <span
            className={
              item.available ? "stock-available" : "stock-unavailable"
            }
          >
            {item.available ? "In Stock" : "Unavailable"}
          </span>
        </div>

        <button
          type="button"
          className="product-add-button"
          onClick={() => onAdd(item)}
          disabled={!item.available}
        >
          {item.available ? "Add to Cart" : "Currently Unavailable"}
        </button>
      </div>
    </article>
  );
}

function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("featured");
  const [heroIndex, setHeroIndex] = useState(0);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Staff login and management
  const [staffToken, setStaffToken] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [staffMessage, setStaffMessage] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Coffee");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productAvailable, setProductAvailable] = useState(true);
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productPreset, setProductPreset] = useState("");

  // Staff orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [statusDrafts, setStatusDrafts] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Daily sales report
  const [reportDate, setReportDate] = useState(getLesothoDate());
  const [dailyReport, setDailyReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  // Load menu from backend
  const loadMenu = async () => {
    try {
      const response = await fetch(`${API}/menu`);

      if (!response.ok) {
        throw new Error("Failed to load menu.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The menu response is invalid.");
      }

      setMenu(data);
      setError("");
    } catch {
      setError("Unable to load the coffee menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Load staff orders
  const loadStaffOrders = async (token = staffToken) => {
    if (!token) return;

    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await fetch(`${API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load customer orders.");
      }

      const loadedOrders = Array.isArray(data.orders)
        ? data.orders
        : [];

      setOrders(loadedOrders);

      const drafts = {};

      loadedOrders.forEach((order) => {
        drafts[order.id] = order.status;
      });

      setStatusDrafts(drafts);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load daily sales report
  const loadDailyReport = async (
    token = staffToken,
    date = reportDate
  ) => {
    if (!token || !date) return;

    setReportLoading(true);
    setReportError("");

    try {
      const response = await fetch(
        `${API}/reports/daily?date=${encodeURIComponent(date)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load daily report.");
      }

      setDailyReport(data);
    } catch (err) {
      setDailyReport(null);
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (staffToken) {
      loadStaffOrders(staffToken);
    } else {
      setOrders([]);
      setStatusDrafts({});
    }
  }, [staffToken]);

  useEffect(() => {
    if (staffToken) {
      loadDailyReport(staffToken, reportDate);
    } else {
      setDailyReport(null);
    }
  }, [staffToken, reportDate]);

  // Include standard categories even when they have no products yet.
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set([
        ...PRODUCT_CATEGORIES,
        ...menu.map((item) => item.category).filter(Boolean)
      ])
    ];
  }, [menu]);

  // Search, filter and sort menu
  const filteredMenu = useMemo(() => {
    let products = [...menu];

    if (selectedCategory !== "All") {
      products = products.filter(
        (item) => item.category === selectedCategory
      );
    }

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      products = products.filter((item) =>
        [
          item.name,
          item.category,
          item.description
        ].some((value) =>
          String(value || "").toLowerCase().includes(search)
        )
      );
    }

    if (sortOption === "price-low") {
      products.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === "price-high") {
      products.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOption === "name") {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }

    return products;
  }, [menu, selectedCategory, searchTerm, sortOption]);

  const featuredProducts = useMemo(() => {
    return menu.filter((item) => item.available).slice(0, 3);
  }, [menu]);

  // Cart functions
  const addToCart = (product) => {
    if (!product.available) return;

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });

    setCreatedOrder(null);
    setCheckoutError("");
    setCartPreviewOpen(true);
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Search form
  const handleSearch = (event) => {
    event.preventDefault();

    document.getElementById("shop")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  // Select a category
  const chooseCategory = (category) => {
    setSelectedCategory(category);

    document.getElementById("shop")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  // Hero carousel
  const nextHero = () => {
    setHeroIndex((current) => (current + 1) % HERO_SLIDES.length);
  };

  const previousHero = () => {
    setHeroIndex((current) =>
      (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
    );
  };

  // Customer checkout
  const handleCheckout = async (event) => {
    event.preventDefault();
    setCheckoutError("");

    if (submitting) return;

    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    if (customerName.trim().length < 2) {
      setCheckoutError("Please enter your full name.");
      return;
    }

    const phone = customerPhone.trim().replace(/[\s()-]/g, "");

    if (!/^\+?[0-9]{8,15}$/.test(phone)) {
      setCheckoutError("Please enter a valid phone number.");
      return;
    }

    if (
      customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
      setCheckoutError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer: {
            name: customerName.trim(),
            phone,
            email: customerEmail.trim()
          },
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place your order.");
      }

      setCreatedOrder(data.order);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setTrackingNumber(data.order.orderNumber);
      setTrackedOrder(null);
      setTrackingError("");
      setCartPreviewOpen(false);
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Track customer order
  const handleTrackOrder = async (event) => {
    event.preventDefault();
    setTrackingError("");
    setTrackedOrder(null);

    if (!trackingNumber.trim()) {
      setTrackingError("Please enter your order number.");
      return;
    }

    setTrackingLoading(true);

    try {
      const response = await fetch(
        `${API}/orders/${encodeURIComponent(trackingNumber.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order not found.");
      }

      setTrackedOrder(data);
    } catch (err) {
      setTrackingError(err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Staff login
  const handleStaffLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    setStaffMessage("");
    setStaffLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      setStaffToken(data.token);
      setStaffUsername(data.username);
      setLoginPassword("");
      setStaffMessage("Welcome. You are now logged in.");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setStaffLoading(false);
    }
  };

  const staffLogout = () => {
    setStaffToken("");
    setStaffUsername("");
    setEditingId(null);
    resetProductForm();
    setOrders([]);
    setDailyReport(null);
    setStatusDrafts({});
    setStaffMessage("You have logged out.");
  };

  // Reset menu form
  const resetProductForm = () => {
    setEditingId(null);
    setProductName("");
    setProductCategory("Coffee");
    setProductDescription("");
    setProductPrice("");
    setProductAvailable(true);
    setProductImageUrl("");
    setProductPreset("");
  };

  // Add or update a menu item
  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setStaffMessage("");
    setLoginError("");

    const price = Number(productPrice);
    const trimmedImageUrl = productImageUrl.trim();

    if (
      productName.trim().length < 2 ||
      !productCategory.trim() ||
      !productDescription.trim() ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setStaffMessage("Please enter valid product details.");
      return;
    }

    if (trimmedImageUrl) {
      try {
        const imageUrlObject = new URL(trimmedImageUrl);

        if (
          !["http:", "https:"].includes(imageUrlObject.protocol)
        ) {
          throw new Error();
        }
      } catch {
        setStaffMessage(
          "Please enter a valid image URL beginning with http:// or https://."
        );
        return;
      }
    }

    const product = {
      name: productName.trim(),
      category: productCategory,
      description: productDescription.trim(),
      price,
      available: productAvailable,
      imageUrl: trimmedImageUrl
    };

    setStaffLoading(true);

    try {
      const url = editingId
        ? `${API}/menu/${editingId}`
        : `${API}/menu`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${staffToken}`
        },
        body: JSON.stringify(product)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save product.");
      }

      await loadMenu();

      const wasEditing = Boolean(editingId);
      resetProductForm();

      setStaffMessage(
        wasEditing
          ? "Menu item updated successfully."
          : "Menu item added successfully."
      );
    } catch (err) {
      setStaffMessage(err.message);
    } finally {
      setStaffLoading(false);
    }
  };

  // Select product for editing
  const editProduct = (item) => {
    setEditingId(item.id);
    setProductName(item.name);
    setProductCategory(item.category);
    setProductDescription(item.description);
    setProductPrice(String(item.price));
    setProductAvailable(item.available);
    setProductImageUrl(item.imageUrl || "");
    setProductPreset(PRESET_BY_NAME[normalizeName(item.name)]?.name || "");

    document.getElementById("staff-form")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  // Delete menu item
  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) return;

    setStaffLoading(true);
    setStaffMessage("");

    try {
      const response = await fetch(`${API}/menu/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${staffToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete product.");
      }

      await loadMenu();

      if (editingId === id) {
        resetProductForm();
      }

      setStaffMessage("Menu item deleted successfully.");
    } catch (err) {
      setStaffMessage(err.message);
    } finally {
      setStaffLoading(false);
    }
  };

  // Change selected status for an order
  const handleStatusDraft = (orderId, status) => {
    setStatusDrafts((current) => ({
      ...current,
      [orderId]: status
    }));
  };

  // Save an order status
  const updateOrderStatus = async (order) => {
    const newStatus = statusDrafts[order.id];

    if (!newStatus || newStatus === order.status) {
      return;
    }

    setUpdatingOrderId(order.id);
    setOrdersError("");
    setStaffMessage("");

    try {
      const response = await fetch(
        `${API}/orders/${encodeURIComponent(order.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${staffToken}`
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update order status.");
      }

      setStaffMessage(
        `Order ${order.orderNumber} updated to ${newStatus}.`
      );

      await Promise.all([
        loadStaffOrders(),
        loadDailyReport()
      ]);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-GB", {
      timeZone: "Africa/Maseru",
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  // Picking a menu item fills in the name and description; the image follows the name.
  const handlePresetChange = (event) => {
    const value = event.target.value;
    setProductPreset(value);

    if (value) {
      setProductName(value);

      const description =
        PRESET_BY_NAME[normalizeName(value)]?.description;

      if (description) {
        setProductDescription(description);
      }
    }
  };

  // Typing a different name switches back to "Other".
  const handleNameChange = (event) => {
    const value = event.target.value;
    setProductName(value);

    if (productPreset && value !== productPreset) {
      setProductPreset("");
    }
  };

  const currentSlide = HERO_SLIDES[heroIndex];

  // Live preview for the staff product form
  const productPreview = {
    name: productName || "Product name",
    category: productCategory,
    imageUrl: productImageUrl.trim()
  };

  return (
    <div className="app">

      {/* ANNOUNCEMENT BAR */}
      <div className="announcement-bar">
        <p>WELCOME TO KOFI & CO ONLINE COFFEE SHOP</p>
        <a href="#about">Discover Our Story</a>
      </div>

      {/* MAIN HEADER */}
      <header className="main-header">
        <a href="#home" className="brand">
          <span className="brand-mark">K</span>
          <span className="brand-name">
            KOFI <span>& CO</span>
            <small>COFFEE HOUSE</small>
          </span>
        </a>

        <form className="header-search" onSubmit={handleSearch}>
          <select
            aria-label="Select product category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <input
            type="search"
            placeholder="Search coffee, drinks and treats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button type="submit" aria-label="Search products">
            <span>Search</span>
          </button>
        </form>

        <div className="header-actions">
          <a href="#staff" className="header-account">
            <span>
              <small>Welcome</small>
              <strong>My Account</strong>
            </span>
          </a>

          <div className="header-cart-wrap">
            <button
              type="button"
              className="header-cart"
              onClick={() => setCartPreviewOpen((open) => !open)}
              aria-expanded={cartPreviewOpen}
            >
              <span>
                <small>Shopping Cart</small>
                <strong>{formatMoney(total)}</strong>
              </span>

              <span className="cart-count">{cartCount}</span>
            </button>

            {cartPreviewOpen && (
              <div className="cart-preview">
                <div className="cart-preview-heading">
                  <strong>Your Cart</strong>

                  <button
                    type="button"
                    onClick={() => setCartPreviewOpen(false)}
                    aria-label="Close cart preview"
                  >
                    ×
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p>Your shopping cart is empty.</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div className="cart-preview-item" key={item.id}>
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          loading="lazy"
                          onError={(event) =>
                            handleImageError(event, item)
                          }
                        />

                        <span>
                          {item.name} × {item.quantity}
                        </span>

                        <strong>
                          {formatMoney(item.price * item.quantity)}
                        </strong>
                      </div>
                    ))}

                    <div className="cart-preview-total">
                      <span>Subtotal</span>
                      <strong>{formatMoney(total)}</strong>
                    </div>

                    <a
                      href="#cart"
                      className="cart-preview-button"
                      onClick={() => setCartPreviewOpen(false)}
                    >
                      View Shopping Cart
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CATEGORY NAVIGATION */}
      <nav className="category-navbar">
        <a href="#home" className="nav-home">HOME</a>
        <a href="#shop">SHOP</a>

        <div className="nav-dropdown">
          <a href="#categories">CATEGORIES</a>

          <div className="nav-dropdown-menu">
            {categories
              .filter((category) => category !== "All")
              .map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => chooseCategory(category)}
                >
                  {category}
                </button>
              ))}
          </div>
        </div>

        <a href="#featured">FEATURED</a>
        <a href="#tracking">TRACK ORDER</a>
        <a href="#about">ABOUT US</a>
      </nav>

      {/* HERO CAROUSEL */}
      <section
        className={`hero-carousel ${currentSlide.image}`}
        id="home"
      >
        <div className="hero-overlay">
          <div className="hero-content" key={heroIndex}>
            <p className="hero-eyebrow">{currentSlide.eyebrow}</p>
            <h1>{currentSlide.title}</h1>

            <p className="hero-description">
              {currentSlide.description}
            </p>

            <a href="#shop" className="hero-button">
              {currentSlide.button}
            </a>
          </div>

          <div className="hero-controls">
            <button
              type="button"
              onClick={previousHero}
              aria-label="Previous banner"
            >
              Previous
            </button>

            <div className="hero-dots">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  type="button"
                  key={slide.title}
                  className={index === heroIndex ? "active" : ""}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Show banner ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextHero}
              aria-label="Next banner"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* SERVICE HIGHLIGHTS */}
      <section className="service-strip">
        <div className="service-item">
          <div>
            <strong>Quality Coffee</strong>
            <small>Carefully prepared favourites</small>
          </div>
        </div>

        <div className="service-item">
          <div>
            <strong>Freshly Prepared</strong>
            <small>Made with care and attention</small>
          </div>
        </div>

        <div className="service-item">
          <div>
            <strong>Made for You</strong>
            <small>Find your everyday favourite</small>
          </div>
        </div>
      </section>

      {/* CATEGORY HIGHLIGHTS */}
      <section className="category-section" id="categories">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">EXPLORE OUR SELECTION</span>
            <h2>Shop by Category</h2>
            <p>Find something delicious for your next coffee moment.</p>
          </div>

          <a href="#shop" className="text-link">View All Products</a>
        </div>

        <div className="category-grid">
          {categories
            .filter((category) => category !== "All")
            .map((category) => (
              <button
                type="button"
                className={`category-tile ${getCategoryClass(category)}`}
                key={category}
                onClick={() => chooseCategory(category)}
              >
                <img
                  className="category-tile-image"
                  src={getCategoryImage(category)}
                  alt={`${category} selection`}
                  loading="lazy"
                  onError={(event) =>
                    handleImageError(event, { category })
                  }
                />

                <span className="category-tile-name">{category}</span>
                <span className="category-tile-link">
                  Explore Collection
                </span>
              </button>
            ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-section" id="featured">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">HANDPICKED FOR YOU</span>
            <h2>Our Featured Favourites</h2>
            <p>A few favourites from the Kofi & CO menu.</p>
          </div>

          <a href="#shop" className="text-link">Shop All</a>
        </div>

        {loading ? (
          <p className="empty-state">Loading featured products...</p>
        ) : featuredProducts.length === 0 ? (
          <p className="empty-state">
            No available products to feature right now.
          </p>
        ) : (
          <div className="product-grid featured-grid">
            {featuredProducts.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onAdd={addToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* PROMOTIONAL BANNER */}
      <section className="promo-banner">
        <div className="promo-banner-content">
          <span className="section-eyebrow">YOUR COFFEE MOMENT</span>
          <h2>Good coffee makes everything better.</h2>

          <p>
            Discover your next favourite from our carefully selected menu.
          </p>

          <a href="#shop" className="hero-button">
            Explore the Menu
          </a>
        </div>
      </section>

      {/* SHOP CATALOGUE */}
      <section className="shop-section" id="shop">
        <div className="section-heading shop-heading">
          <div>
            <span className="section-eyebrow">THE KOFI COLLECTION</span>
            <h2>Shop Our Menu</h2>
            <p>Browse our selection and add your favourites to your cart.</p>
          </div>

          <span className="product-count">
            {filteredMenu.length} PRODUCTS
          </span>
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <div className="filter-group">
              <h3>Product Categories</h3>

              <div className="category-filter-list">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={
                      selectedCategory === category ? "selected" : ""
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span>{category}</span>

                    <span>
                      {category === "All"
                        ? menu.length
                        : menu.filter(
                            (item) => item.category === category
                          ).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-note">
              <strong>Made with care.</strong>
              <p>Explore the Kofi & CO selection.</p>
            </div>
          </aside>

          <div className="shop-main">
            <div className="shop-toolbar">
              <p>
                Showing <strong>{filteredMenu.length}</strong> products
              </p>

              <label>
                Sort by:

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </label>
            </div>

            {loading && (
              <p className="empty-state">Loading our menu...</p>
            )}

            {error && <p className="error">{error}</p>}

            {!loading && !error && filteredMenu.length === 0 && (
              <div className="no-products">
                <span>Search</span>
                <h3>No products found</h3>
                <p>Try another search term or category.</p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && !error && filteredMenu.length > 0 && (
              <div className="product-grid">
                {filteredMenu.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SHOPPING CART */}
      <section className="cart-section" id="cart">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">YOUR SELECTION</span>
            <h2>Shopping Cart</h2>
            <p>Review your selected items before checkout.</p>
          </div>

          <span className="product-count">{cartCount} ITEMS</span>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-panel">
            <h3>Your cart is currently empty.</h3>
            <p>Explore our menu and add something you love.</p>
            <a href="#shop" className="hero-button">Continue Shopping</a>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div
                    className={`cart-item-image ${getCategoryClass(item.category)}`}
                  >
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      loading="lazy"
                      onError={(event) =>
                        handleImageError(event, item)
                      }
                    />
                  </div>

                  <div className="cart-details">
                    <span className="category">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p>{formatMoney(item.price)} each</p>
                  </div>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.id)}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>

                  <strong className="cart-line-total">
                    {formatMoney(item.price * item.quantity)}
                  </strong>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <h3>Cart Summary</h3>

              <div className="cart-summary-line">
                <span>Items</span>
                <strong>{cartCount}</strong>
              </div>

              <div className="cart-summary-line">
                <span>Subtotal</span>
                <strong>{formatMoney(total)}</strong>
              </div>

              <div className="cart-summary-total">
                <span>Order Total</span>
                <strong>{formatMoney(total)}</strong>
              </div>

              <a href="#checkout" className="checkout-button">
                Proceed to Checkout
              </a>

              <a href="#shop" className="continue-shopping">
                Continue Shopping
              </a>
            </aside>
          </div>
        )}
      </section>

      {/* CHECKOUT */}
      <section className="checkout-section" id="checkout">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">COMPLETE YOUR ORDER</span>
            <h2>Checkout</h2>
            <p>Enter your details to place your order.</p>
          </div>
        </div>

        {createdOrder && (
          <div className="order-confirmation">
            <span className="confirmation-label">SUCCESS</span>

            <div>
              <span className="section-eyebrow">ORDER CONFIRMED</span>
              <h3>Your order has been placed!</h3>
              <p>Keep this number to track your order.</p>

              <strong className="confirmation-number">
                {createdOrder.orderNumber}
              </strong>

              <p>Total: {formatMoney(createdOrder.total)}</p>
              <p>Status: {createdOrder.status}</p>
            </div>
          </div>
        )}

        {cart.length === 0 && !createdOrder && (
          <div className="empty-cart-panel compact">
            <h3>No items ready for checkout.</h3>
            <p>Add products to your cart first.</p>
            <a href="#shop" className="hero-button">Browse Products</a>
          </div>
        )}

        {cart.length > 0 && (
          <div className="checkout-container">
            <form onSubmit={handleCheckout} className="checkout-form">
              <h3>Customer Information</h3>

              <label htmlFor="customer-name">Full Name</label>

              <input
                id="customer-name"
                type="text"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />

              <label htmlFor="customer-phone">Phone Number</label>

              <input
                id="customer-phone"
                type="tel"
                placeholder="e.g. +266 5XXX XXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />

              <label htmlFor="customer-email">
                Email Address (Optional)
              </label>

              <input
                id="customer-email"
                type="email"
                placeholder="Enter your email address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />

              {checkoutError && (
                <p className="checkout-error">{checkoutError}</p>
              )}

              <button
                type="submit"
                className="place-order-button"
                disabled={submitting}
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </form>

            <aside className="order-summary">
              <h3>Your Order</h3>

              {cart.map((item) => (
                <div className="summary-item" key={item.id}>
                  <span>{item.name} × {item.quantity}</span>

                  <strong>
                    {formatMoney(item.price * item.quantity)}
                  </strong>
                </div>
              ))}

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatMoney(total)}</strong>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* ORDER TRACKING */}
      <section className="tracking-section" id="tracking">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">ORDER UPDATES</span>
            <h2>Track Your Order</h2>
            <p>Enter your order number to view its current status.</p>
          </div>
        </div>

        <form className="tracking-form" onSubmit={handleTrackOrder}>
          <input
            type="text"
            placeholder="Enter your order number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />

          <button type="submit" disabled={trackingLoading}>
            {trackingLoading ? "Checking..." : "Track Order"}
          </button>
        </form>

        {trackingError && (
          <p className="checkout-error">{trackingError}</p>
        )}

        {trackedOrder && (
          <div className="tracking-result">
            <div className="tracking-result-heading">
              <div>
                <span className="section-eyebrow">ORDER DETAILS</span>
                <h3>{trackedOrder.orderNumber}</h3>
              </div>

              <span className="order-status-label">
                {trackedOrder.status}
              </span>
            </div>

            <div className="tracking-progress">
              {ORDER_STATUSES.map((status, index) => {
                const currentIndex = ORDER_STATUSES.indexOf(
                  trackedOrder.status
                );

                return (
                  <div
                    className={`tracking-step ${
                      index <= currentIndex ? "completed" : ""
                    }`}
                    key={status}
                  >
                    <span>{index + 1}</span>
                    <small>{status}</small>
                  </div>
                );
              })}
            </div>

            <h4>Ordered Items</h4>

            {trackedOrder.items.map((item) => (
              <div className="summary-item" key={item.id}>
                <span>{item.name} × {item.quantity}</span>
                <strong>{formatMoney(item.subtotal)}</strong>
              </div>
            ))}

            <div className="summary-total">
              <span>Order Total</span>
              <strong>{formatMoney(trackedOrder.total)}</strong>
            </div>

            <p className="tracking-date">
              Order Date: {formatDate(trackedOrder.createdAt)}
            </p>
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="about-content">
          <span className="section-eyebrow">THE KOFI & CO EXPERIENCE</span>
          <h2>More Than Just a Cup of Coffee.</h2>

          <p>
            At Kofi & CO, we believe that good coffee is part of
            life's best moments. Discover carefully prepared drinks,
            delicious treats and a welcoming coffee experience.
          </p>

          <a href="#shop" className="hero-button">Explore Our Menu</a>
        </div>
      </section>

      {/* STAFF AREA */}
      <section className="staff-section" id="staff">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">STAFF PORTAL</span>
            <h2>Management Dashboard</h2>
            <p>Manage products, customer orders and daily sales.</p>
          </div>
        </div>

        {!staffToken ? (
          <form className="staff-login" onSubmit={handleStaffLogin}>
            <h3>Staff Login</h3>

            <label htmlFor="staff-username">Username</label>

            <input
              id="staff-username"
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="Enter staff username"
              required
            />

            <label htmlFor="staff-password">Password</label>

            <input
              id="staff-password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter staff password"
              required
            />

            {loginError && (
              <p className="checkout-error">{loginError}</p>
            )}

            <button type="submit" disabled={staffLoading}>
              {staffLoading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>
        ) : (
          <div className="staff-dashboard">
            <div className="staff-heading">
              <div>
                <span className="section-eyebrow">STAFF ACCOUNT</span>
                <h3>Welcome, {staffUsername}</h3>
                <p>You are logged in as staff.</p>
              </div>

              <button
                className="logout-button"
                onClick={staffLogout}
              >
                Logout
              </button>
            </div>

            {/* DAILY SALES REPORT */}
            <div className="staff-report">
              <div className="staff-section-heading">
                <div>
                  <h3>Daily Sales Report</h3>
                  <p>Review sales and order activity for a selected date.</p>
                </div>

                <button
                  type="button"
                  onClick={() => loadDailyReport()}
                  disabled={reportLoading}
                >
                  {reportLoading ? "Loading..." : "Refresh Report"}
                </button>
              </div>

              <div className="report-date-control">
                <label htmlFor="report-date">Report Date</label>

                <input
                  id="report-date"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </div>

              {reportLoading && <p>Loading sales report...</p>}

              {reportError && (
                <p className="checkout-error">{reportError}</p>
              )}

              {dailyReport && !reportLoading && (
                <>
                  <div className="report-summary-grid">
                    <div className="report-card">
                      <span>Total Orders</span>
                      <strong>{dailyReport.totalOrders}</strong>
                    </div>

                    <div className="report-card">
                      <span>Total Revenue</span>
                      <strong>
                        {formatMoney(dailyReport.totalRevenue)}
                      </strong>
                    </div>

                    <div className="report-card">
                      <span>Collected Revenue</span>
                      <strong>
                        {formatMoney(dailyReport.collectedRevenue)}
                      </strong>
                    </div>

                    <div className="report-card">
                      <span>Items Sold</span>
                      <strong>{dailyReport.totalItemsSold}</strong>
                    </div>
                  </div>

                  <div className="report-status">
                    <h4>Orders by Status</h4>

                    <div className="status-count-grid">
                      {ORDER_STATUSES.map((status) => (
                        <div className="status-count" key={status}>
                          <span>{status}</span>

                          <strong>
                            {dailyReport.statusCounts?.[status] ?? 0}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="popular-products">
                    <h4>Popular Products</h4>

                    {dailyReport.popularProducts?.length > 0 ? (
                      dailyReport.popularProducts.map((product, index) => (
                        <div
                          className="popular-product"
                          key={product.id || product.name || index}
                        >
                          <div>
                            <strong>{product.name}</strong>
                            <p>{product.quantitySold} item(s) sold</p>
                          </div>

                          <strong>
                            {formatMoney(product.revenue)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p>No products were sold on this date.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* CUSTOMER ORDER MANAGEMENT */}
            <div className="staff-orders">
              <div className="staff-section-heading">
                <div>
                  <h3>Customer Orders</h3>
                  <p>View orders and update their preparation status.</p>
                </div>

                <button
                  type="button"
                  onClick={() => loadStaffOrders()}
                  disabled={ordersLoading}
                >
                  {ordersLoading ? "Loading..." : "Refresh Orders"}
                </button>
              </div>

              {ordersError && (
                <p className="checkout-error">{ordersError}</p>
              )}

              {ordersLoading ? (
                <p>Loading customer orders...</p>
              ) : orders.length === 0 ? (
                <p className="empty-cart">No customer orders found.</p>
              ) : (
                <div className="staff-order-list">
                  {orders.map((order) => (
                    <div className="staff-order-card" key={order.id}>
                      <div className="staff-order-top">
                        <div>
                          <span className="category">ORDER NUMBER</span>
                          <h4>{order.orderNumber}</h4>
                          <p>{formatDate(order.createdAt)}</p>
                        </div>

                        <span className="order-status-label">
                          {order.status}
                        </span>
                      </div>

                      <div className="staff-customer-details">
                        <h4>Customer Details</h4>

                        <p>
                          <strong>Name:</strong>{" "}
                          {order.customer?.name || "Not provided"}
                        </p>

                        <p>
                          <strong>Phone:</strong>{" "}
                          {order.customer?.phone || "Not provided"}
                        </p>

                        <p>
                          <strong>Email:</strong>{" "}
                          {order.customer?.email || "Not provided"}
                        </p>
                      </div>

                      <div className="staff-order-items">
                        <h4>Ordered Items</h4>

                        {order.items?.map((item, index) => (
                          <div
                            className="summary-item"
                            key={`${order.id}-${item.id || index}`}
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>

                            <strong>{formatMoney(item.subtotal)}</strong>
                          </div>
                        ))}
                      </div>

                      <div className="staff-order-total">
                        <span>Order Total</span>
                        <strong>{formatMoney(order.total)}</strong>
                      </div>

                      <div className="order-status-control">
                        <label htmlFor={`status-${order.id}`}>
                          Update Status
                        </label>

                        <select
                          id={`status-${order.id}`}
                          value={statusDrafts[order.id] ?? order.status}
                          onChange={(e) =>
                            handleStatusDraft(order.id, e.target.value)
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order)}
                          disabled={
                            updatingOrderId === order.id ||
                            (statusDrafts[order.id] ?? order.status) ===
                              order.status
                          }
                        >
                          {updatingOrderId === order.id
                            ? "Updating..."
                            : "Save Status"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MENU MANAGEMENT */}
            <form
              id="staff-form"
              className="staff-form"
              onSubmit={handleSaveProduct}
            >
              <h3>
                {editingId ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>

              <label htmlFor="product-category">Category</label>

              <select
                id="product-category"
                value={productCategory}
                onChange={(e) => {
                  setProductCategory(e.target.value);
                  setProductPreset("");
                }}
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {MENU_PRESETS[productCategory] && (
                <>
                  <label htmlFor="product-preset">Menu Item</label>

                  <select
                    id="product-preset"
                    value={productPreset}
                    onChange={handlePresetChange}
                  >
                    <option value="">Other (type my own name)</option>

                    {MENU_PRESETS[productCategory].map((group) =>
                      group.group ? (
                        <optgroup key={group.group} label={group.group}>
                          {group.items.map(([name]) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                      ) : (
                        group.items.map(([name]) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))
                      )
                    )}
                  </select>
                </>
              )}

              <label htmlFor="product-name">Product Name</label>

              <input
                id="product-name"
                type="text"
                value={productName}
                onChange={handleNameChange}
                placeholder="e.g. Americano"
                required
              />

              <label htmlFor="product-description">Description</label>

              <textarea
                id="product-description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Describe the product"
                required
              />

              <label htmlFor="product-price">Price (M)</label>

              <input
                id="product-price"
                type="number"
                min="0.01"
                step="0.01"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="Enter price"
                required
              />

              {/* PRODUCT IMAGE URL */}
              <label htmlFor="product-image-url">
                Product Image URL (Optional)
              </label>

              <input
                id="product-image-url"
                type="url"
                value={productImageUrl}
                onChange={(e) => setProductImageUrl(e.target.value)}
                placeholder="https://example.com/product-image.jpg"
              />

              <small className="image-url-help">
                Paste a direct image URL. Leave this field empty and an
                image will be chosen automatically from the product name
                and category (e.g. Water, Cake, Burger).
              </small>

              {/* IMAGE PREVIEW */}
              <div className="product-image-preview">
                <h4>Product Image Preview</h4>

                <img
                  key={getProductImage(productPreview)}
                  src={getProductImage(productPreview)}
                  alt={`${productName || "Product"} preview`}
                  onError={(event) =>
                    handleImageError(event, productPreview)
                  }
                />

                <span>
                  {productImageUrl.trim()
                    ? "Custom image preview"
                    : "Automatic image based on name and category"}
                </span>
              </div>

              <label className="availability-label">
                <input
                  type="checkbox"
                  checked={productAvailable}
                  onChange={(e) =>
                    setProductAvailable(e.target.checked)
                  }
                />

                Product is available
              </label>

              <div className="staff-form-actions">
                <button type="submit" disabled={staffLoading}>
                  {staffLoading
                    ? "Saving..."
                    : editingId
                      ? "Update Product"
                      : "Add Product"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={resetProductForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="staff-products">
              <h3>Current Menu Items</h3>

              {menu.map((item) => (
                <div className="staff-product" key={item.id}>
                  <img
                    className="staff-product-image"
                    src={getProductImage(item)}
                    alt={item.name}
                    loading="lazy"
                    onError={(event) =>
                      handleImageError(event, item)
                    }
                  />

                  <div>
                    <h4>{item.name}</h4>

                    <p>
                      {item.category} · {formatMoney(item.price)}
                    </p>

                    <span
                      className={
                        item.available ? "available" : "unavailable"
                      }
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="staff-product-actions">
                    <button
                      type="button"
                      onClick={() => editProduct(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteProduct(item.id)}
                      disabled={staffLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {staffMessage && (
          <p className="staff-message">{staffMessage}</p>
        )}
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="#home" className="brand">
              <span className="brand-mark">K</span>

              <span className="brand-name">
                KOFI <span>& CO</span>
                <small>COFFEE HOUSE</small>
              </span>
            </a>

            <p>
              Premium coffee. Timeless moments. Discover your
              next favourite at Kofi & CO.
            </p>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="#shop">Shop Menu</a>
            <a href="#categories">Categories</a>
            <a href="#featured">Featured Products</a>
          </div>

          <div className="footer-column">
            <h3>Customer Care</h3>
            <a href="#cart">Shopping Cart</a>
            <a href="#checkout">Checkout</a>
            <a href="#tracking">Track Your Order</a>
            <a href="#about">About Kofi & CO</a>
          </div>

          <div className="footer-column">
            <h3>Management</h3>
            <a href="#staff">Staff Login</a>
            <a href="#staff">Menu Management</a>
            <a href="#staff">Order Management</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Kofi & CO. All rights reserved.</p>
          <p>Premium coffee. Timeless moments.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
