"""
sync_dioramas.py - Synkar lokala diorama-WebP-bilder mot birds.js

Kors automatiskt av GitHub Actions nar birds.js andras.
Kan ocksa koras manuellt: python scripts/sync_dioramas.py
"""

import re
import io
import os
import sys
import urllib.request
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow saknas. Kor: pip install Pillow")
    sys.exit(1)

REPO_ROOT       = Path(__file__).parent.parent
BIRDS_JS        = REPO_ROOT / "birds.js"
DIORAMA_DIR     = REPO_ROOT / "images" / "dioramas"
WEBP_QUALITY    = 85
REQUEST_TIMEOUT = 20
USER_AGENT      = "NaturbokenBot/1.0 (github.com/al3190106-maker/Birdbook)"

def parse_birds_js(path):
    text = path.read_text(encoding="utf-8")
    blocks = re.findall(r"\{[^{}]+\}", text, re.DOTALL)
    birds = []
    for block in blocks:
        id_m  = re.search(r'"id"\s*:\s*"([^"]+)"', block)
        img_m = re.search(r'"image"\s*:\s*"([^"]+)"', block)
        if id_m and img_m:
            url = img_m.group(1)
            if "naturboken.alt-qq.com" in url:
                birds.append({"id": id_m.group(1), "url": url})
    return birds

def download_and_crop(url, out_path):
    """
    Returnerar: "ok" | "not_found" | "error"
    """
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
            data = resp.read()
        img = Image.open(io.BytesIO(data))
        w, h = img.size
        panel9_y = int(h * 3 / 4)
        diorama = img.crop((0, panel9_y, w, h))
        diorama.save(str(out_path), "WEBP", quality=WEBP_QUALITY, method=6)
        return "ok"
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return "not_found"     # Bilden finns inte pa servern - forvantad situation
        print(f"  HTTP {e.code}: {e}")
        return "error"
    except Exception as e:
        print(f"  FEL: {e}")
        return "error"

def main():
    DIORAMA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Laser {BIRDS_JS.name}...")
    birds = parse_birds_js(BIRDS_JS)
    print(f"Hittade {len(birds)} faglar med alt-qq-bilder")

    missing = [b for b in birds if not (DIORAMA_DIR / f"{b['id']}.webp").exists()]

    if not missing:
        print("Alla dioraman ar uppdaterade - inget att gora!")
        return 0

    print(f"\n{len(missing)} saknade dioraman att kontrollera:")
    downloaded = 0
    not_found = []
    errors = []

    for i, bird in enumerate(missing, 1):
        out_path = DIORAMA_DIR / f"{bird['id']}.webp"
        print(f"[{i}/{len(missing)}] {bird['id']}...", end=" ", flush=True)
        result = download_and_crop(bird["url"], out_path)
        if result == "ok":
            kb = out_path.stat().st_size // 1024
            print(f"OK ({kb} KB)")
            downloaded += 1
        elif result == "not_found":
            print("Saknas pa servern (404)")
            not_found.append(bird["id"])
        else:
            print("MISSLYCKADES (natverksfel)")
            errors.append(bird["id"])

    print(f"\n=== Klart ===")
    print(f"Nedladdade: {downloaded}")
    print(f"Saknas pa servern (404): {len(not_found)}")
    if errors:
        print(f"Fel (natverksfel): {len(errors)} - {', '.join(errors)}")

    total = list(DIORAMA_DIR.glob("*.webp"))
    total_mb = sum(f.stat().st_size for f in total) / (1024 * 1024)
    print(f"Totalt: {len(total)} filer ({total_mb:.1f} MB)")

    # Returnera 1 bara for riktiga natverksfel, inte for 404
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())