/* ============================================================
   AYORA PARFUM — APP.JS v2.0
   Updated: New products, city delivery pricing, improved compare, quiz
============================================================ */

// ── State ──
const state = {
  lang: 'fr',
  cart: [],
  wishlist: [],
  filterBrand: '',
  filterGender: '',
  filterFamily: '',
  filterOccasion: '',
  filterSeason: '',
  searchQuery: '',
  quizStep: 0,
  quizAnswers: {},
  data: null,
  currentProduct: null,
  selectedSize: '5ml',
  selectedCity: null,
  deliveryPrice: 0
};

// ── Boot ──
async function boot() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('fetch failed');
    state.data = await res.json();
  } catch(e) {
    // Fallback: use inline data embedded in the page
    state.data = window.__AYORA_DATA__ || null;
  }
  if (!state.data) {
    // Final fallback: hide loader anyway so user isn't stuck
    hideLoader();
    console.error('No data loaded!');
    return;
  }
  initLang();
  renderNav();
  renderHero();
  renderFilterBar();
  renderProducts();
  renderGuide();
  renderQuizIntro();
  renderAbout();
  renderContact();
  renderCart();
  renderSeasonalStrip();
  initScrollEffects();
  observeCards();
  initWhatsapp();
  hideLoader();
}

function hideLoader() {
  document.getElementById('loading-screen').classList.add('hidden');
}

// ── Language ──
function t(key) {
  const d = state.data;
  if (!d) return '';
  return d.ui?.[key]?.[state.lang] || d.ui?.[key]?.fr || key;
}
function tObj(obj) {
  if (!obj) return '';
  return obj[state.lang] || obj.fr || '';
}
function setLang(lang) {
  state.lang = lang;
  document.body.classList.toggle('rtl', lang === 'ar');
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  renderAll();
}
function renderAll() {
  renderNav();
  renderHero();
  renderFilterBar();
  renderProducts();
  renderGuide();
  renderQuizIntro();
  renderAbout();
  renderContact();
  renderCart();
  renderSeasonalStrip();
  updateLangButtons();
  observeCards();
}
function updateLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === state.lang);
  });
}

// ── Nav ──
function renderNav() {
  const d = state.data;
  const nav = d.nav;
  const links = document.getElementById('nav-links');
  if (links) {
    links.innerHTML = `
      <li><a href="#hero">${tObj(nav.home)}</a></li>
      <li><a href="#products">${tObj(nav.products)}</a></li>
      <li><a href="#quiz-section">${tObj(nav.quiz)}</a></li>
      <li><a href="#guide">${tObj(nav.guide)}</a></li>
      <li><a href="#about">${tObj(nav.about)}</a></li>
      <li><a href="#contact">${tObj(nav.contact)}</a></li>
    `;
  }
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.innerHTML = `
      <a href="#hero" onclick="closeMobileMenu()">${tObj(nav.home)}</a>
      <a href="#products" onclick="closeMobileMenu()">${tObj(nav.products)}</a>
      <a href="#quiz-section" onclick="closeMobileMenu()">${tObj(nav.quiz)}</a>
      <a href="#guide" onclick="closeMobileMenu()">${tObj(nav.guide)}</a>
      <a href="#about" onclick="closeMobileMenu()">${tObj(nav.about)}</a>
      <a href="#contact" onclick="closeMobileMenu()">${tObj(nav.contact)}</a>
    `;
  }
}
function initLang() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}
window.openMobileMenu = function() {
  document.getElementById('mobile-menu').classList.add('open');
  document.getElementById('overlay').classList.add('show');
};
window.closeMobileMenu = function() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
};

