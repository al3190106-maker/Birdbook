$f = 'c:\Users\theia\Documents\AI\birdfinder\birds.js'
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# === BULK CATEGORY RENAMES ===
$c = $c.Replace('"type":"Vadarfåglar"', '"type":"Vadare"')
$c = $c.Replace('"type":"Doppingar"', '"type":"Lommar & Doppingar"')
$c = $c.Replace('"type":"Lommar",', '"type":"Lommar & Doppingar",')
$c = $c.Replace('"type":"Måsfåglar"', '"type":"Måsar & Tärnor"')
$c = $c.Replace('"type":"Rallfåglar"', '"type":"Tranor & Rallar"')
$c = $c.Replace('"type":"Falkar"', '"type":"Rovfåglar"')
$c = $c.Replace('"type":"Flugsnappare"', '"type":"Övriga"')
$c = $c.Replace('"type":"Skäggmesar"', '"type":"Mesar"')

# === TÄTTINGAR → TRASTAR ===
$c = $c.Replace('"id":"bluethroat", "type":"Tättingar"', '"id":"bluethroat", "type":"Trastar"')
$c = $c.Replace('"id":"whinchat", "type":"Tättingar"', '"id":"whinchat", "type":"Trastar"')
$c = $c.Replace('"id":"common_redstart", "type":"Tättingar"', '"id":"common_redstart", "type":"Trastar"')
$c = $c.Replace('"id":"black_redstart", "type":"Tättingar"', '"id":"black_redstart", "type":"Trastar"')
$c = $c.Replace('"id":"northern_wheatear", "type":"Tättingar"', '"id":"northern_wheatear", "type":"Trastar"')
$c = $c.Replace('"id":"thrush_nightingale", "type":"Tättingar"', '"id":"thrush_nightingale", "type":"Trastar"')

# === TÄTTINGAR → HÄGRAR ===
$c = $c.Replace('"id":"white_stork", "type":"Tättingar"', '"id":"white_stork", "type":"Hägrar"')
$c = $c.Replace('"id":"eurasian_bittern", "type":"Tättingar"', '"id":"eurasian_bittern", "type":"Hägrar"')

# === ALL REMAINING TÄTTINGAR → ÖVRIGA ===
$c = $c.Replace('"type":"Tättingar"', '"type":"Övriga"')

# === MISPLACEMENT FIXES ===
$c = $c.Replace('"id":"rock_pipit", "type":"Vadare"', '"id":"rock_pipit", "type":"Övriga"')
$c = $c.Replace('"id":"little_tern", "type":"Vadare"', '"id":"little_tern", "type":"Måsar & Tärnor"')
$c = $c.Replace('"id":"red_backed_shrike", "type":"Kråkfåglar"', '"id":"red_backed_shrike", "type":"Övriga"')
$c = $c.Replace('"id":"great_grey_shrike", "type":"Kråkfåglar"', '"id":"great_grey_shrike", "type":"Övriga"')
$c = $c.Replace('"id":"lesser_grey_shrike", "type":"Kråkfåglar"', '"id":"lesser_grey_shrike", "type":"Övriga"')

[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done! All category renames complete."
