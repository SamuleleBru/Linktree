import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productImageDirectory = path.join(root, 'assets', 'products');
const catalogs = ['products.json', 'products_ocultos.json'];
const htmlFiles = ['index.html', 'products.html', 'product.html'];
const errors = [];
const referencedImages = new Set();

function reportError(message) {
  errors.push(message);
  console.error(`ERROR: ${message}`);
}

for (const catalogPath of catalogs) {
  let products;

  try {
    products = JSON.parse(readFileSync(path.join(root, catalogPath), 'utf8'));
  } catch (error) {
    reportError(`${catalogPath}: ${error.message}`);
    continue;
  }

  if (!Array.isArray(products)) {
    reportError(`${catalogPath}: the root value must be an array.`);
    continue;
  }

  const ids = new Set();
  for (const [index, product] of products.entries()) {
    const location = `${catalogPath}, product ${index + 1}`;
    if (!product || typeof product !== 'object' || Array.isArray(product)) {
      reportError(`${location}: expected an object.`);
      continue;
    }

    if (!Number.isInteger(product.id)) reportError(`${location}: id must be an integer.`);
    else if (ids.has(product.id)) reportError(`${location}: duplicate id ${product.id}.`);
    else ids.add(product.id);

    for (const field of ['nombre', 'descripcion', 'categoria', 'imagen']) {
      if (typeof product[field] !== 'string' || !product[field].trim()) {
        reportError(`${location}: ${field} must be a non-empty string.`);
      }
    }

    for (const field of ['destacado', 'disponible']) {
      if (typeof product[field] !== 'boolean') reportError(`${location}: ${field} must be a boolean.`);
    }

    if (product.precio !== null && product.precio !== '' &&
        (typeof product.precio !== 'number' || !Number.isFinite(product.precio) || product.precio < 0)) {
      reportError(`${location}: precio must be a non-negative number, null, or an empty string.`);
    }

    if (typeof product.imagen === 'string') {
      const imagePath = path.resolve(root, product.imagen);
      if (!imagePath.startsWith(`${productImageDirectory}${path.sep}`)) {
        reportError(`${location}: imagen must point inside assets/products/.`);
      } else if (!existsSync(imagePath)) {
        reportError(`${location}: image not found at ${product.imagen}.`);
      } else {
        referencedImages.add(imagePath);
      }
    }
  }

  console.log(`${catalogPath}: ${products.length} records checked.`);
}

for (const htmlPath of htmlFiles) {
  const html = readFileSync(path.join(root, htmlPath), 'utf8');
  const references = html.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi);

  for (const [, reference] of references) {
    if (/^(?:#|[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) continue;
    const relativePath = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    if (!relativePath) continue;

    const target = path.resolve(path.dirname(path.join(root, htmlPath)), relativePath);
    if (!target.startsWith(`${root}${path.sep}`) || !existsSync(target)) {
      reportError(`${htmlPath}: local reference not found: ${reference}.`);
    }
  }
}

const unreferencedImages = readdirSync(productImageDirectory)
  .map((filename) => path.join(productImageDirectory, filename))
  .filter((imagePath) => !referencedImages.has(imagePath));
if (unreferencedImages.length > 0) {
  console.warn('Unreferenced product assets (review before removing):');
  for (const imagePath of unreferencedImages) {
    console.warn(`- ${path.relative(root, imagePath).split(path.sep).join('/')}`);
  }
}

if (errors.length > 0) {
  console.error(`Site validation failed with ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log(`${htmlFiles.length} HTML pages: local references checked.`);
  console.log('Site validation passed.');
}