// ── Hero ──
function renderHero() {
  const h = state.data.hero;
  const b = state.data.brand;
  const headline = el('hero-headline');
  if (headline) {
    const text = tObj(h.headline);
    const parts = text.split(' ');
    const mid = Math.ceil(parts.length / 2);
    headline.innerHTML = `${parts.slice(0,mid).join(' ')}<br><em>${parts.slice(mid).join(' ')}</em>`;
  }
  const sub = el('hero-sub');
  if (sub) sub.textContent = tObj(h.sub);
  const cta = el('hero-cta');
  if (cta) cta.innerHTML = `<span>${tObj(h.cta)}</span>`;
  const cta2 = el('hero-cta2');
  if (cta2) cta2.textContent = tObj(h.cta2);
  const delivery = el('hero-delivery');
  if (delivery) delivery.textContent = tObj(b.delivery);
}

// ── Seasonal Strip ──
function renderSeasonalStrip() {
  const b = state.data.brand;
  const strip = el('seasonal-text');
  if (!strip) return;
  const msgs = [
    tObj(b.delivery),
    '🌸 Recommandations Printemps / Spring',
    '✨ Échantillons gratuits avec chaque commande',
    tObj(b.delivery),
    '🏷️ عينات مجانية مع كل طلب',
    '🚚 توصيل في 24-48 ساعة'
  ];
  strip.textContent = msgs.join('   ·   ');
}

// ── Filter Bar ──
function renderFilterBar() {
  const wrap = el('filter-controls');
  if (!wrap) return;
  const brands = [...new Set(state.data.products.map(p => p.brand))];
  wrap.innerHTML = `
    <div class="search-wrap">
      <span class="search-icon">🔍</span>
      <input type="text" id="search-input" placeholder="${t('search')}" value="${state.searchQuery}" oninput="onSearch(this.value)">
    </div>
    <select class="filter-select" onchange="onFilter('brand', this.value)">
      <option value="">${state.lang === 'ar' ? 'الماركة' : 'Marque'}</option>
      ${brands.map(b => `<option value="${b}" ${state.filterBrand === b ? 'selected' : ''}>${b}</option>`).join('')}
    </select>
    <select class="filter-select" onchange="onFilter('season', this.value)">
      <option value="">${state.lang === 'ar' ? 'الموسم' : 'Saison'}</option>
      <option value="spring" ${state.filterSeason==='spring'?'selected':''}>${state.lang === 'ar' ? 'ربيع' : 'Printemps'}</option>
      <option value="summer" ${state.filterSeason==='summer'?'selected':''}>${state.lang === 'ar' ? 'صيف' : 'Été'}</option>
      <option value="autumn" ${state.filterSeason==='autumn'?'selected':''}>${state.lang === 'ar' ? 'خريف' : 'Automne'}</option>
      <option value="winter" ${state.filterSeason==='winter'?'selected':''}>${state.lang === 'ar' ? 'شتاء' : 'Hiver'}</option>
    </select>
  `;
}
window.onSearch = function(v) { state.searchQuery = v; renderProducts(); };
window.onFilter = function(key, v) {
  state['filter' + key.charAt(0).toUpperCase() + key.slice(1)] = v;
  renderProducts();
};

// ── Products ──
function getFilteredProducts() {
  return state.data.products.filter(p => {
    const q = state.searchQuery.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) &&
        !tObj(p.family).toLowerCase().includes(q) && !p.name_ar?.includes(q)) return false;
    if (state.filterBrand && p.brand !== state.filterBrand) return false;
    if (state.filterSeason && !p.season.includes(state.filterSeason)) return false;
    return true;
  });
}

