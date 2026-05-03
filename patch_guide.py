
with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

old = '<i class=\\"fa-solid fa-check\\"></i> Hittad</div>'
new = '<i class=\\"fa-solid fa-check\\"></i></div>'

if old in content:
    content = content.replace(old, new, 1)
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK')
else:
    print('NOT FOUND')
    idx = content.find('fa-check')
    print(repr(content[idx-30:idx+80]))
