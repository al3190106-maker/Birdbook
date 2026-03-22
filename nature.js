
// Naturboken – kombinerar ALLA naturböcker
// OBS: Måste laddas SIST i index.html, efter alla andra data-filer

window.swedishNature = [
    ...(window.swedishBirds   || []),
    ...(window.swedishTrees   || []),
    ...(window.swedishFish    || []),
    ...(window.swedishAnimals || []),
    ...(window.swedishFungi   || []),
    ...(window.swedishFlowers || [])
];