function renderProducts() {
  const grid = el('products-grid');
  if (!grid) return;
  const products = getFilteredProducts();
  if (!products.length) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);font-size:0.9rem">${state.lang === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat trouvé'}</div>`;
    return;
  }
  grid.innerHTML = products.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.08}s">
      <div class="product-badge">${p.badge}</div>
      <div class="delivery-badge">🚚 ${state.lang === 'ar' ? 'توصيل المغرب' : 'Livraison Maroc'}</div>
      <div class="product-img-wrap" onclick="openProductModal(${p.id})" style="cursor:pointer">
        <img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy" 
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80';this.style.opacity='0.7'">
        <button class="wishlist-btn ${state.wishlist.includes(p.id) ? 'active' : ''}"
          onclick="toggleWishlist(event, ${p.id})" title="${t('wishlist')}">
          ${state.wishlist.includes(p.id) ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="product-info" onclick="openProductModal(${p.id})">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${state.lang === 'ar' ? p.name_ar : p.name}</div>
        <div class="product-family">${tObj(p.family)}</div>
        <div class="product-price-row" style="flex-direction:column;gap:8px;align-items:stretch">
          <div style="display:flex;gap:8px">
            <div class="product-price" style="flex:1">
              <strong>${p.prices['5ml']}</strong> <span>MAD / 5ml</span>
            </div>
            <div class="product-price" style="flex:1">
              <strong>${p.prices['10ml']}</strong> <span>MAD / 10ml</span>
            </div>
          </div>
          <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
            <button class="add-to-cart" style="flex:1;font-size:0.65rem" onclick="addToCart(${p.id}, '5ml')">
              + 5ml
            </button>
            <button class="add-to-cart" style="flex:1;font-size:0.65rem;background:var(--purple)" onclick="addToCart(${p.id}, '10ml')">
              + 10ml
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const sTitle = el('products-section-title');
  if (sTitle) sTitle.innerHTML = state.lang === 'ar' ? 'مجموعتنا <em>الرائعة</em>' : 'Notre <em>Collection</em>';
  const sEye = el('products-section-eyebrow');
  if (sEye) sEye.textContent = state.lang === 'ar' ? 'العطور' : 'Parfums';
}

