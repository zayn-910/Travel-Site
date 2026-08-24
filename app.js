'use strict';

/* ============================================================================
   Joy Makers Holidays — Travel Site
   ----------------------------------------------------------------------------
   Vanilla HTML/CSS/JS conversion of the original React (TSX) application.

   The original app used Firebase Auth + Firestore with environment-injected
   globals (__firebase_config, __app_id, __initial_auth_token). In this static
   build those services are simulated with localStorage, so every feature
   works out of the box:

     - SPA navigation: home, destinations, package details, about, contact,
       testimonials, blog, admin
     - Search / trip-type filter / budget slider
     - Lead capture forms (validation + honeypot)
     - Admin dashboard: inquiries table with status toggle, package CRUD,
       security-info panel
     - Toasts, WhatsApp float, mobile menu, loading screen
   ========================================================================== */

/* ------------------------- Inline icons (Lucide) ------------------------- */
const ICONS = {
  mapPin:        '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  calendar:      '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  users:         '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  dollar:        '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  check:         '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xCircle:       '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  menu:          '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  x:             '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  chevronRight:  '<path d="m9 18 6-6-6-6"/>',
  star:          '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  search:        '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  filter:        '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  phone:         '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail:          '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  globe:         '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  shield:        '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  lock:          '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  trash:         '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  edit:          '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  plus:          '<path d="M5 12h14"/><path d="M12 5v14"/>',
  info:          '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  image:         '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'
};

/** Render an inline SVG icon (lucide-compatible). */
function icon(name, size, cls) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 24) + '" height="' + (size || 24) +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + (cls || '') + '" aria-hidden="true">' +
    (ICONS[name] || '') + '</svg>';
}

/* Fallback images so the layout never breaks if a remote image fails. */
window.LOGO_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='12' fill='%232563eb'/><text x='32' y='43' font-size='30' font-weight='bold' text-anchor='middle' fill='white' font-family='Arial'>JM</text></svg>";
window.IMG_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23e5e7eb'/><stop offset='100%25' stop-color='%23d1d5db'/></linearGradient></defs><rect width='800' height='600' fill='url(%23g)'/><text x='400' y='310' font-family='Arial' font-size='30' fill='%236b7280' text-anchor='middle'>Image unavailable</text></svg>";

/** Image tag with an automatic fallback when the source cannot load. */
function imgTag(src, alt, cls, extra) {
  return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" class="' + (cls || '') + '" onerror="this.onerror=null;this.src=window.IMG_FALLBACK;" ' + (extra || '') + '>';
}

/* ------------------------------ Seed data -------------------------------- */
const SEED_PACKAGES = [
  {
    id: 'pkg-1',
    title: 'Kerala Backwaters & Hills',
    location: 'Kerala, India',
    price: 35000,
    duration: '6 Days / 5 Nights',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=800'
    ],
    type: 'Nature',
    description: 'Experience the serene backwaters of Alleppey and the lush green tea gardens of Munnar. A perfect blend of relaxation and nature.',
    itinerary: [
      'Day 1: Arrival in Kochi & Transfer to Munnar',
      'Day 2: Munnar Sightseeing (Tea Gardens, Mattupetty Dam)',
      'Day 3: Transfer to Thekkady & Spice Plantation Tour',
      'Day 4: Transfer to Alleppey & Houseboat Stay',
      'Day 5: Transfer to Kovalam Beach',
      'Day 6: Departure from Trivandrum'
    ],
    inclusions: ['Premium Houseboat Stay', 'Daily Breakfast & Dinner', 'Airport Transfers', 'Private AC Cab'],
    exclusions: ['Flight Tickets', 'Entry Fees to Monuments', 'Personal Expenses']
  },
  {
    id: 'pkg-2',
    title: 'Royal Rajasthan Heritage',
    location: 'Rajasthan, India',
    price: 45000,
    duration: '8 Days / 7 Nights',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800'],
    type: 'Heritage',
    description: 'Immerse yourself in the rich history of the Rajputs. Visit majestic forts, opulent palaces, and vibrant markets across Jaipur, Jodhpur, and Udaipur.',
    itinerary: ['Day 1-2: Jaipur (Amer Fort, City Palace)', 'Day 3-4: Jodhpur (Mehrangarh Fort)', 'Day 5-6: Udaipur (Lake Pichola, City Palace)', 'Day 7: Pushkar Day Trip', 'Day 8: Departure from Jaipur'],
    inclusions: ['Heritage Hotel Stays', 'English Speaking Guide', 'Camel Ride in Pushkar', 'All Transfers'],
    exclusions: ['Lunches', 'Camera Fees at Monuments']
  },
  {
    id: 'pkg-3',
    title: 'Magical Manali & Rohtang',
    location: 'Himachal Pradesh, India',
    price: 28500,
    duration: '5 Days / 4 Nights',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3e99c0b11?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3e99c0b11?auto=format&fit=crop&q=80&w=800'],
    type: 'Mountain',
    description: 'Escape to the snow-capped peaks of the Himalayas. Enjoy thrilling adventure sports and breathtaking views in Manali.',
    itinerary: ['Day 1: Arrival in Chandigarh & Transfer to Manali', 'Day 2: Manali Local Sightseeing', 'Day 3: Rohtang Pass / Solang Valley Excursion', 'Day 4: Kullu & Manikaran', 'Day 5: Departure to Chandigarh'],
    inclusions: ['3-Star Accommodation', 'Breakfast & Dinner', 'Sedan Cab for Sightseeing'],
    exclusions: ['Rohtang Pass Permit', 'Adventure Activities']
  }
];

/* ----------------- Data layer (Firestore simulated in localStorage) ------ */
const STORAGE_KEYS = { packages: 'jmh_packages', leads: 'jmh_leads' };

