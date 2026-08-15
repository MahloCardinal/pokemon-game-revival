import { assetPath, escapeHtml, getItemDisplayImage, renderImage } from "../client/asset-helpers.js";
import { sceneShell } from "../client/render-utils.js";
import { itemDisplayDescription, ItemCategory, resolveInventoryItems } from "../data/items.js";
import { isSingleCopyInventoryItem } from "./inventory-helpers.js";
import { state } from "../client/game-state.js";

function styleButton(label, className) {
  return '<button type="button" class="style-proposals-button ' + escapeHtml(className) + '">' + escapeHtml(label) + '</button>';
}

function stylePanel(title, text, className) {
  return [
    '<div class="style-proposals-panel ' + escapeHtml(className) + '">',
    '  <span class="style-proposals-panel-kicker">Panel</span>',
    '  <h4>' + escapeHtml(title) + '</h4>',
    '  <p>' + escapeHtml(text) + '</p>',
    '</div>'
  ].join("");
}

function styleZoneButton(title, imageFile, className) {
  return [
    '<button type="button" class="style-proposals-zone-button ' + escapeHtml(className) + '">',
    '  <span class="style-proposals-zone-title">' + escapeHtml(title) + '</span>',
    '  <span class="style-proposals-zone-media">',
    renderImage(assetPath("img_zone", imageFile), title, "style-proposals-zone-image"),
    '  </span>',
    '</button>'
  ].join("");
}

function renderFontShowcase() {
  var fonts = [
    ["Game", "Lucida Console", "style-proposals-font-game"],
    ["Mono", "Courier New", "style-proposals-font-mono"],
    ["Sans", "Trebuchet MS", "style-proposals-font-sans"],
    ["Serif", "Georgia", "style-proposals-font-serif"],
    ["Tech", "Verdana", "style-proposals-font-tech"],
    ["Arial", "Arial", "style-proposals-font-arial"],
    ["Tahoma", "Tahoma", "style-proposals-font-tahoma"],
    ["Impact", "Impact", "style-proposals-font-impact"],
    ["Times", "Times New Roman", "style-proposals-font-times"],
    ["Console", "Consolas", "style-proposals-font-consolas"]
  ];

  return [
    '<section class="style-proposals-font-panel" aria-labelledby="style-proposals-font-title">',
    '  <div class="style-proposals-font-heading">',
    '    <span class="style-proposals-eyebrow">Tipografia</span>',
    '    <h3 id="style-proposals-font-title">Font</h3>',
    '    <p>Confronto rapido di famiglie tipografiche possibili per titoli, bottoni e testi descrittivi.</p>',
    '  </div>',
    '  <div class="style-proposals-font-grid">',
    fonts.map(function (font) {
      return [
        '    <article class="style-proposals-font-sample ' + escapeHtml(font[2]) + '">',
        '      <span>' + escapeHtml(font[0]) + '</span>',
        '      <strong>' + escapeHtml(font[1]) + '</strong>',
        '      <p>Zona cattura - Conferma azione</p>',
        '      <button type="button">Bottone</button>',
        '    </article>'
      ].join("");
    }).join(""),
    '  </div>',
    '</section>'
  ].join("");
}