window.openProductModal = function(id) {
  const p = state.data.products.find(x => x.id === id);
  if (!p) return;
  state.currentProduct = p;
  state.selectedSize = '5ml';

  // Gallery setup
  const images = (p.images && p.images.length > 1) ? p.images : [p.image];
  state.galleryImages = images;
  state.galleryIndex = 0;

  // Rebuild the img-side content entirely for gallery
  const imgSide = document.querySelector('#product-modal .modal-img-side');
  if (imgSide) {
    if (images.length > 1) {
      imgSide.innerHTML = `
        <div class="modal-gallery">
          <div class="gallery-main-wrap">
            <button class="gallery-arrow gallery-prev" onclick="galleryNav(-1)">&#8592;</button>
            <img id="modal-img" class="gallery-main-img" src="${images[0]}" alt="${p.name}">
            <button class="gallery-arrow gallery-next" onclick="galleryNav(1)">&#8594;</button>
          </div>
          <div class="gallery-thumbs" id="gallery-thumbs">
            ${images.map((img, i) => `
              <img class="gallery-thumb ${i === 0 ? 'active' : ''}" src="${img}" alt="" onclick="gallerySet(${i})">
            `).join('')}
          </div>
        </div>`;
    } else {
      imgSide.innerHTML = `<img id="modal-img" src="${images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">`;
    }
  }

  el('modal-brand').textContent = p.brand;
  el('modal-name').textContent = state.lang === 'ar' ? p.name_ar : p.name;
  el('modal-desc').textContent = tObj(p.description);
  el('modal-note-top-val').textContent = tObj(p.notes.top);
  el('modal-note-heart-val').textContent = tObj(p.notes.heart);
  el('modal-note-base-val').textContent = tObj(p.notes.base);
  el('modal-note-top-label').textContent = t('topNotes');
  el('modal-note-heart-label').textContent = t('heartNotes');
  el('modal-note-base-label').textContent = t('baseNotes');
  el('modal-intensity-fill').style.width = (p.intensity / 5 * 100) + '%';
  el('modal-intensity-label').textContent = t('intensity');
  el('modal-longevity').textContent = `${t('longevity')}: ${p.longevity}`;
  el('modal-family').textContent = `${state.lang === 'ar' ? 'العائلة العطرية' : 'Famille'}: ${tObj(p.family)}`;

  // Only 5ml and 10ml
  const sizes = el('modal-sizes');
  sizes.innerHTML = ['5ml', '10ml'].map(s => `
    <button class="size-opt ${s === state.selectedSize ? 'active' : ''}" onclick="selectSize('${s}', ${p.id}, this)">
      ${s}
      <span class="size-price">${p.prices[s]} MAD</span>
    </button>
  `).join('');

  el('modal-add-btn').innerHTML = `<span>${t('addToCart')}</span>`;
  el('modal-add-btn').onclick = () => { addToCart(p.id, state.selectedSize); closeModal(); };

  renderSimilar(p);

  el('product-modal').classList.add('open');
  document.getElementById('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
};

window.selectSize = function(size, id, btn) {
  state.selectedSize = size;
  document.querySelectorAll('.size-opt').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
};

function renderSimilar(p) {
  const pFamily = typeof p.family === 'object' ? p.family.fr : p.family;
  const similar = state.data.products.filter(x => {
    if (x.id === p.id) return false;
    const xFamily = typeof x.family === 'object' ? x.family.fr : x.family;
    return xFamily === pFamily || x.gender === p.gender;
  }).slice(0, 2);
  const wrap = el('modal-similar');
  if (!wrap) return;
  if (!similar.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `
    <div style="font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--gold);margin-bottom:16px">${t('mightLike')}</div>
    <div style="display:flex;gap:12px">
      ${similar.map(s => `
        <div style="flex:1;border:1px solid var(--border);padding:12px;cursor:pointer" onclick="openProductModal(${s.id})">
          <img src="${s.image}" alt="${s.name}" style="width:100%;height:90px;object-fit:contain;background:var(--off-white);margin-bottom:8px;border-radius:4px;padding:6px;box-sizing:border-box">
          <div style="font-size:0.6rem;color:var(--gold);letter-spacing:0.2em;text-transform:uppercase">${s.brand}</div>
          <div style="font-family:var(--font-serif);font-style:italic;color:var(--purple);font-size:0.9rem">${state.lang === 'ar' ? s.name_ar : s.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${s.prices['5ml']} MAD / 5ml</div>
        </div>
      `).join('')}
    </div>
  `;
}

window.closeModal = function() {
  el('product-modal').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = '';
};

window.galleryNav = function(dir) {
  const imgs = state.galleryImages;
  if (!imgs || imgs.length <= 1) return;
  state.galleryIndex = (state.galleryIndex + dir + imgs.length) % imgs.length;
  galleryUpdate();
};
window.gallerySet = function(i) {
  state.galleryIndex = i;
  galleryUpdate();
};
function galleryUpdate() {
  const mainImg = el('modal-img');
  const thumbs = document.querySelectorAll('#gallery-thumbs .gallery-thumb');
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = state.galleryImages[state.galleryIndex];
      mainImg.style.opacity = '1';
    }, 150);
  }
  thumbs.forEach((t, i) => t.classList.toggle('active', i === state.galleryIndex));
}

// ── Wishlist ──
window.toggleWishlist = function(e, id) {
  e.stopPropagation();
  const idx = state.wishlist.indexOf(id);
  if (idx === -1) state.wishlist.push(id);
  else state.wishlist.splice(idx, 1);
  renderProducts();
  showToast(idx === -1
    ? (state.lang === 'ar' ? 'أُضيف للمفضلة ❤️' : 'Ajouté aux favoris ❤️')
    : (state.lang === 'ar' ? 'حُذف من المفضلة' : 'Retiré des favoris'));
};

// ── Cart ──
window.addToCart = function(id, size) {
  const p = state.data.products.find(x => x.id === id);
  if (!p) return;
  const key = `${id}_${size}`;
  const existing = state.cart.find(x => x.key === key);
  if (existing) existing.qty++;
  else state.cart.push({ key, id, size, qty: 1, product: p });
  renderCart();
  updateCartBadge();
  showToast(state.lang === 'ar' ? 'أُضيف للسلة ✓' : 'Ajouté au panier ✓');
};

function getDeliveryPrice(cityName) {
  if (!cityName || !state.data.cities) return 0;
  const city = state.data.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  return city ? city.price : 35; // default 35dh if city not found
}

