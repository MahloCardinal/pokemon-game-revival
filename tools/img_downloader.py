from pathlib import Path
import requests

STATIC = False

if STATIC:
    BASE_URL = "https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/render/{}.png?v=3"
    OUTPUT_DIR = Path("pokemon_static")
    EXTENSION = "png"
else:
    BASE_URL = "https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/animated/{}.gif?v=3"
    OUTPUT_DIR = Path("pokemon_gif")
    EXTENSION = "gif"

OUTPUT_DIR.mkdir(exist_ok=True)

for value in range(301, 302):
    url = BASE_URL.format(value)
    output_path = OUTPUT_DIR / f"{value}.{EXTENSION}"

    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()

        output_path.write_bytes(response.content)
        print(f"Scaricato: {output_path}")

    except requests.RequestException as error:
        print(f"Errore download con {value}: {error}")

    except OSError as error:
        print(f"Errore salvataggio con {value}: {error}")

print("Cartella di lavoro corrente:", Path.cwd())
print("Cartella dello script:", Path(__file__).parent)
