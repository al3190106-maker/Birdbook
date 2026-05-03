
import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

patterns = ['quick.add', 'sighting-count', 'count-badge', '+1']
for pat in patterns:
    matches = [m.start() for m in re.finditer(re.escape(pat), content)]
    for pos in matches[:5]:
        print(f"--- [{pat}] at {pos} ---")
        print(repr(content[max(0,pos-40):pos+100]))
        print()
