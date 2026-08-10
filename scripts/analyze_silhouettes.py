"""Analyze bird silhouette pixel widths from a PNG image."""
import sys
from pathlib import Path

# Try using PIL/Pillow
try:
    from PIL import Image
except ImportError:
    print("Pillow not available, trying raw PNG parsing...")
    sys.exit(1)

img_path = r"C:\Users\theia\.gemini\antigravity\brain\8493e581-4486-4878-802c-cf9d25d862ba\rovfaglar_siluett_v3_1786387211439.png"
img = Image.open(img_path).convert("RGB")
w, h = img.size
pixels = img.load()

print(f"Image dimensions: {w} x {h}")

bird_zone_top = int(h * 0.2)
bird_zone_bottom = int(h * 0.75)

print(f"Scanning rows {bird_zone_top} to {bird_zone_bottom}")

col_has_dark = [False] * w
for x in range(w):
    for y in range(bird_zone_top, bird_zone_bottom):
        r, g, b = pixels[x, y]
        if r < 80 and g < 80 and b < 80:
            col_has_dark[x] = True
            break

# Find contiguous dark column groups
birds = []
in_bird = False
start_x = 0
for x in range(w):
    if col_has_dark[x] and not in_bird:
        in_bird = True
        start_x = x
    elif not col_has_dark[x] and in_bird:
        in_bird = False
        width = x - start_x
        if width > 15:
            birds.append({"start": start_x, "end": x - 1, "width": width})
if in_bird:
    width = w - start_x
    if width > 15:
        birds.append({"start": start_x, "end": w - 1, "width": width})

labels = ["HÖK", "FALK", "KÄRRHÖK", "VRÅK", "GLADA", "ÖRN"]
target_cm = [60, 75, 115, 120, 150, 230]

print(f"\nFound {len(birds)} bird silhouettes:\n")
for i, b in enumerate(birds):
    label = labels[i] if i < len(labels) else "?"
    print(f"  {label}: {b['width']}px  (x: {b['start']}-{b['end']})")

print("\n--- SCALE ANALYSIS ---")
if len(birds) >= 2:
    ref_px = birds[0]["width"]
    ref_cm = target_cm[0]
    px_per_cm = ref_px / ref_cm
    print(f"Reference (HÖK): {px_per_cm:.2f} px/cm\n")
    
    for i, b in enumerate(birds):
        if i >= len(target_cm):
            break
        expected = target_cm[i] * px_per_cm
        ratio = b["width"] / expected
        pct = (ratio - 1) * 100
        status = "✅" if 0.85 < ratio < 1.15 else "❌"
        print(f"  {status} {labels[i]}: actual={b['width']}px, expected={expected:.0f}px, off by {pct:+.0f}%")
