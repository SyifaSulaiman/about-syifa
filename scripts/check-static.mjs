import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');
const htmlPath = path.join(outputRoot, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const requiredSections = ['home', 'about', 'education', 'projects', 'experience', 'skills', 'activities', 'gallery', 'contact'];
const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));

assert.equal((html.match(/<section\b/g) ?? []).length, 9, 'Expected exactly nine rendered portfolio sections.');
for (const id of requiredSections) {
    assert(ids.has(id), `Missing rendered section id: ${id}`);
}

const navigation = html.match(/<nav\b[\s\S]*?<\/nav>/i)?.[0];
assert(navigation, 'Main navigation was not rendered.');
const navigationTargets = [...navigation.matchAll(/href=["']#([^"']+)["']/g)].map((match) => match[1]);
assert(navigationTargets.length >= 9, 'Expected a navigation link for all nine sections.');
for (const target of navigationTargets) {
    assert(ids.has(target), `Navigation points to a missing id: ${target}`);
}

const staticBase = new URL('https://example.test/portfolio/');
const assetRefs = [];
for (const tag of html.matchAll(/<(?:link|script|img)\b[^>]*>/gi)) {
    for (const attribute of tag[0].matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
        assetRefs.push(attribute[1]);
    }
}
for (const cssUrl of html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
    assetRefs.push(cssUrl[1]);
}

let cssCount = 0;
let jsCount = 0;
let imageCount = 0;
let fontCount = 0;
for (const reference of assetRefs) {
    if (reference.startsWith('#') || /^(?:[a-z]+:|\/\/)/i.test(reference)) {
        continue;
    }

    const resolved = new URL(reference, staticBase);
    assert(resolved.pathname.startsWith('/portfolio/'), `Asset is not subdirectory-relative: ${reference}`);
    const relativePath = decodeURIComponent(resolved.pathname.slice('/portfolio/'.length));
    const filePath = path.resolve(outputRoot, relativePath);
    assert(filePath.startsWith(`${outputRoot}${path.sep}`), `Asset escapes dist/: ${reference}`);
    assert(fs.existsSync(filePath), `Referenced asset is missing: ${reference}`);

    if (/\.css$/i.test(filePath)) cssCount += 1;
    if (/\.m?js$/i.test(filePath)) jsCount += 1;
    if (/\.(?:png|jpe?g|webp|avif|gif|svg)$/i.test(filePath)) imageCount += 1;
    if (/\.(?:woff2?|ttf|otf)$/i.test(filePath)) fontCount += 1;
}

assert(cssCount > 0, 'No production stylesheet was referenced.');
assert(jsCount > 0, 'No production JavaScript was referenced.');
assert(imageCount >= 2, 'Expected the profile images to be present in the static page.');
assert(fontCount > 0, 'No local font asset was referenced.');
assert(html.includes('@font-face'), 'Bundled font-face CSS was not rendered.');