function renderCart() {
  const items = el('cart-items');
  const footer = el('cart-footer');
  if (!items) return;

  const cartTitle = el('cart-title');
  if (cartTitle) cartTitle.textContent = state.lang === 'ar' ? 'سلة المشتريات' : 'Mon Panier';

  if (!state.cart.length) {
    items.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛍️</div>
        <div>${t('empty')}</div>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }
  if (footer) footer.style.display = '';

  items.innerHTML = state.cart.map(item => {
    const p = item.product;
    const price = p.prices[item.size] * item.qty;
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${p.image}" alt="${p.name}">
        <div class="cart-item-info">
          <div class="cart-item-brand">${p.brand}</div>
          <div class="cart-item-name">${state.lang === 'ar' ? p.name_ar : p.name}</div>
          <div class="cart-item-size">${item.size}</div>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty('${item.key}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.key}', 1)">+</button>
            <button class="remove-item" onclick="removeFromCart('${item.key}')">✕</button>
          </div>
        </div>
        <div class="cart-item-price">${price} MAD</div>
      </div>`;
  }).join('');

  const subtotal = state.cart.reduce((sum, x) => sum + x.product.prices[x.size] * x.qty, 0);
  const delivery = state.deliveryPrice;
  const total = subtotal + delivery;

  el('cart-total').textContent = `${total} MAD`;
  el('cart-total-label').textContent = t('total');
  el('checkout-btn').innerHTML = `✅ ${state.lang === 'ar' ? 'تأكيد الطلب' : 'Confirmer la commande'}`;

  // Update delivery display
  const deliveryEl = el('cart-delivery-row');
  if (deliveryEl) {
    if (delivery > 0) {
      deliveryEl.style.display = 'flex';
      el('cart-delivery-val').textContent = `${delivery} MAD`;
    } else {
      deliveryEl.style.display = 'none';
    }
  }
  const subtotalEl = el('cart-subtotal-row');
  if (subtotalEl) {
    subtotalEl.style.display = delivery > 0 ? 'flex' : 'none';
    const subVal = el('cart-subtotal-val');
    if (subVal) subVal.textContent = `${subtotal} MAD`;
  }
}

window.changeQty = function(key, d) {
  const item = state.cart.find(x => x.key === key);
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) removeFromCart(key);
  else { renderCart(); updateCartBadge(); }
};
window.removeFromCart = function(key) {
  state.cart = state.cart.filter(x => x.key !== key);
  renderCart(); updateCartBadge();
};
function updateCartBadge() {
  const total = state.cart.reduce((s, x) => s + x.qty, 0);
  const badge = el('cart-count');
  if (!badge) return;
  badge.textContent = total;
  badge.classList.toggle('show', total > 0);
}
window.openCart = function() {
  el('cart-sidebar').classList.add('open');
  el('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
};
window.closeCart = function() {
  el('cart-sidebar').classList.remove('open');
  el('overlay').classList.remove('show');
  document.body.style.overflow = '';
};

window.sendWhatsAppOrder = function() {
  const name = el('order-name')?.value?.trim();
  const city = el('order-city-select')?.value?.trim();
  const address = el('order-address')?.value?.trim();
  const phone = el('order-phone')?.value?.trim();
  if (!name || !city || !address || !phone) {
    showToast(state.lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs');
    return;
  }
  const items = state.cart.map(x => `• ${x.product.brand} ${x.product.name} (${x.size}) x${x.qty} = ${x.product.prices[x.size] * x.qty} MAD`).join('\n');
  const subtotal = state.cart.reduce((s, x) => s + x.product.prices[x.size] * x.qty, 0);
  const delivery = state.deliveryPrice;
  const total = subtotal + delivery;
  const msg = encodeURIComponent(
    `🌹 Commande Ayora Parfum\n\n👤 ${name}\n📍 ${city} — ${address}\n📞 ${phone}\n\n${items}\n\n💰 Sous-total: ${subtotal} MAD\n🚚 Livraison: ${delivery} MAD\n💰 Total: ${total} MAD\n\n🚚 Livraison partout au Maroc`
  );
  const waNumber = state.data?.brand?.whatsapp || '212623892123';
  window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
};

// City search functionality
window.onCitySearch = function(val) {
  const dropdown = el('city-dropdown');
  if (!dropdown) return;
  if (!val || val.length < 2) { dropdown.style.display = 'none'; return; }
  const cities = state.data.cities.filter(c => c.name.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
  if (!cities.length) { dropdown.style.display = 'none'; return; }
  dropdown.innerHTML = cities.map(c => `
    <div class="city-option" onclick="selectCity('${c.name.replace(/'/g, "\\'")}', ${c.price})">
      ${c.name} <span style="color:var(--gold);font-size:0.75rem">${c.price} MAD</span>
    </div>
  `).join('');
  dropdown.style.display = 'block';
};

window.selectCity = function(name, price) {
  const input = el('order-city-display');
  const hiddenInput = el('order-city-select');
  if (input) input.value = name;
  if (hiddenInput) hiddenInput.value = name;
  state.selectedCity = name;
  state.deliveryPrice = price;
  el('city-dropdown').style.display = 'none';
  // Update delivery cost display
  const deliveryInfo = el('delivery-info');
  if (deliveryInfo) {
    deliveryInfo.textContent = `🚚 ${state.lang === 'ar' ? 'توصيل إلى' : 'Livraison vers'} ${name}: ${price} MAD`;
    deliveryInfo.style.display = 'block';
  }
  renderCart();
};

// ── Guide ──
function renderGuide() {
  const grid = el('guide-grid');
  if (!grid || !state.data) return;
  grid.innerHTML = state.data.scent_families.map(f => `
    <div class="guide-card">
      <div class="guide-icon">${f.icon}</div>
      <div class="guide-name">${tObj(f.name)}</div>
      <div class="guide-desc">${tObj(f.desc)}</div>
    </div>
  `).join('');
}

// ── Quiz ──
function renderQuizIntro() {
  // Only reset to intro if quiz hasn't started
  if (state.quizStep === 0 && Object.keys(state.quizAnswers).length === 0) {
    const inner = el('quiz-card-inner');
    if (!inner) return;
    const quiz = state.data.quiz;
    inner.innerHTML = `
      <div style="text-align:center;padding:48px">
        <div style="font-size:3rem;margin-bottom:16px">🌸</div>
        <div style="font-family:var(--font-serif);font-size:1.5rem;color:var(--purple);font-style:italic;margin-bottom:12px">
          ${tObj(quiz.title)}
        </div>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:32px">
          ${state.lang === 'ar' ? 'أجب على ٤ أسئلة واكتشف عطرك المثالي' : 'Répondez à 4 questions et découvrez votre parfum idéal'}
        </p>
        <button class="btn-primary" onclick="renderQuizStep()"><span>${t('startQuiz')}</span></button>
      </div>`;
  }
}

window.renderQuizStep = function() {
  const quiz = state.data.quiz;
  const inner = el('quiz-card-inner');
  if (!inner) return;

  if (state.quizStep >= quiz.questions.length) {
    const result = getQuizResult();
    inner.innerHTML = `
      <div class="quiz-result">
        <div style="font-size:2rem;margin-bottom:8px">✨</div>
        <div class="quiz-result-label">${t('yourPerfume')}</div>
        <div class="quiz-result-name">${state.lang === 'ar' ? result?.name_ar : result?.name}</div>
        <div style="font-size:0.75rem;color:var(--gold);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:20px">${result?.brand || ''}</div>
        ${result ? `
          <img src="${result.image}" alt="${result.name}" style="width:150px;height:150px;object-fit:cover;margin:0 auto 20px;display:block;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.15)">
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:24px;max-width:320px">${tObj(result.description)}</p>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:24px">
            <span style="padding:4px 12px;background:rgba(201,169,110,0.1);border:1px solid var(--gold);border-radius:20px;font-size:0.7rem;color:var(--gold)">${result.prices['5ml']} MAD / 5ml</span>
            <span style="padding:4px 12px;background:rgba(201,169,110,0.1);border:1px solid var(--gold);border-radius:20px;font-size:0.7rem;color:var(--gold)">${result.prices['10ml']} MAD / 10ml</span>
          </div>
        ` : ''}
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" onclick="if(${result?.id}){addToCart(${result?.id}, '5ml'); showToast('${state.lang === 'ar' ? 'أُضيف للسلة ✓' : 'Ajouté au panier ✓'}')}">
            <span>${t('addToCart')}</span>
          </button>
          <button class="btn-secondary" onclick="if(${result?.id}){openProductModal(${result?.id})}">
            ${state.lang === 'ar' ? 'عرض التفاصيل' : 'Voir détails'}
          </button>
        </div>
        <br>
        <button onclick="resetQuiz()" style="background:none;border:none;cursor:pointer;font-size:0.75rem;color:var(--text-muted);text-decoration:underline">
          ${state.lang === 'ar' ? 'إعادة الاختبار' : 'Recommencer le quiz'}
        </button>
      </div>`;
    return;
  }

  const q = quiz.questions[state.quizStep];
  const dots = quiz.questions.map((_, i) =>
    `<div class="quiz-dot ${i <= state.quizStep ? 'active' : ''}"></div>`
  ).join('');

  inner.innerHTML = `
    <div class="quiz-progress">${dots}</div>
    <div style="font-size:0.7rem;color:var(--text-muted);text-align:center;margin-bottom:8px">
      ${state.lang === 'ar' ? `السؤال ${state.quizStep + 1} من ${quiz.questions.length}` : `Question ${state.quizStep + 1} / ${quiz.questions.length}`}
    </div>
    <div class="quiz-question">${tObj(q.question)}</div>
    <div class="quiz-options">
      ${q.options.map(opt => `
        <button class="quiz-opt ${state.quizAnswers[q.id] === opt.value ? 'selected' : ''}"
          onclick="selectQuizOpt(${q.id}, '${opt.value}', this)">
          ${tObj(opt.label)}
        </button>
      `).join('')}
    </div>
    <button class="quiz-next" onclick="nextQuizStep()">
      ${state.quizStep === quiz.questions.length - 1 ? t('getResult') : t('nextQuestion')} →
    </button>
  `;
};

window.selectQuizOpt = function(qid, value, btn) {
  state.quizAnswers[qid] = value;
  btn.closest('.quiz-options').querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
};
window.nextQuizStep = function() {
  const quiz = state.data.quiz;
  const currentQ = quiz.questions[state.quizStep];
  if (!state.quizAnswers[currentQ.id]) {
    showToast(state.lang === 'ar' ? 'يرجى اختيار إجابة' : 'Veuillez choisir une réponse');
    return;
  }
  state.quizStep++;
  renderQuizStep();
};
window.resetQuiz = function() {
  state.quizStep = 0;
  state.quizAnswers = {};
  renderQuizIntro();
};
function getQuizResult() {
  const answers = Object.values(state.quizAnswers);
  const products = state.data.products;

  // Score each product
  const scores = products.map(p => {
    let score = 0;
    // Mood/family matching
    if (answers.includes('oriental') && tObj(p.family).toLowerCase().includes('oriental')) score += 3;
    if (answers.includes('floral') && tObj(p.family).toLowerCase().includes('floral')) score += 3;
    if (answers.includes('gourmand') && tObj(p.family).toLowerCase().includes('gourmand')) score += 3;
    if (answers.includes('fresh') && p.id === 5) score += 3; // Libre = fresh/free
    // Occasion matching
    answers.forEach(a => { if (p.occasion && p.occasion.includes(a)) score += 2; });
    // Intensity matching
    if (answers.includes('intense') && p.intensity >= 4) score += 2;
    if (answers.includes('strong') && p.intensity >= 3) score += 2;
    if (answers.includes('medium') && p.intensity === 3) score += 2;
    if (answers.includes('light') && p.intensity <= 2) score += 2;
    // Season matching
    if (answers.includes('spring') && p.season.includes('spring')) score += 1;
    if (answers.includes('summer') && p.season.includes('summer')) score += 1;
    if (answers.includes('autumn') && p.season.includes('autumn')) score += 1;
    if (answers.includes('winter') && p.season.includes('winter')) score += 1;
    return { product: p, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores[0].product;
}

// ── About ──
function renderAbout() {
  const a = state.data?.about;
  if (!a) return;
  const title = el('about-title');
  const text = el('about-text');
  const eyebrow = el('about-eyebrow');
  if (title) title.innerHTML = state.lang === 'ar' ? 'فن <em>العطور</em> في المغرب' : 'L\'Art du <em>Parfum</em> au Maroc';
  if (text) text.textContent = tObj(a.story);
  if (eyebrow) eyebrow.textContent = state.lang === 'ar' ? 'قصتنا' : 'Notre Histoire';
}

// ── Contact ──
function renderContact() {
  const b = state.data?.brand;
  if (!b) return;
  const title = el('contact-title');
  if (title) title.innerHTML = state.lang === 'ar' ? 'تواصل <em>معنا</em>' : 'Restons <em>en Contact</em>';
  const wa = el('contact-wa-text');
  if (wa) wa.textContent = state.lang === 'ar' ? 'واتساب' : 'WhatsApp';
  const ph = el('contact-phone-text');
  if (ph) ph.textContent = b.phone;
  const tiktok = el('contact-tiktok-text');
  if (tiktok) tiktok.textContent = b.tiktok;
  const delivery = el('contact-delivery');
  if (delivery) delivery.textContent = tObj(b.delivery);
  const copy = el('footer-copy');
  if (copy) copy.textContent = `© ${new Date().getFullYear()} Ayora Parfum. ${state.lang === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés.'}`;
}

// ── Scroll Effects ──
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}
function observeCards() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.style.opacity = '1';
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.product-card, .guide-card').forEach(card => {
    observer.observe(card);
  });
}

