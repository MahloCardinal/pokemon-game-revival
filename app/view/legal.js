import { t, tList } from "../client/i18n.js";
import { sceneShell } from "../client/render-utils.js";

function legalArticle(kind) {
  var variables = kind === "terms" ? { privacyLink: t("legal.terms.privacyLink") } : {};
  return [
    '<article class="legal-article">',
    "<h2>" + t("legal." + kind + ".title") + "</h2>",
    tList("legal." + kind + ".sections", variables).join(""),
    "</article>"
  ].join("");
}

function renderLegalScene(kind) {
  var title = t("legal." + kind + ".title");
  var layout = '<section class="legal-layout">' + legalArticle(kind) + "</section>";
  return sceneShell(title, "", layout, "", "scene-content-legal", "parent-back");
}

export function renderPrivacyPolicyScene() {
  return renderLegalScene("privacy");
}

export function renderTermsScene() {
  return renderLegalScene("terms");
}
