# BirdFinder App Recreation Prompts

Use the following prompts to recreate the BirdFinder application from scratch.

## Prompt 1: Project Setup & Data
"Create a new web project called 'BirdFinder'.
1. Create an `index.html` file with a standard HTML5 skeleton. Include FontAwesome via CDN.
2. Create a `birds.js` file containing a global array `window.swedishBirds` with the following bird data (Common Blackbird, Chaffinch, Willow Warbler, Great Tit, European Robin, Blue Tit, Hooded Crow, Eurasian Magpie, House Sparrow, Eurasian Tree Sparrow, Common Wood Pigeon, Eurasian Blue Tit, Goldcrest, Barn Swallow, Common Swift, Great Spotted Woodpecker, Eurasian Jay, Yellowhammer, Eurasian Nuthatch, Eurasian Bullfinch, European Greenfinch, White Wagtail, Eurasian Wren, Common Starling, Song Thrush, Eurasian Blackcap, Common Chiffchaff).
3. In `index.html`, create a basic structure with a Header, a Main container, and sections for 'Stats', 'View Tabs' (My Log/Bird Guide), 'Sightings List', and 'Bird Guide Grid'. Add a Modal for adding new sightings."

## Prompt 2: Styling
"Create a `style.css` file to style the application.
1. Use a color palette of Forest Green (`#2E5D4B`), Dark Sea Green (`#8FBC8F`), and Earthy Tan (`#D4A373`).
2. Style the cards with a white background, rounded corners (12px), and a subtle shadow.
3. Make the layout responsive using CSS filters and Flexbox.
4. Style the 'Add Sighting' button as a prominent action card.
5. Create styles for the Modal and Form elements."

## Prompt 3: Core Logic & functionality
"Create an `app.js` file to handle the application logic.
1. Initialize a state object to track `sightings` (array), `yearFilter` (current year), and `view`.
2. Implement `loadSightings()` and `saveSightings()` using `localStorage` ('birdfinder_sightings').
3. Create `renderApp()` to update the UI based on state.
4. Implement `renderSightingsList()` to show user sightings, grouped by bird ID. Show a count badge if multiple sightings exist for the same bird.
5. Implement `renderGuideList()` to show all birds from `window.swedishBirds`.
6. Add event listeners for the tabs to switch views.
7. Add logic for the 'Add Sighting' form, including an autocomplete for bird names."

## Prompt 4: "Ghost Bird" Persistence Fix
"Update `app.js` to include a specific fix for data persistence on load.
1. In the `init()` function, add a 'Ghost Bird' maneuver:
   - Wait 500ms after load.
   - Creating a temporary 'Ghost' sighting (id: 'SYSTEM_INIT_BIRD').
   - Push it to state and save.
   - Immediately filter it out of state and save again.
2. In `renderSightingsList`, ensure any sighting with id 'SYSTEM_INIT_BIRD' is filtered out from the display, just in case."

## Prompt 5: Custom Image Handling
"Update `app.js` to allow users to upload custom images for birds.
1. Add a hidden file input to `index.html`.
2. Add an 'Edit Image' button to bird cards in the Guide view.
3. When clicked, trigger the file input.
4. Read the file as Base64 and save it to `localStorage` with a key like `custom_img_{birdId}`.
5. Update `getBirdImageSrc(birdId)` to check `localStorage` for a custom image before falling back to the default `images/{birdId}.jpg`."