// ── WhatsApp ──
function initWhatsapp() {
  const btn = el('wa-float');
  if (btn) btn.href = `https://wa.me/${state.data?.brand.whatsapp}`;
}

// ── Toast ──
function showToast(msg) {
  const toast = el('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Overlay ──
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeModal();
      closeCart();
      closeMobileMenu();
      const d = el('city-dropdown');
      if (d) d.style.display = 'none';
    });
  }
});

// ── Helpers ──
function el(id) { return document.getElementById(id); }

// ── Init ──
document.addEventListener('DOMContentLoaded', boot);

// ── Checkout form — highlight button when fields are filled ──
function initCheckoutHint() {
  const fields = ['order-name', 'order-address', 'order-phone'];
  const allInputs = [...fields.map(id => el(id)), el('order-city-display')].filter(Boolean);

  function checkFields() {
    const name    = el('order-name')?.value?.trim();
    const city    = el('order-city-select')?.value?.trim();
    const address = el('order-address')?.value?.trim();
    const phone   = el('order-phone')?.value?.trim();
    const btn     = el('checkout-btn');
    const hint    = el('checkout-hint');
    if (!btn) return;

    const allFilled = name && city && address && phone;
    if (allFilled) {
      btn.classList.add('pulse-ready');
      if (hint) {
        hint.style.display = 'flex';
        const hintText = document.getElementById('checkout-hint-text');
        if (hintText) hintText.textContent = state.lang === 'ar'
          ? '! اضغط هنا لإتمام طلبك'
          : 'Appuyez pour finaliser votre commande !';
      }
    } else {
      btn.classList.remove('pulse-ready');
      if (hint) hint.style.display = 'none';
    }
  }

  // Attach listeners when cart opens
  document.addEventListener('input', function(e) {
    if (['order-name','order-address','order-phone','order-city-display'].includes(e.target.id)) {
      checkFields();
    }
  });

  // Re-check after city selection from dropdown
  const origSelectCity = window.selectCity;
  if (typeof origSelectCity === 'function') {
    window.selectCity = function(name, price) {
      origSelectCity(name, price);
      setTimeout(checkFields, 50);
    };
  }
}

document.addEventListener('DOMContentLoaded', initCheckoutHint);