const DB = {
  getPackages() {
    let pkgs = null;
    try { pkgs = JSON.parse(localStorage.getItem(STORAGE_KEYS.packages) || 'null'); } catch (e) { pkgs = null; }
    // Seed database if empty (mirrors the onSnapshot seed behaviour).
    if (!pkgs || pkgs.length === 0) {
      pkgs = SEED_PACKAGES.map(p => ({ ...p }));
      this.savePackages(pkgs);
      console.log('Database seeded with default packages.');
    }
    return pkgs;
  },
  savePackages(pkgs) {
    localStorage.setItem(STORAGE_KEYS.packages, JSON.stringify(pkgs));
  },
  addPackage(pkg) {
    const pkgs = this.getPackages();
    pkgs.push(pkg);
    this.savePackages(pkgs);
  },
  updatePackage(id, data) {
    const pkgs = this.getPackages();
    const idx = pkgs.findIndex(p => p.id === id);
    if (idx > -1) { pkgs[idx] = { ...pkgs[idx], ...data }; this.savePackages(pkgs); }
  },
  deletePackage(id) {
    this.savePackages(this.getPackages().filter(p => p.id !== id));
  },
  getLeads() {
    let leads = null;
    try { leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.leads) || '[]'); } catch (e) { leads = []; }
    return (leads || []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },
  saveLeads(leads) {
    localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads));
  },
  addLead(lead) {
    const leads = this.getLeads();
    leads.push(lead);
    this.saveLeads(leads);
  },
  updateLead(id, patch) {
    const leads = this.getLeads();
    const idx = leads.findIndex(l => l.id === id);
    if (idx > -1) { leads[idx] = { ...leads[idx], ...patch }; this.saveLeads(leads); }
  }
};

/* -------------------------------- State ---------------------------------- */
const state = {
  currentPage: 'home',          // home, destinations, packageDetails, about, contact, blog, testimonials, admin
  selectedPackageId: null,
  isMobileMenuOpen: false,
  isAdmin: false,               // simplified admin toggle for demo
  packages: [],
  leads: [],
  searchTerm: '',
  filterType: 'All',
  maxPrice: 100000,
  toast: null,
  toastTimer: null,
  pkgDetails: { activeImage: null, activeTab: 'itinerary' }, // itinerary | inclusions
  admin: { tab: 'leads', editingPackage: null }              // leads | packages | settings
};

/* ------------------------------- Helpers --------------------------------- */
function esc(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatINR(price) {
  return '₹' + Number(price || 0).toLocaleString('en-IN');
}

function showToast(message, type) {
  type = type || 'success';
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    state.toast = null;
    const c = document.getElementById('toast-container');
    if (c) c.innerHTML = '';
  }, 3000);
  const c = document.getElementById('toast-container');
  if (c) c.innerHTML = '<div class="toast ' + (type === 'error' ? 'toast-error' : 'toast-success') + '">' + esc(message) + '</div>';
}

function navigate(page, packageId) {
  state.currentPage = page;
  if (packageId) state.selectedPackageId = packageId;
  state.isMobileMenuOpen = false;
  if (page === 'packageDetails' && packageId) {
    const pkg = state.packages.find(p => p.id === packageId);
    state.pkgDetails.activeImage = (pkg && pkg.images && pkg.images[0]) || (pkg && pkg.image) || null;
    state.pkgDetails.activeTab = 'itinerary';
  }
  window.scrollTo(0, 0);
  render();
}

/* ------------------------------ Navigation ------------------------------- */
function renderNavBar() {
  const pages = ['home', 'destinations', 'about', 'testimonials', 'blog', 'contact'];
  const links = pages.map(p =>
    '<button class="nav-link' + (state.currentPage === p ? ' active' : '') + '" data-nav="' + p + '">' + p + '</button>'
  ).join('');

  const mobileLinks = pages.map(p =>
    '<button class="mobile-link' + (state.currentPage === p ? ' active' : '') + '" data-nav="' + p + '">' + p + '</button>'
  ).join('');

  return '' +
    '<nav class="navbar">' +
      '<div class="container nav-inner">' +
        '<div class="brand" data-nav="home">' +
          '<img src="1.jpg.jpeg" alt="Joy Makers Holidays Logo" class="brand-logo" onerror="this.onerror=null;this.src=window.LOGO_FALLBACK;">' +
          '<div class="brand-text">' +
            '<span class="brand-name">Joy Makers</span>' +
            '<span class="brand-sub">Holidays</span>' +
          '</div>' +
        '</div>' +
        '<div class="nav-links">' +
          links +
          '<button class="admin-toggle" data-action="toggle-admin">[Admin]</button>' +
          (state.isAdmin ? '<button class="btn btn-blue btn-sm" data-nav="admin">Dashboard</button>' : '') +
        '</div>' +
        '<div class="mobile-menu-btn-wrap">' +
          '<button class="menu-btn" data-action="toggle-menu" aria-label="Toggle navigation menu">' +
            (state.isMobileMenuOpen ? icon('x', 24) : icon('menu', 24)) +
          '</button>' +
        '</div>' +
      '</div>' +
      (state.isMobileMenuOpen
        ? '<div class="mobile-menu">' + mobileLinks +
          '<button class="mobile-link admin-toggle-mobile" data-action="toggle-admin">[Admin]</button>' +
          (state.isAdmin ? '<button class="mobile-link admin" data-nav="admin">Admin Dashboard</button>' : '') +
          '</div>'
        : '') +
    '</nav>';
}

