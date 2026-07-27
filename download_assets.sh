#!/bin/bash
mkdir -p public/flags
mkdir -p public/players

USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"

echo "Downloading Flags from FlagCDN..."
curl -L -o public/flags/argentina.png "https://flagcdn.com/w320/ar.png"
curl -L -o public/flags/france.png "https://flagcdn.com/w320/fr.png"
curl -L -o public/flags/spain.png "https://flagcdn.com/w320/es.png"
curl -L -o public/flags/england.png "https://flagcdn.com/w320/gb-eng.png"
curl -L -o public/flags/brazil.png "https://flagcdn.com/w320/br.png"
curl -L -o public/flags/italy.png "https://flagcdn.com/w320/it.png"
curl -L -o public/flags/germany.png "https://flagcdn.com/w320/de.png"
curl -L -o public/flags/morocco.png "https://flagcdn.com/w320/ma.png"

echo "Downloading Players from Wikimedia..."
curl -L -H "User-Agent: $USER_AGENT" -o public/players/messi.jpg "https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg"
curl -L -H "User-Agent: $USER_AGENT" -o public/players/mbappe.jpg "https://upload.wikimedia.org/wikipedia/commons/c/cf/Kylian_Mbappe_-_France_v_Norway_-_26_June_2026_%28cropped%29.jpg"
curl -L -H "User-Agent: $USER_AGENT" -o public/players/neymar.jpg "https://upload.wikimedia.org/wikipedia/commons/6/62/Neymar.jpg"
curl -L -H "User-Agent: $USER_AGENT" -o public/players/yamal.jpg "https://upload.wikimedia.org/wikipedia/commons/e/e3/Lamine_Yamal_in_2025.jpg"

echo "Done!"
