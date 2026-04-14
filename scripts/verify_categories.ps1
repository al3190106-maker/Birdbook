$c = [System.IO.File]::ReadAllText('c:\Users\theia\Documents\AI\birdfinder\birds.js', [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($c, '"type":\s*"([^"]+)"')
$types = @{}
foreach ($m in $matches) {
    $t = $m.Groups[1].Value
    if ($types.ContainsKey($t)) { $types[$t]++ } else { $types[$t] = 1 }
}
$types.GetEnumerator() | Sort-Object Name | ForEach-Object { '{0,-25} {1}' -f $_.Name, $_.Value }
Write-Host ""
Write-Host "Total categories: $($types.Count)"
