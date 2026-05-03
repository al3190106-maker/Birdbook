
with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the renderGuideList function body – specifically the part after innerHTML is cleared
# and before birdList.forEach – inject a Set of caught bird IDs

old_block = "    elements.guideList.innerHTML = '';\n\n    const rarityLevels"
new_block = """    elements.guideList.innerHTML = '';

    // Build set of all-time caught species (all subjects, no year filter)
    const caughtIds = new Set(
        state.sightings
            .filter(s => s.id !== 'SYSTEM_INIT_BIRD' && s.birdId)
            .map(s => s.birdId)
    );

    const rarityLevels"""

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    print("Step 1 OK – caughtIds injected")
else:
    print("Step 1 FAILED – target not found")
    import sys; sys.exit(1)

# Now add caught class + badge to each card, replacing the card.className line
old_class = "        card.className = 'bird-card';\n        // Make the whole card clickable for details\n        card.style.cursor = 'pointer';"
new_class = """        const isCaught = caughtIds.has(bird.id);
        card.className = 'bird-card' + (isCaught ? ' is-caught' : '');
        // Make the whole card clickable for details
        card.style.cursor = 'pointer';"""

if old_class in content:
    content = content.replace(old_class, new_class, 1)
    print("Step 2 OK – is-caught class added")
else:
    print("Step 2 FAILED – target not found")
    import sys; sys.exit(1)

# Add the caught-badge HTML inside the bird-image-container (right before the closing </div>)
# The badge goes after the bird-image-name div
old_img_name = '                <div class="bird-image-name">${bird.nameSv}</div>\n            </div>'
new_img_name = """                <div class="bird-image-name">${bird.nameSv}</div>
                ${isCaught ? '<div class=\\"caught-badge\\"><i class=\\"fa-solid fa-check\\"></i> Hittad</div>' : ''}
            </div>"""

if old_img_name in content:
    content = content.replace(old_img_name, new_img_name, 1)
    print("Step 3 OK – badge HTML added")
else:
    print("Step 3 FAILED – target not found")
    # Show what we're looking for
    idx = content.find('bird-image-name')
    print("Near bird-image-name:", repr(content[idx-20:idx+120]))
    import sys; sys.exit(1)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("All done – app.js written successfully")
