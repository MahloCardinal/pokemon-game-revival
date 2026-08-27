from pathlib import Path

cartella = Path(__file__).parent

for file in cartella.glob("*_gm_optimized.webp"):
    nuovo_nome = file.name.replace("_gm_optimized.webp", ".webp")
    nuova_destinazione = file.with_name(nuovo_nome)

    file.rename(nuova_destinazione)
    print(f"{file.name} -> {nuovo_nome}")

print("Rinominazione completata.")