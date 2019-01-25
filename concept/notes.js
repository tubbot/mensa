const NOTES = {};

NOTES.NUTS = {
  'Erdnüsse': '🥜 Peanut',
  'Sesam': 'Sesame',
  'Mandeln': 'Almond',
  'Walnuss': 'Walnut',
  'Kaschunuss': 'Cashew',
  'Haselnuss': 'Haselnut',
  'Pistazie': 'Pistachio',
};

NOTES.ANIMALS = {
  'Milch und Milchprodukte (inkl. Laktose)': '🥛 Laktose',
  'Eier': 'Egg',
  'Fisch': 'Fish',
  'Weichtiere': 'Clam',
  'Krebstiere': 'Crab',
  'Schweinefleisch bzw. mit Gelatine vom Schwein': 'Pork',
  'mit zum Teil fein zerkleinertem Fleischanteil': 'Mince',
};

NOTES.GRAINS = {
  'Weizen': '🌾 Wheat',
  'Hefe': 'Yeast',
  'Roggen': 'Rye',
  'Hafer': 'Oat',
  'Dinkel': 'Spelt',
  'Gerste': 'Barley',
};

NOTES.STUFF = {
  'Alkohol': '🍷 Alcohol',
  'koffeinhaltig': 'Caffeine',
  'Farbstoff': 'Colours',
  'Süßungsmittel': 'Sweeteners',
  'Nitritpökelsalz': 'Nitrates',
  'Schwefeldioxid und Sulfide': 'SO₂ & Sulfites',
  'MSC': 'MSG',
  'Phosphat': 'Phosphates',
  'geschwärzt': 'Smoked',
  'konserviert': 'Preserved',
};


NOTES.PLANTS = {
  'Soja': '🌿 Soy',
  'Lupine': 'Lupin',
  'Sellerie': 'Celery',
  'Senf': 'Mustard',
};

NOTES.categories = Object.keys(NOTES);

NOTES.DIETS = {
  'none': 'None',
  'vegetarisch': 'Vegetarian',
  'vegan': 'Vegan',
  'bio': 'Organic',
  'grün (Ampel)': `"Greenlight"`,
};

const FADS = [
  'Antioxidationsmittel',
  'Klimaessen',
  'gelb (Ampel)',
  'rot (Ampel)',
];

module.exports = NOTES;
