
// Växtboken – kombinerar Swedish Wildflowers + Swedish Trees
// Byggd automatiskt från flowers.js och trees.js
// OBS: Måste laddas EFTER flowers.js och trees.js i index.html

window.swedishPlants = [
    ...(window.swedishFlowers || []),
    ...(window.swedishTrees || [])
];
