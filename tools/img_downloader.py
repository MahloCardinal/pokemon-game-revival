from pathlib import Path
import requests

STATIC = False
SHINY = False

OUTPUT_DIR = Path("pokemon_download")
OUTPUT_DIR.mkdir(exist_ok=True)

for value in range(1, 387):
    if STATIC:
        variants = [("https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/render/{}.png?v=3", "", "png")]
    elif SHINY:
        variants = [
            ("https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/animated/shiny/{}.gif?v=3", "_shiny", "gif"),
            ("https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/animated/shiny/female/{}.gif?v=3", "_f_shiny", "gif")]
    else:
        variants = [
            ("https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/animated/{}.gif?v=3", "", "gif"),
            ("https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/animated/female/{}.gif?v=3", "_f", "gif")]

    for base_url, suffix, extension in variants:
        url = base_url.format(value)
        output_path = OUTPUT_DIR / f"{value}{suffix}.{extension}"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            output_path.write_bytes(response.content)
            print(f"Scaricato: {output_path}")

        except requests.RequestException as error:
            print(f"Errore download {url}: {error}")

        except OSError as error:
            print(f"Errore salvataggio {output_path}: {error}")

print("Cartella di lavoro corrente:", Path.cwd())
print("Cartella dello script:", Path(__file__).parent)