const imageSources = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
assert(imageSources.some((source) => source.endsWith('/images/profile/profile.png')), 'Profile portrait is missing from static HTML.');
assert(imageSources.every((source) => !source.startsWith('/')), 'Image references must be relative for project Pages paths.');
const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
assert(imageTags.every((tag) => /\balt=["'][^"']+\w[^"']*["']/i.test(tag)), 'Every rendered image needs meaningful alt text.');
assert(!/<form\b/i.test(html), 'Unexpected form requiring a backend was rendered.');

const inPageTargets = [...html.matchAll(/href=["']#([^"']+)["']/g)].map((match) => match[1]);
for (const target of inPageTargets) {
    assert(ids.has(target), `In-page link points to a missing id: ${target}`);
}

const stylesheetPaths = assetRefs
    .filter((reference) => reference.endsWith('.css'))
    .map((reference) => path.resolve(outputRoot, decodeURIComponent(new URL(reference, staticBase).pathname.slice('/portfolio/'.length))));
const stylesheets = stylesheetPaths.map((stylesheetPath) => fs.readFileSync(stylesheetPath, 'utf8')).join('\n');
assert(stylesheets.includes('width<=800px'), 'Tablet responsive styles are missing from the production CSS.');
assert(stylesheets.includes('width<=580px'), 'Mobile responsive styles are missing from the production CSS.');
assert(stylesheets.includes('prefers-reduced-motion:reduce'), 'Reduced-motion styling is missing from the production CSS.');

const javascriptPaths = assetRefs
    .filter((reference) => /\.m?js$/i.test(reference))
    .map((reference) => path.resolve(outputRoot, decodeURIComponent(new URL(reference, staticBase).pathname.slice('/portfolio/'.length))));
const builtJavaScript = javascriptPaths.map((javascriptPath) => fs.readFileSync(javascriptPath, 'utf8')).join('\n');
assert(builtJavaScript.includes('aria-expanded'), 'The built JavaScript is missing mobile menu behavior.');
assert(builtJavaScript.includes('Escape'), 'The built JavaScript is missing the Escape-to-close interaction.');

const allowedRootEntries = new Set(['index.html', 'build', 'images', 'favicon.ico', 'robots.txt', '.nojekyll']);
for (const entry of fs.readdirSync(outputRoot)) {
    assert(allowedRootEntries.has(entry), `Unexpected file or directory in dist/: ${entry}`);
}

const staticFiles = [];
function collectFiles(directory, relative = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        const entryRelative = path.join(relative, entry.name);
        assert(!entry.isSymbolicLink(), `Symbolic link found in dist/: ${entryRelative}`);
        if (entry.isDirectory()) collectFiles(entryPath, entryRelative);
        else staticFiles.push(entryRelative.replaceAll(path.sep, '/'));
    }
}
collectFiles(outputRoot);
for (const file of staticFiles) {
    assert(!/(?:^|\/)(?:\.env[^/]*|vendor|node_modules|storage|database|bootstrap|config|tests|\.git)(?:\/|$)/i.test(file), `Private or Laravel development file in dist/: ${file}`);
    assert(!/\.(?:php|sql|lock|log)$/i.test(file), `Non-static file in dist/: ${file}`);
}

const sourceJs = fs.readFileSync(path.join(projectRoot, 'resources', 'js', 'app.js'), 'utf8');
const listeners = new Map();
const buttonAttributes = new Map([['aria-expanded', 'false']]);
const menuButton = {
    addEventListener: (type, handler) => listeners.set(`button:${type}`, handler),
    getAttribute: (name) => buttonAttributes.get(name),
    setAttribute: (name, value) => buttonAttributes.set(name, value),
    focus: () => { listeners.set('button:focused', true); },
};
const openClasses = new Set();
const linkListeners = new Map();
const navigationElement = {
    classList: {
        add: (name) => openClasses.add(name),
        remove: (name) => openClasses.delete(name),
        toggle: (name, force) => force ? openClasses.add(name) : openClasses.delete(name),
    },
    querySelectorAll: () => [{ addEventListener: (type, handler) => linkListeners.set(type, handler) }],
};
const documentListeners = new Map();
const documentMock = {
    querySelector: (selector) => selector === '.menu-toggle' ? menuButton : selector === '#primary-navigation' ? navigationElement : null,
    addEventListener: (type, handler) => documentListeners.set(type, handler),
};
const windowMock = { matchMedia: () => ({ addEventListener: () => {} }) };
vm.runInNewContext(sourceJs, { document: documentMock, window: windowMock, String });

listeners.get('button:click')();
assert.equal(buttonAttributes.get('aria-expanded'), 'true', 'Menu button did not report its open state.');
assert(openClasses.has('is-open'), 'Mobile navigation did not open.');
linkListeners.get('click')();
assert.equal(buttonAttributes.get('aria-expanded'), 'false', 'Selecting a navigation link did not close the menu.');
assert(!openClasses.has('is-open'), 'Mobile navigation remained open after selecting a link.');
listeners.get('button:click')();
documentListeners.get('keydown')({ key: 'Escape' });
assert.equal(buttonAttributes.get('aria-expanded'), 'false', 'Escape did not close the mobile menu.');
assert.equal(listeners.get('button:focused'), true, 'Escape did not return focus to the menu button.');

console.log(`Static checks passed: ${requiredSections.length} sections, ${navigationTargets.length} navigation links, ${imageCount} images, ${fontCount} font assets, responsive CSS, built JavaScript, subdirectory paths, and mobile menu interactions.`);
