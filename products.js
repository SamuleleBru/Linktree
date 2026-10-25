/* Catálogo TODOCOR: los productos se administran exclusivamente en products.json. */
const PRODUCTS_URL = 'products.json';
const OFFER_THRESHOLD = 50000;
const OFFER_DISCOUNT_LOW = 5000;
const OFFER_DISCOUNT_HIGH = 10000;
const SUBCATEGORIES = ['Mujer', 'Hombre'];

const formatPrice = (price) => `$${Number(price).toLocaleString('es-CO')}`;
const escapeHTML = (text) => String(text).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
const hasPrice = (product) => product.precio !== null && product.precio !== undefined && product.precio !== '';
const previousPrice = (product) => Number(product.precio) + (Number(product.precio) >= OFFER_THRESHOLD ? OFFER_DISCOUNT_HIGH : OFFER_DISCOUNT_LOW);
const discount = (product) => hasPrice(product) ? Math.round((1 - product.precio / previousPrice(product)) * 100) : 0;
const isActiveCategory = (product) => TODOCOR_CONFIG.categoriasActivas.includes(product.categoria);

function askLink(product) {
  const message = `Hola TODOCOR, quiero información de: ${product.nombre}`;
  return `https://wa.me/573124101300?text=${encodeURIComponent(message)}`;
}

async function getProducts() {
  const response = await fetch(PRODUCTS_URL);
  if (!response.ok) throw new Error('No fue posible cargar el catálogo.');
  return response.json();
}

function productCard(product) {
  const sale = discount(product);
  const priceContent = hasPrice(product)
    ? `<strong>${formatPrice(product.precio)}</strong><del>${formatPrice(previousPrice(product))}</del>`
    : `<a class="secondary-button" href="${askLink(product)}" target="_blank" rel="noopener">Preguntar</a>`;
  return `<article class="catalog-card">
    <a href="product.html?id=${product.id}" class="product-image"><img src="${escapeHTML(product.imagen)}" alt="${escapeHTML(product.nombre)}" />${sale ? `<span class="discount-badge">-${sale}%</span>` : ''}</a>
    <div class="catalog-card-content"><span class="category-label">${escapeHTML(product.categoria)}</span><h2>${escapeHTML(product.nombre)}</h2>
    <div class="price-row">${priceContent}</div>
    <span class="availability ${product.disponible ? '' : 'not-available'}">${product.disponible ? '● Disponible' : '● Agotado'}</span>
    <div class="card-actions"><a href="product.html?id=${product.id}" class="secondary-button">Ver producto</a>${hasPrice(product) ? `<a href="${whatsappLink(product)}" class="buy-button" target="_blank" rel="noopener">Comprar</a>` : ''}</div></div>
  </article>`;
}