/* ------------------------------ Package card ----------------------------- */
function packageCardHTML(pkg) {
  return '' +
    '<div class="card pkg-card">' +
      '<div class="pkg-img-wrap">' +
        imgTag(pkg.image, pkg.title, 'pkg-img') +
        '<span class="pkg-badge">' + esc(pkg.type || 'Standard') + '</span>' +
      '</div>' +
      '<div class="pkg-body">' +
        '<div class="pkg-loc">' + icon('mapPin', 16) + ' ' + esc(pkg.location) + '</div>' +
        '<h3 class="pkg-title">' + esc(pkg.title) + '</h3>' +
        '<p class="pkg-desc line-clamp-2">' + esc(pkg.description) + '</p>' +
        '<div class="pkg-foot">' +
          '<div class="pkg-duration">' + icon('calendar', 20) + '<span>' + esc(pkg.duration) + '</span></div>' +
          '<div class="text-right"><span class="pkg-from">Starting from</span><span class="pkg-price">' + formatINR(pkg.price) + '</span></div>' +
        '</div>' +
        '<button class="btn btn-dark btn-block" data-nav="packageDetails" data-pkg="' + esc(pkg.id) + '">View Details</button>' +
      '</div>' +
    '</div>';
}

/* --------------------------------- Home ---------------------------------- */
function renderHome() {
  return '' +
    '<div class="animate-fade-in">' +
      /* Hero Section */
      '<div class="hero">' +
        '<div class="hero-bg">' +
          imgTag('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000', 'Travel Hero', '') +
        '</div>' +
        '<div class="hero-content">' +
          '<h1 class="hero-title">Discover Your Next Great Adventure</h1>' +
          '<p class="hero-sub">Expertly crafted travel packages to the world\'s most stunning destinations. Book your dream vacation today.</p>' +
          '<button class="btn btn-blue btn-pill" data-nav="destinations">Explore Packages ' + icon('chevronRight', 20) + '</button>' +
        '</div>' +
      '</div>' +

      /* USP Section */
      '<div class="section section-white">' +
        '<div class="container">' +
          '<div class="section-head">' +
            '<h2>Why Choose Joy Makers Holidays?</h2>' +
            '<p>We provide premium travel experiences with exceptional service from start to finish.</p>' +
          '</div>' +
          '<div class="grid grid-3">' +
            '<div class="feature-card">' + icon('shield', 40, 'feature-icon') +
              '<h3>Secure &amp; Safe</h3>' +
              '<p>Your safety is our priority. We vet all our partners and provide secure booking systems.</p>' +
            '</div>' +
            '<div class="feature-card">' + icon('star', 40, 'feature-icon') +
              '<h3>Expert Guides</h3>' +
              '<p>Travel with knowledgeable locals who bring every destination to life.</p>' +
            '</div>' +
            '<div class="feature-card">' + icon('phone', 40, 'feature-icon') +
              '<h3>24/7 Support</h3>' +
              '<p>Our dedicated team is available around the clock to assist you anywhere in the world.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Featured Packages */
      '<div class="section section-gray">' +
        '<div class="container">' +
          '<div class="section-head-row">' +
            '<div>' +
              '<h2>Featured Destinations</h2>' +
              '<p>Hand-picked packages for your next getaway.</p>' +
            '</div>' +
            '<button class="btn btn-ghost view-all" data-nav="destinations">View All ' + icon('chevronRight', 20) + '</button>' +
          '</div>' +
          '<div class="grid grid-3">' +
            state.packages.slice(0, 3).map(pkg => packageCardHTML(pkg)).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ------------------------------ Destinations ----------------------------- */
function filteredPackages() {
  return state.packages.filter(pkg => {
    const matchesSearch = (pkg.title || '').toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                          (pkg.location || '').toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesType = state.filterType === 'All' || pkg.type === state.filterType;
    const matchesPrice = pkg.price <= state.maxPrice;
    return matchesSearch && matchesType && matchesPrice;
  });
}

function renderResultsGrid() {
  const filtered = filteredPackages();
  if (filtered.length === 0) {
    return '<div class="empty-state">' +
      icon('search', 48) +
      '<h3 class="empty-title">No packages found</h3>' +
      '<p class="empty-sub">Try adjusting your filters or search terms.</p>' +
      '<button class="empty-clear" data-action="clear-filters">Clear Filters</button>' +
    '</div>';
  }
  return '<div class="grid grid-3">' + filtered.map(pkg => packageCardHTML(pkg)).join('') + '</div>';
}

function renderDestinations() {
  const uniqueTypes = ['All', ...new Set(state.packages.map(p => p.type).filter(Boolean))];
  const typeOptions = uniqueTypes.map(t =>
    '<option value="' + esc(t) + '"' + (t === state.filterType ? ' selected' : '') + '>' + esc(t) + '</option>'
  ).join('');

  return '' +
    '<div class="container py-12">' +
      '<div class="text-center mb-12">' +
        '<h1 class="page-title">Explore Destinations</h1>' +
        '<p class="page-sub">Find the perfect package tailored to your budget and style.</p>' +
      '</div>' +

      /* Filters */
      '<div class="filters-bar">' +
        '<div class="filter-field">' +
          '<label for="search-input">Search Location or Tour</label>' +
          '<div class="search-wrap">' +
            icon('search', 20) +
            '<input type="text" id="search-input" class="field-input" placeholder="e.g. Bali, Swiss..." value="' + esc(state.searchTerm) + '" />' +
          '</div>' +
        '</div>' +
        '<div class="filter-field">' +
          '<label for="type-select">Trip Type</label>' +
          '<select id="type-select" class="field">' + typeOptions + '</select>' +
        '</div>' +
        '<div class="filter-field">' +
          '<label class="flex justify-between" for="price-range"><span>Max Budget: <span id="price-label" class="font-semibold">' + formatINR(state.maxPrice) + '</span></span></label>' +
          '<input type="range" id="price-range" min="10000" max="200000" step="5000" value="' + state.maxPrice + '" />' +
        '</div>' +
      '</div>' +

      /* Grid */
      '<div id="destinations-results">' + renderResultsGrid() + '</div>' +
    '</div>';
}

function resetFilters() {
  state.searchTerm = '';
  state.filterType = 'All';
  state.maxPrice = 100000; // initial value (the original code mistakenly used 5000 here)
  const searchInput = document.getElementById('search-input');
  const typeSelect = document.getElementById('type-select');
  const priceRange = document.getElementById('price-range');
  const priceLabel = document.getElementById('price-label');
  if (searchInput) searchInput.value = '';
  if (typeSelect) typeSelect.value = 'All';
  if (priceRange) priceRange.value = '100000';
  if (priceLabel) priceLabel.textContent = formatINR(state.maxPrice);
  updateResults();
}

function updateResults() {
  const container = document.getElementById('destinations-results');
  if (!container) return;
  container.innerHTML = renderResultsGrid();
}

/* ---------------------------- Package details ---------------------------- */
function renderPackageDetails() {
  const pkg = state.packages.find(p => p.id === state.selectedPackageId);
  if (!pkg) return '<div class="container py-20 text-center">Package not found.</div>';

  const activeImage = state.pkgDetails.activeImage || pkg.image;
  const activeTab = state.pkgDetails.activeTab;

  const thumbnails = (pkg.images && pkg.images.length > 1)
    ? '<div class="gallery-thumbs">' +
      pkg.images.map(img =>
        '<button class="thumb' + (activeImage === img ? ' active' : '') + '" data-thumb="' + esc(img) + '" aria-label="Gallery image">' +
          imgTag(img, 'Gallery', '') +
        '</button>'
      ).join('') +
      '</div>'
    : '';

  const itineraryHTML = (pkg.itinerary || []).map((day, idx) => {
    const parts = day.split(':');
    return '' +
      '<div class="timeline-item">' +
        '<div class="timeline-rail">' +
          '<div class="timeline-dot">' + (idx + 1) + '</div>' +
          (idx !== pkg.itinerary.length - 1 ? '<div class="timeline-line"></div>' : '') +
        '</div>' +
        '<div class="timeline-body">' +
          '<h4>' + esc(parts[0]) + '</h4>' +
          '<p>' + esc(parts[1] || 'Details provided upon booking.') + '</p>' +
        '</div>' +
      '</div>';
  }).join('');

  const inclusionsHTML = (pkg.inclusions || []).map(inc =>
    '<li>' + icon('check', 20, 'text-green-500') + '<span>' + esc(inc) + '</span></li>'
  ).join('');

  const exclusionsHTML = (pkg.exclusions || []).map(exc =>
    '<li>' + icon('xCircle', 20, 'text-red-500') + '<span>' + esc(exc) + '</span></li>'
  ).join('');

  return '' +
    '<div class="container py-12">' +
      /* Breadcrumb */
      '<button class="back-link" data-nav="destinations">&larr; Back to Destinations</button>' +

      '<div class="details-grid">' +
        /* Main content */
        '<div class="space-y-8">' +

          '<div class="panel">' +
            '<div class="gallery-main">' + imgTag(activeImage, pkg.title, '') + '</div>' +
            thumbnails +
          '</div>' +

          '<div class="panel info-panel">' +
            '<div class="info-head">' +
              '<div>' +
                '<h1 class="info-title">' + esc(pkg.title) + '</h1>' +
                '<div class="info-meta">' +
                  '<span>' + icon('mapPin', 16) + ' ' + esc(pkg.location) + '</span>' +
                  '<span>' + icon('calendar', 16) + ' ' + esc(pkg.duration) + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="price-box">' +
                '<span class="small">Price per person</span>' +
                '<span class="big">' + formatINR(pkg.price) + '</span>' +
              '</div>' +
            '</div>' +
            '<p class="info-desc">' + esc(pkg.description) + '</p>' +
          '</div>' +

          '<div class="panel">' +
            '<div class="tabs-head">' +
              '<button class="tab-btn' + (activeTab === 'itinerary' ? ' active' : '') + '" data-details-tab="itinerary">Itinerary</button>' +
              '<button class="tab-btn' + (activeTab === 'inclusions' ? ' active' : '') + '" data-details-tab="inclusions">Inclusions &amp; Exclusions</button>' +
            '</div>' +
            '<div class="tab-body">' +
              (activeTab === 'itinerary'
                ? '<div class="timeline">' + itineraryHTML + '</div>'
                : '<div class="inc-grid">' +
                    '<div class="inc-list">' +
                      '<h4>' + icon('check', 24, 'text-green-500') + ' Included</h4>' +
                      '<ul>' + inclusionsHTML + '</ul>' +
                    '</div>' +
                    '<div class="inc-list">' +
                      '<h4>' + icon('xCircle', 24, 'text-red-500') + ' Excluded</h4>' +
                      '<ul>' + exclusionsHTML + '</ul>' +
                    '</div>' +
                  '</div>') +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Sticky lead form */
        '<div>' +
          '<div class="panel booking-form sticky">' +
            '<h3 class="form-title">Book This Tour</h3>' +
            '<p class="form-sub">Send us an inquiry and our travel experts will get back to you within 24 hours.</p>' +
            '<form data-lead-form="' + esc(pkg.id) + '" class="space-y-4">' +
              '<div class="form-field">' +
                '<label for="bk-name">Full Name *</label>' +
                '<input type="text" id="bk-name" name="name" class="field-input" placeholder="John Doe" required />' +
              '</div>' +
              '<div class="form-field">' +
                '<label for="bk-email">Email Address *</label>' +
                '<input type="email" id="bk-email" name="email" class="field-input" placeholder="john@example.com" required />' +
              '</div>' +
              '<div class="form-field">' +
                '<label for="bk-phone">Phone Number *</label>' +
                '<input type="tel" id="bk-phone" name="phone" class="field-input" placeholder="+1 234 567 8900" required />' +
              '</div>' +
              '<div class="form-row">' +
                '<div class="form-field">' +
                  '<label for="bk-dates">Travel Date</label>' +
                  '<input type="date" id="bk-dates" name="dates" class="field-input" />' +
                '</div>' +
                '<div class="form-field">' +
                  '<label for="bk-travelers">Travelers</label>' +
                  '<input type="number" id="bk-travelers" name="travelers" min="1" value="2" class="field-input" />' +
                '</div>' +
              '</div>' +
              '<div class="form-field">' +
                '<label for="bk-message">Message / Special Requests</label>' +
                '<textarea id="bk-message" name="message" rows="3" class="field-input" placeholder="Any dietary requirements or special occasions?"></textarea>' +
              '</div>' +

              /* Honeypot field (hidden from users) to deter simple bots */
              '<div class="hidden">' +
                "<label>Don't fill this out if you're human: <input type=\"text\" name=\"bot-field\" /></label>" +
              '</div>' +

              '<button type="submit" class="btn btn-blue btn-block font-bold text-lg">Send Inquiry ' + icon('chevronRight', 20) + '</button>' +
              '<p class="form-note">' + icon('lock', 12) + ' Your information is secure and encrypted. We respect your privacy.</p>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ----------------------------- Static pages ------------------------------ */
function staticHeroHTML(title, bgImage) {
  return '' +
    '<div class="static-hero">' +
      '<div class="hero-bg">' + imgTag(bgImage, title, '') + '</div>' +
      '<h1>' + esc(title) + '</h1>' +
    '</div>';
}

function renderAbout() {
  return '' +
    staticHeroHTML('About Joy Makers Holidays', 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=2000') +
    '<div class="about-wrap">' +
      '<h2>Our Story</h2>' +
      '<p>Founded in 2010, Joy Makers Holidays was born out of a simple passion for exploring the unknown and sharing the world\'s most beautiful destinations with others. We believe that travel is not just about visiting places, but about the experiences that change you.</p>' +
      '<p>Our team of expert travel curators spends months researching and vetting every hotel, guide, and experience to ensure your trip is nothing short of spectacular. Whether you\'re looking for a relaxing beach retreat or an adrenaline-pumping mountain trek, we have the perfect itinerary for you.</p>' +
      '<div class="about-grid">' +
        imgTag('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800', 'Our Team', '') +
        '<div class="flex flex-col justify-center">' +
          '<h3>Our Mission</h3>' +
          '<p>To create unforgettable, hassle-free travel experiences that connect people with the world\'s diverse cultures, landscapes, and histories.</p>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function renderContact() {
  return '' +
    staticHeroHTML('Contact Us', 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2000') +
    '<div class="container py-20">' +
      '<div class="contact-grid">' +
        '<div>' +
          '<h2 class="text-3xl font-bold mb-6">Get in Touch</h2>' +
          '<p class="text-gray-600 mb-8">Have a question about a package? Want a custom itinerary? Reach out to our team!</p>' +
          '<div>' +
            '<div class="contact-item">' +
              icon('mapPin', 24) +
              '<div><h4>Office Location</h4><p>123 Cyber Hub, DLF Phase 2<br/>Gurugram, Haryana 122002</p></div>' +
            '</div>' +
            '<div class="contact-item">' +
              icon('phone', 24) +
              '<div><h4>Phone</h4><p>+91 98765 43210</p></div>' +
            '</div>' +
            '<div class="contact-item">' +
              icon('mail', 24) +
              '<div><h4>Email</h4><p>contact@joymakersholidays.com</p></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="panel booking-form">' +
          '<form data-lead-form="" class="space-y-4">' +
            '<div class="form-field"><label for="ct-name">Name</label><input type="text" id="ct-name" name="name" class="field-input" required /></div>' +
            '<div class="form-field"><label for="ct-email">Email</label><input type="email" id="ct-email" name="email" class="field-input" required /></div>' +
            '<div class="form-field"><label for="ct-phone">Phone</label><input type="tel" id="ct-phone" name="phone" class="field-input" required /></div>' +
            '<div class="form-field"><label for="ct-message">Message</label><textarea id="ct-message" name="message" rows="4" class="field-input" required></textarea></div>' +
            '<button type="submit" class="btn btn-blue btn-block font-bold">Send Message</button>' +
          '</form>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function renderTestimonials() {
  const reviews = [
    { name: 'Priya Sharma', loc: 'Kerala Retreat', text: 'Absolutely incredible experience. Every detail was taken care of. The houseboat was amazing!', stars: 5 },
    { name: 'Rahul & Neha', loc: 'Rajasthan Heritage', text: 'Our honeymoon was perfect. The heritage hotels selected by Joy Makers Holidays were top-tier with breathtaking views.', stars: 5 },
    { name: 'Amit Patel', loc: 'Manali Tour', text: 'A truly authentic mountain experience. Loved the snow activities and the hotel view. Highly recommend.', stars: 5 },
    { name: 'Sneha Reddy', loc: 'General Booking', text: 'Customer service is phenomenal. They helped me customize my itinerary exactly how I wanted it.', stars: 4 },
    { name: 'The Gupta Family', loc: 'Goa (Custom)', text: 'Traveling with 3 kids is hard, but they made it seamless. The private transfers were a lifesaver.', stars: 5 },
    { name: 'Vikram S.', loc: 'Himachal Trip', text: 'Everything ran on time. Very professional company. Will book again.', stars: 5 }
  ];

  const cards = reviews.map(review =>
    '<div class="review-card">' +
      '<div class="review-stars">' +
        Array.from({ length: review.stars }, () => icon('star', 20, 'star-filled')).join('') +
      '</div>' +
      '<p class="review-text">"' + esc(review.text) + '"</p>' +
      '<div class="review-author">' +
        '<div class="avatar">' + esc(review.name.charAt(0)) + '</div>' +
        '<div><h4>' + esc(review.name) + '</h4><span>' + esc(review.loc) + '</span></div>' +
      '</div>' +
    '</div>'
  ).join('');

  return '' +
    '<div class="section-gray min-h-screen">' +
      staticHeroHTML('What Our Travelers Say', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000') +
      '<div class="container py-20">' +
        '<div class="grid grid-3">' + cards + '</div>' +
      '</div>' +
    '</div>';
}

function renderBlog() {
  const posts = [
    { title: 'Top 10 Hidden Gems in Europe for 2024', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=600', category: 'Guides' },
    { title: 'How to Pack Light for a 2-Week Trip', img: 'https://images.unsplash.com/photo-1553531384-411a4a8dd3ce?auto=format&fit=crop&q=80&w=600', category: 'Tips' },
    { title: 'The Best Street Food Markets in Southeast Asia', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600', category: 'Food' },
    { title: 'Sustainable Travel: Leaving a Lighter Footprint', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600', category: 'Eco' }
  ];

  const cards = posts.map(post =>
    '<div class="blog-card">' +
      '<div class="blog-img-wrap">' + imgTag(post.img, post.title, '') + '</div>' +
      '<div class="blog-body">' +
        '<span class="blog-cat">' + esc(post.category) + '</span>' +
        '<h3 class="blog-title">' + esc(post.title) + '</h3>' +
        '<p class="blog-more">Read more &rarr;</p>' +
      '</div>' +
    '</div>'
  ).join('');

  return '' +
    staticHeroHTML('Travel Inspiration', 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=2000') +
    '<div class="container py-20">' +
      '<div class="grid grid-3">' + cards + '</div>' +
    '</div>';
}

/* ------------------------------ Admin panel ------------------------------ */
function renderAdmin() {
  const tab = state.admin.tab;
  const editingPackage = state.admin.editingPackage;

  /* ---- Leads tab ---- */
  const leadsHTML = state.leads.length === 0
    ? '<tr><td colspan="5" class="text-center py-8 text-gray-500">No leads found.</td></tr>'
    : state.leads.map(lead =>
        '<tr class="' + (lead.status === 'New' ? 'row-new' : '') + '">' +
          '<td class="whitespace-nowrap text-gray-500">' + (lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A') + '</td>' +
          '<td class="whitespace-nowrap">' +
            '<div class="font-semibold">' + esc(lead.name) + '</div>' +
            '<div class="text-sm text-gray-500">' + esc(lead.email) + '</div>' +
            '<div class="text-sm text-gray-500">' + esc(lead.phone) + '</div>' +
          '</td>' +
          '<td>' +
            '<div class="text-blue-600 font-medium">' + esc(lead.packageName) + '</div>' +
            '<div class="text-sm text-gray-500">Dates: ' + esc(lead.dates || 'N/A') + ' | Pax: ' + esc(lead.travelers || 'N/A') + '</div>' +
            '<div class="text-sm text-gray-600 mt-1 line-clamp-2 italic">"' + esc(lead.message) + '"</div>' +
          '</td>' +
          '<td class="whitespace-nowrap">' +
            '<span class="status-badge ' + (lead.status === 'New' ? 'status-new' : 'status-contacted') + '">' + esc(lead.status || 'New') + '</span>' +
          '</td>' +
          '<td class="whitespace-nowrap">' +
            '<button class="link-btn" data-action="toggle-lead" data-id="' + esc(lead.id) + '" data-status="' + esc(lead.status) + '">Toggle Status</button>' +
          '</td>' +
        '</tr>'
      ).join('');

  /* ---- Packages tab ---- */
  let packagesTabHTML = '';
  if (editingPackage) {
    packagesTabHTML = '' +
      '<div class="edit-form">' +
        '<h3>' + (editingPackage.id ? 'Edit Package' : 'New Package') + '</h3>' +
        '<form data-package-form>' +
          '<div class="edit-form-grid">' +
            '<div class="full"><label>Title</label><input type="text" name="title" value="' + esc(editingPackage.title || '') + '" required /></div>' +
            '<div><label>Location</label><input type="text" name="location" value="' + esc(editingPackage.location || '') + '" required /></div>' +
            '<div><label>Type (e.g. Beach, Mountain)</label><input type="text" name="type" value="' + esc(editingPackage.type || '') + '" required /></div>' +
            '<div><label>Price (&#8377;)</label><input type="number" name="price" value="' + esc(editingPackage.price != null ? editingPackage.price : '') + '" required /></div>' +
            '<div><label>Duration (e.g. 7 Days)</label><input type="text" name="duration" value="' + esc(editingPackage.duration || '') + '" required /></div>' +
            '<div class="full"><label>Main Image URL</label><input type="url" name="image" value="' + esc(editingPackage.image || '') + '" required /></div>' +
            '<div class="full"><label>Description</label><textarea name="description" rows="3" required>' + esc(editingPackage.description || '') + '</textarea></div>' +
            '<div class="full"><label>Itinerary (One per line)</label><textarea name="itinerary" rows="4" placeholder="Day 1: Arrival...">' + esc(editingPackage.itinerary ? editingPackage.itinerary.join('\n') : '') + '</textarea></div>' +
            '<div><label>Inclusions (One per line)</label><textarea name="inclusions" rows="4">' + esc(editingPackage.inclusions ? editingPackage.inclusions.join('\n') : '') + '</textarea></div>' +
            '<div><label>Exclusions (One per line)</label><textarea name="exclusions" rows="4">' + esc(editingPackage.exclusions ? editingPackage.exclusions.join('\n') : '') + '</textarea></div>' +
            '<div class="edit-form-actions">' +
              '<button type="button" class="btn btn-outline" data-action="cancel-edit">Cancel</button>' +
              '<button type="submit" class="btn btn-blue">Save Package</button>' +
            '</div>' +
          '</div>' +
        '</form>' +
      '</div>';
  } else {
    packagesTabHTML = '' +
      '<div class="flex justify-between items-center mb-6 flex-wrap gap-2">' +
        '<h2>Manage Packages</h2>' +
        '<button class="btn btn-blue" data-action="add-pkg">' + icon('plus', 16) + ' Add Package</button>' +
      '</div>' +
      '<div class="admin-grid">' +
        state.packages.map(pkg =>
          '<div class="admin-pkg-card">' +
            imgTag(pkg.image, pkg.title, '') +
            '<h4>' + esc(pkg.title) + '</h4>' +
            '<p class="admin-pkg-meta">' + formatINR(pkg.price) + ' | ' + esc(pkg.location) + '</p>' +
            '<div class="admin-pkg-actions">' +
              '<button class="link-btn" data-action="edit-pkg" data-id="' + esc(pkg.id) + '">' + icon('edit', 16, 'inline-icon') + 'Edit</button>' +
              '<button class="link-danger" data-action="delete-pkg" data-id="' + esc(pkg.id) + '">' + icon('trash', 16, 'inline-icon') + 'Delete</button>' +
            '</div>' +
          '</div>'
        ).join('') +
      '</div>';
  }

  /* ---- Settings / Security tab ---- */
  const settingsHTML = '' +
    '<div class="max-w-2xl">' +
      '<h2>Site Security &amp; Best Practices</h2>' +
      '<div class="note-box">' +
        '<p>' + icon('info', 16) + ' Note: This is a demonstration admin panel built for this specific environment. In a production setting, this route would be protected by Firebase Authentication Custom Claims or a robust backend session.</p>' +
      '</div>' +
      '<ul class="sec-list">' +
        '<li>' + icon('lock', 20) +
          '<div><strong>HTTPS Enforced</strong><span>All data transmitted between clients and the database is encrypted via SSL/TLS.</span></div>' +
        '</li>' +
        '<li>' + icon('shield', 20) +
          '<div><strong>Form Protection</strong><span>Client-side validation and honeypot fields are active to deter basic spam bots. Input sanitization is recommended on the backend/database rules layer.</span></div>' +
        '</li>' +
        '<li>' + icon('lock', 20) +
          '<div><strong>Database Security Rules</strong><span>In production, Firestore rules should strictly limit write access to `leads` (append only for users, read/write for admins) and `packages` (read only for users, read/write for admins).</span></div>' +
        '</li>' +
      '</ul>' +
    '</div>';

  return '' +
    '<div class="bg-gray-100 py-10">' +
      '<div class="container">' +
        '<div class="admin-header">' +
          '<h1>Admin Dashboard</h1>' +
          '<div class="secure-badge">' + icon('shield', 16) + ' Secure Area</div>' +
        '</div>' +
        '<div class="admin-card">' +
          '<div class="admin-tabs">' +
            '<button class="admin-tab' + (tab === 'leads' ? ' active' : '') + '" data-admin-tab="leads">Inquiries (' + state.leads.length + ')</button>' +
            '<button class="admin-tab' + (tab === 'packages' ? ' active' : '') + '" data-admin-tab="packages">Manage Packages</button>' +
            '<button class="admin-tab' + (tab === 'settings' ? ' active' : '') + '" data-admin-tab="settings">Security Info</button>' +
          '</div>' +
          '<div class="admin-body">' +
            (tab === 'leads'
              ? '<div><h2>Recent Inquiries</h2><div class="table-wrap"><table><thead><tr>' +
                  '<th>Date</th><th>Client</th><th>Package / Details</th><th>Status</th><th>Actions</th>' +
                '</tr></thead><tbody>' + leadsHTML + '</tbody></table></div></div>'
              : (tab === 'packages' ? packagesTabHTML : settingsHTML)) +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* -------------------------------- Footer --------------------------------- */
function renderFooter() {
  return '' +
    '<footer>' +
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<div class="footer-brand">' +
              '<img src="1.jpg.jpeg" alt="Joy Makers Holidays Logo" onerror="this.onerror=null;this.src=window.LOGO_FALLBACK;" />' +
              '<div class="flex flex-col">' +
                '<span class="footer-brand-name">Joy Makers</span>' +
                '<span class="footer-brand-sub">Holidays</span>' +
              '</div>' +
            '</div>' +
            '<p class="footer-about">Crafting Memories. Curating the world\'s most extraordinary travel experiences. Your journey begins with us.</p>' +
          '</div>' +
          '<div>' +
            '<h4>Quick Links</h4>' +
            '<div class="footer-links">' +
              '<button data-nav="home">Home</button>' +
              '<button data-nav="destinations">Destinations</button>' +
              '<button data-nav="about">About Us</button>' +
              '<button data-nav="contact">Contact</button>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h4>Legal</h4>' +
            '<div class="footer-links">' +
              '<button type="button">Privacy Policy</button>' +
              '<button type="button">Terms of Service</button>' +
              '<button type="button">Cookie Policy</button>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h4>Newsletter</h4>' +
            '<p class="footer-about mb-2">Subscribe for travel tips &amp; exclusive offers.</p>' +
            '<div class="newsletter-row">' +
              '<input type="email" id="newsletter-email" class="newsletter-input" placeholder="Email Address" aria-label="Email Address" />' +
              '<button class="newsletter-btn" data-action="newsletter">Go</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '&copy; ' + new Date().getFullYear() + ' Joy Makers Holidays. All rights reserved. (Demo Application)' +
        '</div>' +
      '</div>' +
    '</footer>';
}

/* ---------------------------- WhatsApp float ----------------------------- */
function renderWhatsAppFloat() {
  return '' +
    '<button class="wa-float" onclick="window.open(\'https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20booking%20a%20tour.\', \'_blank\')" aria-label="Chat on WhatsApp">' +
      icon('messageCircle', 28) +
      '<span class="wa-label">Chat with us</span>' +
    '</button>';
}

/* ------------------------------ Page router ------------------------------ */
function renderPage() {
  switch (state.currentPage) {
    case 'home':            return renderHome();
    case 'destinations':    return renderDestinations();
    case 'packageDetails':  return renderPackageDetails();
    case 'about':           return renderAbout();
    case 'contact':         return renderContact();
    case 'blog':            return renderBlog();
    case 'testimonials':    return renderTestimonials();
    case 'admin':           return state.isAdmin ? renderAdmin() : renderHome();
    default:                return renderHome();
  }
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '' +
    renderNavBar() +
    '<main>' + renderPage() + '</main>' +
    renderFooter() +
    renderWhatsAppFloat();
}

/* -------------------------------- Actions -------------------------------- */
function handleAction(action, el) {
  switch (action) {
    case 'toggle-admin':
      state.isAdmin = !state.isAdmin;
      render();
      break;
    case 'toggle-menu':
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
      render();
      break;
    case 'add-pkg':
      state.admin.editingPackage = {};
      render();
      break;
    case 'edit-pkg': {
      const id = el.dataset.id;
      state.admin.editingPackage = state.packages.find(p => p.id === id) || {};
      render();
      break;
    }
    case 'delete-pkg':
      handlePackageDelete(el.dataset.id);
      break;
    case 'toggle-lead':
      markLeadContacted(el.dataset.id, el.dataset.status);
      break;
    case 'cancel-edit':
      state.admin.editingPackage = null;
      render();
      break;
    case 'clear-filters':
      resetFilters();
      break;
    case 'newsletter':
      handleNewsletter();
      break;
  }
}

function handlePackageDelete(id) {
  if (window.confirm('Are you sure you want to delete this package?')) {
    try {
      DB.deletePackage(id);
      state.packages = DB.getPackages();
      showToast('Package deleted.');
    } catch (e) {
      showToast('Error deleting.', 'error');
      console.error(e);
    }
    render();
  }
}

function markLeadContacted(leadId, currentStatus) {
  try {
    const newStatus = currentStatus === 'Contacted' ? 'New' : 'Contacted';
    DB.updateLead(leadId, { status: newStatus });
    state.leads = DB.getLeads();
    showToast('Lead marked as ' + newStatus);
  } catch (err) {
    console.error(err);
  }
  render();
}

function handleLeadSubmit(e, packageInfo) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  // Honeypot — silently drop submissions from simple bots.
  if (data['bot-field']) return;

  // Basic validation.
  if (!data.name || !data.email || !data.phone) {
    showToast('Please fill out all required fields.', 'error');
    return;
  }

  const leadData = {
    ...data,
    packageId: (packageInfo && packageInfo.id) || 'General Inquiry',
    packageName: (packageInfo && packageInfo.title) || 'N/A',
    createdAt: Date.now(),
    status: 'New'
  };

  try {
    DB.addLead(leadData);
    state.leads = DB.getLeads();
    showToast('Inquiry sent successfully! We will contact you soon.');
    form.reset();
  } catch (err) {
    showToast('Error sending inquiry. Please try again.', 'error');
    console.error(err);
  }
}

function handlePackageSave(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  // Parse arrays and numbers.
  const parsedData = {
    ...data,
    price: Number(data.price),
    itinerary: data.itinerary.split('\n').filter(i => i.trim() !== ''),
    inclusions: data.inclusions.split('\n').filter(i => i.trim() !== ''),
    exclusions: data.exclusions.split('\n').filter(i => i.trim() !== ''),
    images: [data.image] // Simplification for demo
  };

  try {
    const editing = state.admin.editingPackage;
    if (editing && editing.id) {
      DB.updatePackage(editing.id, parsedData);
      showToast('Package updated successfully.');
    } else {
      const newId = 'pkg-' + Date.now();
      DB.addPackage({ ...parsedData, id: newId });
      showToast('New package created.');
    }
    state.admin.editingPackage = null;
    state.packages = DB.getPackages();
  } catch (err) {
    showToast('Error saving package.', 'error');
    console.error(err);
  }
  render();
}

function handleNewsletter() {
  const input = document.getElementById('newsletter-email');
  const email = input ? input.value.trim() : '';
  if (!email) {
    showToast('Please enter your email address.', 'error');
    return;
  }
  showToast('Subscribed! (Demo)');
  if (input) input.value = '';
}

/* ----------------------------- Event wiring ------------------------------ */
document.addEventListener('click', (e) => {
  const navEl = e.target.closest('[data-nav]');
  if (navEl) {
    navigate(navEl.dataset.nav, navEl.dataset.pkg || null);
    return;
  }

  const actionEl = e.target.closest('[data-action]');
  if (actionEl) {
    handleAction(actionEl.dataset.action, actionEl);
    return;
  }

  const tabBtn = e.target.closest('[data-admin-tab]');
  if (tabBtn) {
    state.admin.tab = tabBtn.dataset.adminTab;
    render();
    return;
  }

  const thumb = e.target.closest('[data-thumb]');
  if (thumb) {
    state.pkgDetails.activeImage = thumb.dataset.thumb;
    render();
    return;
  }

  const detailsTab = e.target.closest('[data-details-tab]');
  if (detailsTab) {
    state.pkgDetails.activeTab = detailsTab.dataset.detailsTab;
    render();
    return;
  }
});

document.addEventListener('submit', (e) => {
  if (e.target.matches('[data-lead-form]')) {
    const pkgId = e.target.dataset.leadForm;
    const pkg = pkgId ? state.packages.find(p => p.id === pkgId) : null;
    const info = pkg
      ? { id: pkg.id, title: pkg.title }
      : { id: 'General Contact', title: 'General Inquiry' };
    handleLeadSubmit(e, info);
  } else if (e.target.matches('[data-package-form]')) {
    handlePackageSave(e);
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'search-input') {
    state.searchTerm = e.target.value;
    updateResults();
  } else if (e.target.id === 'price-range') {
    state.maxPrice = Number(e.target.value);
    const label = document.getElementById('price-label');
    if (label) label.textContent = formatINR(state.maxPrice);
    updateResults();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'type-select') {
    state.filterType = e.target.value;
    updateResults();
  }
});

/* --------------------------------- Boot ---------------------------------- */
function init() {
  // Show the loading screen while "initializing" (simulates async auth + fetch).
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loader-screen"><div class="spinner"></div></div>';

  setTimeout(() => {
    try {
      state.packages = DB.getPackages();
      state.leads = DB.getLeads();
    } catch (err) {
      console.error('Error initializing data:', err);
    }
    render();
  }, 400);
}

document.addEventListener('DOMContentLoaded', init);
