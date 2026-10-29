// ===============================
// CONFIGURACIÓN TODOCOR
// Cambia únicamente estos valores para conectar tus enlaces reales.
// ===============================
const TODOCOR_CONFIG = {
  brandName: 'TODOCOR',
  description: 'Todo lo que buscas, en un solo lugar.',
  logo: 'assets/logo.svg',
  mostrarRedes: false,
  categoriasActivas: ['Zapatos', 'Pantalones'],
  // Escribe el número con indicativo de país, sin +, espacios ni guiones.
  whatsappNumber: '573124101300',
  colors: { primary: '#ff5e4d', secondary: '#ffad4a', ink: '#17132e' },
  links: {
    products: 'products.html',
    offers: 'product.html?id=3',
    whatsappSecondary: 'https://wa.me/573116364100?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20un%20producto%20de%20TODOCOR.',
    tiktok: 'https://www.tiktok.com/@todocor.co?is_from_webapp=1&sender_device=pc',
    instagram: 'https://www.instagram.com/todocor.co/',
    facebook: '#FACEBOOK'
  }
};

function buildWhatsAppLink(message, number = TODOCOR_CONFIG.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function applyConfig() {
  const config = TODOCOR_CONFIG;
  document.documentElement.style.setProperty('--accent', config.colors.primary);
  document.documentElement.style.setProperty('--accent-2', config.colors.secondary);
  document.documentElement.style.setProperty('--ink', config.colors.ink);
  document.title = `${config.brandName} | Todo lo que buscas, en un solo lugar`;
  const brandName = document.getElementById('brand-name');
  const footerBrand = document.getElementById('footer-brand');
  const brandDescription = document.getElementById('brand-description');
  const copyrightYear = document.getElementById('copyright-year');
  if (brandName) brandName.textContent = config.brandName;
  if (footerBrand) footerBrand.textContent = config.brandName;
  if (brandDescription) brandDescription.textContent = config.description;
  if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();
  const logo = document.getElementById('brand-logo');
  if (logo) {
    logo.src = config.logo;
    logo.alt = `Logo ${config.brandName}`;
  }
  document.querySelectorAll('[data-link]').forEach((element) => {
    const url = element.dataset.link === 'whatsapp'
      ? buildWhatsAppLink('Hola, quiero información sobre un producto de TODOCOR.')
      : config.links[element.dataset.link];
    if (url) element.href = url;
    if (['tiktok', 'instagram', 'facebook'].includes(element.dataset.link)) {
      element.style.display = config.mostrarRedes ? '' : 'none';
    }
  });
}

applyConfig();