function whatsappLink(product) {
  const message = `Hola ${TODOCOR_CONFIG.brandName} 👋, estoy interesado en el ${product.nombre} por ${formatPrice(product.precio)}.`;
  return `https://wa.me/${TODOCOR_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

async function renderFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;
  try {
    const products = await getProducts();
    container.innerHTML = products.filter((product) => isActiveCategory(product) && product.destacado && product.disponible).slice(0, 4).map((product) => `
      <article class="product-card"><a href="product.html?id=${product.id}"><img src="${escapeHTML(product.imagen)}" alt="${escapeHTML(product.nombre)}" /></a><div class="product-info"><h3>${escapeHTML(product.nombre)}</h3>${hasPrice(product) ? `<p>${formatPrice(product.precio)}</p>` : `<a class="ask-price" href="${askLink(product)}" target="_blank" rel="noopener">Preguntar</a>`}<a href="product.html?id=${product.id}">Ver producto <span>→</span></a></div></article>`).join('');
  } catch (error) { container.innerHTML = '<p class="catalog-error">No se pudieron cargar los productos.</p>'; }
}

async function renderCatalog() {
  const container = document.getElementById('catalog-products');
  if (!container) return;
  const search = document.getElementById('product-search');
  const filters = document.getElementById('category-filters');
  const subcategoryFilters = document.getElementById('subcategory-filters');
  const count = document.getElementById('product-count');
  const empty = document.getElementById('empty-state');
  try {
    const products = await getProducts(); let activeCategory = 'Todos';
    let activeSubcategory = 'Todos';
    const categories = ['Todos', ...TODOCOR_CONFIG.categoriasActivas];
    filters.innerHTML = categories.map((category) => `<button class="filter-button${category === activeCategory ? ' active' : ''}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join('');
    const drawSubcategoryFilters = () => {
      subcategoryFilters.hidden = activeCategory === 'Todos';
      subcategoryFilters.style.display = subcategoryFilters.hidden ? 'none' : '';
      if (!subcategoryFilters.hidden) {
        const subcategories = ['Todos', ...SUBCATEGORIES];
        subcategoryFilters.innerHTML = subcategories.map((subcategory) => `<button class="filter-button${subcategory === activeSubcategory ? ' active' : ''}" data-subcategory="${escapeHTML(subcategory)}">${escapeHTML(subcategory)}</button>`).join('');
      } else {
        subcategoryFilters.innerHTML = '';
      }
    };
    const draw = () => {
      const term = search.value.trim().toLocaleLowerCase('es');
      const visible = products.filter((product) => isActiveCategory(product) && (activeCategory === 'Todos' || product.categoria === activeCategory) && (activeSubcategory === 'Todos' || product.subcategoria === activeSubcategory) && `${product.nombre} ${product.descripcion}`.toLocaleLowerCase('es').includes(term));
      container.innerHTML = visible.map(productCard).join(''); count.textContent = `${visible.length} producto${visible.length === 1 ? '' : 's'} encontrado${visible.length === 1 ? '' : 's'}`; empty.hidden = visible.length !== 0;
    };
    drawSubcategoryFilters();
    search.addEventListener('input', draw);
    filters.addEventListener('click', (event) => { const button = event.target.closest('[data-category]'); if (!button) return; activeCategory = button.dataset.category; activeSubcategory = 'Todos'; filters.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button)); drawSubcategoryFilters(); draw(); });
    subcategoryFilters.addEventListener('click', (event) => { const button = event.target.closest('[data-subcategory]'); if (!button) return; activeSubcategory = button.dataset.subcategory; subcategoryFilters.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button)); draw(); });
    draw();
  } catch (error) { container.innerHTML = '<p class="catalog-error">No fue posible cargar el catálogo.</p>'; }
}

async function renderProductDetail() {
  const container = document.getElementById('product-detail');
  if (!container) return;
  try {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    const product = (await getProducts()).find((item) => item.id === id);
    if (!product || !isActiveCategory(product)) { document.getElementById('missing-product').hidden = false; return; }
    const sale = discount(product); const priceContent = hasPrice(product) ? `<strong>${formatPrice(product.precio)}</strong><del>${formatPrice(previousPrice(product))}</del>` : `<a class="whatsapp-buy" href="${askLink(product)}" target="_blank" rel="noopener">Preguntar</a>`; document.title = `${product.nombre} | ${TODOCOR_CONFIG.brandName}`;
    const purchaseButton = hasPrice(product) && product.disponible ? `<a class="whatsapp-buy" href="${whatsappLink(product)}" target="_blank" rel="noopener">💬 COMPRAR POR WHATSAPP</a>` : '';
    container.innerHTML = `<div class="detail-image"><img src="${escapeHTML(product.imagen)}" alt="${escapeHTML(product.nombre)}" />${sale ? `<span class="discount-badge">-${sale}%</span>` : ''}</div><div class="detail-content"><span class="category-label">${escapeHTML(product.categoria)}</span><h1>${escapeHTML(product.nombre)}</h1><div class="detail-price">${priceContent}</div><p class="detail-description">${escapeHTML(product.descripcion)}</p><span class="availability ${product.disponible ? '' : 'not-available'}">${product.disponible ? '● Disponible para envío' : '● No disponible actualmente'}</span>${hasPrice(product) ? purchaseButton : ''}</div>`;
  } catch (error) { document.getElementById('missing-product').hidden = false; }
}

renderFeaturedProducts(); renderCatalog(); renderProductDetail();