function stylePopup(className) {
  return [
    '<div class="style-proposals-popup-scene ' + escapeHtml(className) + '">',
    '  <div class="style-proposals-popup-backdrop"></div>',
    '  <div class="style-proposals-popup-dialog">',
    '    <span class="style-proposals-popup-kicker">Popup</span>',
    '    <h4>Conferma azione</h4>',
    '    <p>Procedere con questa operazione?</p>',
    '    <div class="style-proposals-popup-actions">',
    '      <button type="button" class="style-proposals-popup-button style-proposals-popup-yes">Si</button>',
    '      <button type="button" class="style-proposals-popup-button style-proposals-popup-no">No</button>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join("");
}

function styleCard(number, title, text, cardClass, buttons, zoneButton, panel, popup) {
  return [
    '<article class="style-proposals-card ' + escapeHtml(cardClass) + '">',
    '  <div class="style-proposals-card-header">',
    '    <span>' + escapeHtml(number) + '</span>',
    '    <h3>' + escapeHtml(title) + '</h3>',
    '  </div>',
    '  <p>' + escapeHtml(text) + '</p>',
    '  <div class="style-proposals-button-row">',
    buttons.join(""),
    '  </div>',
    zoneButton,
    panel,
    popup || "",
    '</article>'
  ].join("");
}

function renderStyleZaino() {
  var inventorySections = [
    { key: "tools", title: "Strumenti" },
    { key: "held", title: "Strumenti assegnabili" },
    { key: "battle", title: "Strumenti battaglia" },
    { key: "balls", title: "Poké Ball" },
    { key: "mt", title: "MT" },
    { key: "berries", title: "Bacche" }
  ];
  var inventoryItems = resolveInventoryItems(state.inventory);

  function getInventorySectionKey(item) {
    var category = item.category || "";
    if (category === ItemCategory.Ball) { return "balls"; }
    if (category === ItemCategory.TM) { return "mt"; }
    if (category === ItemCategory.Vitamin) { return "tools"; }
    if (category === ItemCategory.HeldItem) { return "held"; }
    if (category === ItemCategory.Berry) { return "berries"; }
    if (category === ItemCategory.BattleItem) { return "battle"; }
    return "tools";
  }

  function renderInventoryItem(item) {
    var imageSrc = getItemDisplayImage(item);
    var itemImageClass = item.category === ItemCategory.TM ? "style-zaino-item-image style-zaino-item-image-mt" : "style-zaino-item-image";
    var imageMarkup = imageSrc
      ? renderImage(imageSrc, item.name, itemImageClass)
      : '<span class="style-zaino-item-image style-zaino-item-image-empty"></span>';
    var availabilityMarkup = isSingleCopyInventoryItem(item) ? "" : '<div class="style-zaino-item-availability"><span class="style-zaino-item-quantity">x' + escapeHtml(item.quantity) + "</span></div>";

    return [
      '<article class="style-zaino-item-card">',
      '  <div class="style-zaino-item-media">',
      imageMarkup,
      availabilityMarkup,
      "  </div>",
      '  <div class="style-zaino-item-copy">',
      '    <div class="style-zaino-item-heading"><h3 class="style-zaino-item-name">' + escapeHtml(item.name) + "</h3></div>",
      '    <p class="style-zaino-item-description">' + escapeHtml(itemDisplayDescription(item)) + "</p>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderInventorySection(section) {
    var sectionItems = inventoryItems.filter(function (item) {
      return getInventorySectionKey(item) === section.key;
    });
    if (!sectionItems.length) return "";
    var sectionContent = sectionItems.map(renderInventoryItem).join("");

    return [
      '<section class="style-zaino-pocket">',
      '  <h3 class="style-zaino-pocket-title">' + escapeHtml(section.title) + "</h3>",
      '  <div class="style-zaino-pocket-scroll">',
      '    <div class="style-zaino-item-grid">' + sectionContent + "</div>",
      "  </div>",
      "</section>"
    ].join("");
  }

  var zainoHtml = '<section class="style-zaino-panel"><div class="style-zaino-stack">' +
    inventorySections.map(renderInventorySection).join("") +
    '</div></section>';

  return [
    '<section class="style-zaino-section" aria-labelledby="style-zaino-title">',
    '  <div class="style-proposals-heading">',
    '    <span class="style-proposals-eyebrow">Zaino scheda allenatore</span>',
    '    <h3 id="style-zaino-title">Zaino</h3>',
    '    <p>Anteprima dello zaino in scheda allenatore. Oggetti e impaginazione rispecchiano la schermata /team.</p>',
    '  </div>',
    zainoHtml,
    '</section>'
  ].join("");
}

export function renderStylesScene() {
  var content = [
    '<section class="style-proposals" aria-labelledby="style-proposals-title">',
    '  <div class="style-proposals-heading">',
    '    <span class="style-proposals-eyebrow">Proposte UI</span>',
    '    <h2 id="style-proposals-title">Stili</h2>',
    '    <p>Direzioni visive alternative per aggiornare bottoni, card zona, panel e popup dell\'applicazione. Le varianti includono bordi outset, doppi, tratteggiati, glow, cornici tagliate e mattoncini.</p>',
    '  </div>',
    renderFontShowcase(),
    '  <div class="style-proposals-grid">',
    styleCard(
      "01",
      "Cartuccia",
      "Angoli netti, bordo outset e ombra corta per un look da interfaccia fisica.",
      "style-proposals-card-cartridge",
      [
        styleButton("Conferma", "style-proposals-button-cartridge"),
        styleButton("Dettagli", "style-proposals-button-cartridge-alt")
      ],
      styleZoneButton("Bosco Smeraldo", "bosco_smeraldo_bottone.webp", "style-proposals-zone-cartridge"),
      stylePanel("Scheda compatta", "Cornice doppia e superficie chiara per contenuti ricorrenti.", "style-proposals-panel-cartridge"),
      stylePopup("style-proposals-popup-cartridge")
    ),
    styleCard(
      "02",
      "Palestra",
      "Accenti energetici, gradienti caldi e bordo luminoso per azioni importanti.",
      "style-proposals-card-gym",
      [
        styleButton("Sfida", "style-proposals-button-gym"),
        styleButton("Borsa", "style-proposals-button-gym-alt")
      ],
      styleZoneButton("Lega Kanto", "lega_kanto_bottone.webp", "style-proposals-zone-gym"),
      stylePanel("Obiettivo", "Panel evidenziato per missioni, premi e riepiloghi palestra.", "style-proposals-panel-gym"),
      stylePopup("style-proposals-popup-gym")
    ),
    styleCard(
      "03",
      "Notturno",
      "Toni scuri, bagliori morbidi e contrasto alto per modali e battaglie.",
      "style-proposals-card-night",
      [
        styleButton("Continua", "style-proposals-button-night"),
        styleButton("Annulla", "style-proposals-button-night-alt")
      ],
      styleZoneButton("Torre Fantasma", "torre_fantasma_bottone.webp", "style-proposals-zone-night"),
      stylePanel("Log evento", "Contenitore scuro pensato per messaggi e cronologia battaglia.", "style-proposals-panel-night"),
      stylePopup("style-proposals-popup-night")
    ),
    styleCard(
      "04",
      "Dossier",
      "Layout tecnico con bordo tratteggiato, etichette secche e gerarchia da scheda dati.",
      "style-proposals-card-dossier",
      [
        styleButton("Analizza", "style-proposals-button-dossier"),
        styleButton("Archivio", "style-proposals-button-dossier-alt")
      ],
      styleZoneButton("Zone cattura", "zone_cattura_bottone.webp", "style-proposals-zone-dossier"),
      stylePanel("Report", "Cornice dashed utile per regole, statistiche e blocchi informativi.", "style-proposals-panel-dossier"),
      stylePopup("style-proposals-popup-dossier")
    ),
    styleCard(
      "05",
      "Badge",
      "Forme piu tonde, bordo ad anello e pulsanti a medaglia per premi o progressione.",
      "style-proposals-card-badge",
      [
        styleButton("Riscatta", "style-proposals-button-badge"),
        styleButton("Premi", "style-proposals-button-badge-alt")
      ],
      styleZoneButton("Campione", "campione_kanto_bottone.webp", "style-proposals-zone-badge"),
      stylePanel("Ricompensa", "Bordo spesso e radiale per card celebrative o sblocchi.", "style-proposals-panel-badge"),
      stylePopup("style-proposals-popup-badge")
    ),
    styleCard(
      "06",
      "Cristallo",
      "Superfici leggere, bordo semitrasparente e taglio diagonale per aree speciali.",
      "style-proposals-card-crystal",
      [
        styleButton("Apri", "style-proposals-button-crystal"),
        styleButton("Filtra", "style-proposals-button-crystal-alt")
      ],
      styleZoneButton("Mare", "mare_bottone.webp", "style-proposals-zone-crystal"),
      stylePanel("Archivio raro", "Cornice sfumata e angoli tagliati per contenuti premium o rari.", "style-proposals-panel-crystal"),
      stylePopup("style-proposals-popup-crystal")
    ),
    styleCard(
      "07",
      "Legno",
      "Toni caldi del legno, bordo intagliato con effetto rilievo per un tocco naturale e rustico.",
      "style-proposals-card-wood",
      [
        styleButton("Esplora", "style-proposals-button-wood"),
        styleButton("Raccogli", "style-proposals-button-wood-alt")
      ],
      styleZoneButton("Safari", "safari_bottone.webp", "style-proposals-zone-wood"),
      stylePanel("Tana", "Interno scanalato che ricorda le assi di un tavolo da taverna.", "style-proposals-panel-wood"),
      stylePopup("style-proposals-popup-wood")
    ),
    styleCard(
      "08",
      "Neon",
      "Sfondo scuro, bordi glow al laser e pulsanti fluorescenti per interfacce hi-tech.",
      "style-proposals-card-neon",
      [
        styleButton("Avvia", "style-proposals-button-neon"),
        styleButton("Reset", "style-proposals-button-neon-alt")
      ],
      styleZoneButton("Zafferanopoli", "zafferanopoli_bottone.webp", "style-proposals-zone-neon"),
      stylePanel("Console", "Bordo animato con bagliore ciano per log e cruscotti digitali.", "style-proposals-panel-neon"),
      stylePopup("style-proposals-popup-neon")
    ),
    styleCard(
      "09",
      "Mattoncini",
      "Cornice costruita a blocchi alternati: l'effetto mattone resta nel bordo e non invade il contenuto.",
      "style-proposals-card-brick",
      [
        styleButton("Costruisci", "style-proposals-button-brick"),
        styleButton("Ripara", "style-proposals-button-brick-alt")
      ],
      styleZoneButton("Plumbeopoli", "plumbeopoli_bottone.webp", "style-proposals-zone-brick"),
      stylePanel("Muro", "Panel con cornice a mattoni esterna e area interna pulita.", "style-proposals-panel-brick"),
      stylePopup("style-proposals-popup-brick")
    ),
    '  </div>',
    renderStyleZaino(),
    '</section>'
  ].join("");

  return sceneShell("Stili", "", content, "", "scene-content-style-proposals", "parent-back");
}
