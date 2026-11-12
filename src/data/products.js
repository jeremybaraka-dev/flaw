// Catalogue pulled from flawenforcement.shop (Nov 2026).
// Plain ES module: used by the site AND by the payment API (server re-prices the cart from here).

// image "base" paths; the real files are /products/<name>-<width>.avif|webp (see src/img.js)
const img = (name) => `/products/${name.replace(/[^a-z0-9_-]+/gi, '-')}`;
export const SIZES = ['S', 'M', 'L', 'XL'];

const raw = [
  {
    handle: 'tribal-zip-up', title: 'Tribal Zip-Up', price: 6500, category: 'outerwear',
    hook: 'Your roots. Your rules.',
    body: "You weren't made to blend in. Tribal graphics down the sleeves, FE on the chest and a whole lot of character. Zip it up and stand on business.",
    specs: { Fit: 'Relaxed, slightly oversized silhouette.', Material: 'Heavyweight cotton.', Construction: 'Full-length front zip, adjustable drawstring hood, ribbed cuffs and hem, and printed sleeve graphics.' },
    variants: [{ name: 'Black', images: ['TZU', 'TZUB'] }],
  },
  {
    handle: 'racer-jacket', title: 'Racer Jacket', price: 10500, category: 'outerwear',
    hook: 'No passengers. Take the wheel.',
    body: "Racing DNA with Flaw Enforcement all over it. The colour hits, the panels speak, and the whole piece carries that need-for-speed energy. You're not here to ride shotgun.",
    specs: { Fit: 'Structured motorsport-inspired fit.', Material: 'Main: 100% polyurethane. Lining: 100% polyester.', Construction: 'Full-length zip, contrast panels, stand collar and racing-inspired graphics and embroidery.' },
    variants: [{ name: 'V1 / Teal', images: ['frbf', 'frbb'] }, { name: 'V2 / Black', images: ['frb', 'frb_2'] }],
  },
  {
    handle: 'irezumi-demi-crop', title: 'Irezumi', price: 6000, category: 'tops',
    hook: 'Every detail tells a story.',
    body: "Tattoo-inspired sleeves, layered artwork and FE across the chest. There's a lot going on, and that's exactly the point. No part of you was made to be simple.",
    specs: { Fit: 'Fitted demi-crop silhouette.', Material: 'Stretch jersey, polyester-elastane blend.', Construction: 'Long sleeves, cropped body, crew neck and detailed printed artwork across the sleeves and shoulders.' },
    variants: [{ name: 'Dragon', images: ['dragon_irezumi'] }, { name: 'Akuma', images: ['irezumi_1'] }],
  },
  {
    handle: 'camo-flawge-pants', title: 'Camo-Flawge Pants', price: 6000, category: 'bottoms',
    hook: 'Hidden in plain sight.',
    body: 'Woodland camo cargos with the FE emblem stamped loud across the front. Built to disappear into the background, then refuse to.',
    specs: { Fit: 'Relaxed, wide-leg cargo fit.', Material: 'Cotton ripstop.', Construction: 'Cargo pockets, belt loops and front emblem print.' },
    variants: [{ name: 'Woodland', images: ['Laer3', 'Layer4'] }],
  },
  {
    handle: 'spawn-jersey', title: 'Flaw Jersey', price: 6000, category: 'tops',
    hook: 'Built different from day one.',
    body: "The 47 stamped on the back. This is not your average match-day jersey. Whether you're on the pitch or outside, the assignment stays the same.",
    specs: { Fit: 'Relaxed athletic fit.', Material: 'Polyester sports mesh.', Construction: 'Long sleeves, breathable mesh body, bound neckline and printed front, back and sleeve graphics.' },
    variants: [
      { name: 'Spawn', images: ['BLACKMESH', 'BLACK_MESH'] },
      { name: 'Sharingan', images: ['WHITEMESH', 'WHITE_MESH_5cf3275b-fdfd-4ca6-9b5b-f0550899e6e4'] },
      { name: 'Slayer', images: ['FLAWHEARTRED'] },
      { name: 'Lunar', images: ['BLUEMESH'] },
    ],
  },
  {
    handle: 'ralph-flaw-ren', title: 'Ralph Flaw-Ren', price: 7500, category: 'tops',
    hook: 'Preppy never looked like this.',
    body: "Rugby-inspired stripes with FLAW branding and the 47 front and centre. A sharp elongated leather collar. A little old-school, a little rebellious, completely unapologetic. This one's not following anybody's dress code.",
    specs: { Fit: 'Boxy silhouette that works across a range of builds; effortlessly oversized without losing shape.', Material: 'Leather collar and cotton jersey.', Construction: 'Short sleeves, striped body, polo-style collar and prominent front-and-back graphics.' },
    variants: [{ name: 'Blue Stripe', images: ['rf', 'rfb'] }],
  },
  {
    handle: 'void-raglan', title: 'Raglan Crop', price: 4000, category: 'tops',
    hook: 'Less talk. More presence.',
    body: 'Contrast sleeves on a clean base. No need to do the most when the details speak for themselves. Throw it on and let the fit handle the introduction.',
    specs: { Fit: 'Cropped, close-to-body silhouette.', Material: 'Cotton jersey.', Construction: 'Contrasting raglan sleeves, notched neckline, fitted hem and front FE graphic.' },
    variants: [
      { name: 'Void', images: ['VRB', 'VRBF'] },
      { name: 'Saint', images: ['SR', 'SRB'] },
      { name: 'Rage', images: ['RRF', 'RRB'] },
      { name: 'Slime', images: ['SSRB', 'SSR'] },
    ],
  },
  {
    handle: 'distortion-zip-up', title: 'Distortion Zip Up', price: 6500, category: 'outerwear',
    hook: 'Let them look twice.',
    body: "FLAW across the chest. 47 on the back. This one's for those who were never going to fit the mould anyway.",
    specs: { Fit: 'Relaxed streetwear fit, with room for layering.', Material: 'Heavyweight cotton.', Construction: 'Full zip, hood, ribbed finishing and bold front-and-back graphics.' },
    variants: [{ name: 'Black', images: ['dstrtfront', 'dstrtback'] }],
  },
  {
    handle: 'broken-angel', title: 'Broken Angel', price: 5500, category: 'outerwear',
    hook: 'Even angels crack.',
    body: 'A fallen figure cast across heavyweight fleece. Wings clipped, head high. Proof that falling was part of the design.',
    specs: { Fit: 'Relaxed pullover fit.', Material: 'Heavyweight cotton fleece.', Construction: 'Pullover hood, kangaroo pocket, ribbed cuffs and hem, large printed graphic.' },
    variants: [
      { name: 'Ash', images: ['Layer0copy', 'Layer0'] },
      { name: 'Charcoal', images: ['CharcoalHoodieFrontandBackMockupcopy2', 'CharcoalHoodieFrontandBackMockupcopy'] },
    ],
  },
  {
    handle: 'broken-angel-sweats', title: 'Broken Angel Sweats', price: 5000, category: 'bottoms',
    hook: 'Cracked on purpose.',
    body: 'Wide-leg sweats with cracked 47 and FLAW appliqué running down the leg. The pair in half the lineup photos for a reason.',
    specs: { Fit: 'Wide, stacked leg.', Material: 'Heavyweight cotton fleece.', Construction: 'Elasticated drawstring waist, cracked-effect appliqué graphics.' },
    variants: [{ name: 'Ash', images: ['Layer30'] }, { name: 'Charcoal', images: ['Layer31'] }],
  },
  {
    handle: 'tribal-zip-polo', title: 'Zip Polo', price: 5500, category: 'tops',
    hook: 'Earth tones. Uncommon energy.',
    body: "Tribal detailing on a boxy zip polo. It's the coordinated look without the forced effort. Different from the usual.",
    specs: { Fit: 'Relaxed short-sleeve boxy top.', Material: 'Cotton pique.', Construction: 'Short-sleeve boxy polo silhouette, front zip opening, subtle crop and tonal FE graphics.' },
    variants: [{ name: 'Brown', images: ['Screenshot_2026-09-24_232433', 'FLAW_POLO'] }, { name: 'V2 / Black', images: ['tzb', 'tzbb'] }],
  },
  {
    handle: 'flaw-hearts-capri-set', title: 'Capri Set', price: 7000, category: 'sets',
    hook: 'Love your flaws. Wear them too.',
    body: "A matching set with red accents. The top and bottoms do their thing together and individually, so you don't have to overthink the fit. Put it on and own it.",
    specs: { Fit: 'Close-fitting cropped top with fitted capri-length bottoms.', Material: 'Stretch jersey, elastane blend.', Construction: 'Two-piece matching set, long sleeves, cropped top, elasticated waistband, embroidered graphics and a functional drawstring.' },
    variants: [{ name: 'Flaw Hearts', images: ['exe', 'exe-bl'] }, { name: 'Akatsuki', images: ['exe-w', 'exe-b'] }],
  },
  {
    handle: 'flaw-emblem-t-shirt', title: 'Flaw Emblem T-Shirt', price: 2500, category: 'tees',
    hook: 'One emblem. Eight alibis.',
    body: 'The FE emblem, front and centre, in every colour it has been caught in. Boxy, heavy, and impossible to mistake.',
    specs: { Fit: 'Boxy oversized fit.', Material: 'Heavyweight cotton.', Construction: 'Crew neck, dropped shoulders and printed chest emblem.' },
    variants: [
      { name: 'Main / Black', images: ['MAINFLAWBLACK', 'BLACK_BACK'] },
      { name: 'Main / White', images: ['MAINFLAW'] },
      { name: 'Silver', images: ['SILVERFLAWBACK', 'BLACK_BACK'] },
      { name: 'Super', images: ['SUPERFLAWBLACK', 'BLACK_BACK'] },
      { name: 'Y/R', images: ['Y_RFLAWBLACK', 'BLACK_BACK'] },
      { name: 'Gold', images: ['GOLDFLAWBLACK', 'BLACK_BACK'] },
      { name: 'B/Y', images: ['B_YFLAWBLACK', 'BLACK_BACK'] },
      { name: 'Bat', images: ['FLAWBAT', 'BLACK_BACK'] },
    ],
  },
  {
    handle: 'flaw-gothic-font', title: 'Flaw Gothic Font', price: 2500, category: 'tees',
    hook: 'Old script. New offence.',
    body: 'FLAW in blackletter, outlined in red and blue. Reads like a warning, wears like a tee.',
    specs: { Fit: 'Boxy oversized fit.', Material: 'Heavyweight cotton.', Construction: 'Crew neck, dropped shoulders and printed chest graphic.' },
    variants: [{ name: 'Black', images: ['FLAWBLACK', 'BLACK_BACK'] }],
  },
  {
    handle: 'flaw-distortion-t-shirt', title: 'Flaw Distortion T-Shirt', price: 2500, category: 'tees',
    hook: 'Slightly out of line.',
    body: 'Collegiate FLAW lettering, deliberately distorted. The everyday tee for people who were never going to fit the mould.',
    specs: { Fit: 'Boxy oversized fit.', Material: 'Heavyweight cotton.', Construction: 'Crew neck, dropped shoulders and printed chest graphic.' },
    variants: [{ name: 'Black', images: ['FLAWMOTIONBLACK', 'BLACK_BACK'] }],
  },
];

export const products = raw.map((p, i) => ({
  ...p,
  exhibit: String(i + 1).padStart(2, '0'),
  sizes: SIZES,
  variants: p.variants.map((v) => ({ ...v, images: v.images.map(img) })),
  image: img(p.variants[0].images[0]),
  alt: img(p.variants[0].images[1] || (p.variants[1] ? p.variants[1].images[0] : p.variants[0].images[0])),
}));

export const byHandle = Object.fromEntries(products.map((p) => [p.handle, p]));

export const categories = [
  ['all', 'All exhibits'],
  ['outerwear', 'Outerwear'],
  ['tops', 'Tops'],
  ['tees', 'Tees'],
  ['bottoms', 'Bottoms'],
  ['sets', 'Sets'],
];
