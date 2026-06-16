// ============================================================
//  FR-ADS — widget.js
//  Moteur de diffusion. Ne pas modifier.
//  Les partenaires incluent ce fichier + un <div class="fr-ads-slot">
// ============================================================

(function () {

  // ── 1. RÉCUPÈRE LA CONFIG ─────────────────────────────────
  if (typeof FR_ADS_CONFIG === "undefined") {
    console.warn("[FR-ADS] ads-config.js introuvable ou chargé après widget.js.");
    return;
  }

  const cfg = FR_ADS_CONFIG;

  // ── 2. DÉTECTE LE SITE ACTUEL ────────────────────────────
  const domaineCourant = window.location.hostname.replace(/^www\./, "");

  // Filtre les pubs : actives ET non bloquées pour ce domaine
  const pubs = cfg.pubs.filter(pub => {
    if (!pub.actif) return false;
    if (pub.bloquer_sur && pub.bloquer_sur.length > 0) {
      const bloque = pub.bloquer_sur.some(d => domaineCourant.includes(d));
      if (bloque) return false;
    }
    return true;
  });

  if (!pubs.length) {
    console.info("[FR-ADS] Aucune pub active pour ce domaine :", domaineCourant);
    return;
  }

  // ── 3. CONVERSION NOM DE COULEUR → HEX ──────────────────
  const COULEURS = {
    // Rouges
    "rouge":            ["#E8142A", "#8A0A18"],
    "rouge vif":        ["#FF1A1A", "#8A0000"],
    "rouge sombre":     ["#8B0000", "#3A0000"],
    "rouge pastel":     ["#FFB3B3", "#FF7F7F"],
    "bordeaux":         ["#722F37", "#3A1018"],
    "rose":             ["#FF4D8F", "#C2185B"],
    "rose pastel":      ["#FFB3D1", "#FF80AB"],
    "rose vif":         ["#FF0066", "#990040"],
    "fushia":           ["#FF00AA", "#990066"],

    // Oranges
    "orange":           ["#FF6B00", "#CC4400"],
    "orange pastel":    ["#FFCBA4", "#FFA07A"],
    "orange vif":       ["#FF4500", "#CC2200"],
    "peche":            ["#FFCBA4", "#FF9A6C"],
    "saumon":           ["#FF8C69", "#CC5533"],
    "corail":           ["#FF6B6B", "#CC3333"],

    // Jaunes
    "jaune":            ["#FFD700", "#CC9900"],
    "jaune pastel":     ["#FFF59D", "#FFE57F"],
    "jaune vif":        ["#FFE000", "#CC9900"],
    "or":               ["#FFD700", "#B8860B"],
    "ambre":            ["#FFBF00", "#996600"],

    // Verts
    "vert":             ["#14A85A", "#0A4025"],
    "vert vif":         ["#00CC44", "#007722"],
    "vert pastel":      ["#B2F0C8", "#80DDA0"],
    "vert sombre":      ["#1B5E20", "#0A2810"],
    "vert emeraude":    ["#00A878", "#006B4C"],
    "menthe":           ["#98FF98", "#66CC66"],
    "olive":            ["#808000", "#4A4A00"],
    "turquoise":        ["#00CED1", "#008B8D"],

    // Bleus
    "bleu":             ["#1A5CE8", "#0A1F6A"],
    "bleu vif":         ["#0066FF", "#003399"],
    "bleu pastel":      ["#B3D1FF", "#80AAFF"],
    "bleu sombre":      ["#0A0F2E", "#050814"],
    "bleu ciel":        ["#87CEEB", "#4A90C4"],
    "bleu marine":      ["#001F5B", "#000D2E"],
    "bleu roi":         ["#4169E1", "#1A3CA8"],
    "bleu nuit":        ["#1C2B5E", "#0A1230"],
    "cyan":             ["#00BCD4", "#006B7A"],
    "indigo":           ["#3F51B5", "#1A237E"],

    // Violets
    "violet":           ["#7B1FA2", "#3A0060"],
    "violet pastel":    ["#D1B3FF", "#B080FF"],
    "violet vif":       ["#AA00FF", "#6600CC"],
    "lavande":          ["#C9B1E8", "#9B7FCC"],
    "mauve":            ["#9C6B9E", "#5E3560"],
    "lilas":            ["#DDA0DD", "#BA68C8"],
    "prune":            ["#673AB7", "#311B92"],

    // Neutres
    "noir":             ["#1A1A1A", "#000000"],
    "gris":             ["#607D8B", "#37474F"],
    "gris clair":       ["#BDBDBD", "#9E9E9E"],
    "gris sombre":      ["#424242", "#212121"],
    "gris ardoise":     ["#546E7A", "#263238"],
    "blanc":            ["#FFFFFF", "#E0E0E0"],
    "creme":            ["#FFF8E1", "#FFECB3"],
    "beige":            ["#F5DEB3", "#D2B48C"],
    "brun":             ["#795548", "#3E2723"],
    "chocolat":         ["#5D4037", "#2E1A0E"],
    "caramel":          ["#C68642", "#8B5E22"],
  };

  function resoudreCouleur(valeur) {
    if (!valeur) return ["#333333", "#111111"];
    // Si c'est déjà un tableau de hex → on l'utilise tel quel
    if (Array.isArray(valeur)) return valeur;
    // Si c'est un nom → on cherche dans le dictionnaire
    const cle = valeur.toString().toLowerCase().trim();
    if (COULEURS[cle]) return COULEURS[cle];
    // Si c'est un seul hex → on assombrit légèrement pour le dégradé
    if (typeof valeur === "string" && valeur.startsWith("#")) return [valeur, valeur + "AA"];
    console.warn("[FR-ADS] Couleur inconnue :", valeur, "— utilisation du gris par défaut.");
    return ["#607D8B", "#37474F"];
  }

  function resoudreCouleurBouton(valeur) {
    if (!valeur) return "#333333";
    if (typeof valeur === "string" && valeur.startsWith("#")) return valeur;
    const cle = valeur.toString().toLowerCase().trim();
    return COULEURS[cle] ? COULEURS[cle][0] : "#333333";
  }

  // ── 4. RENDU D'UNE PUB ───────────────────────────────────
  function renderAd(slot, pub) {
    const fond = resoudreCouleur(pub.couleur_fond);
    const btnColor = resoudreCouleurBouton(pub.couleur_bouton);
    const gradient = `linear-gradient(135deg, ${fond[0]} 0%, ${fond[1]} 100%)`;

    slot.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    slot.style.opacity = "0";
    slot.style.transform = "translateY(5px)";

    setTimeout(() => {
      slot.innerHTML = `
        <a href="${pub.lien || '#'}" target="_blank" rel="noopener" style="
          display:flex; align-items:center; gap:14px;
          background:${gradient};
          padding:18px 20px; border-radius:8px;
          text-decoration:none; color:white;
          font-family:'Inter',Arial,sans-serif;
          position:relative; cursor:pointer;
          box-shadow: 0 4px 18px rgba(0,0,0,0.18);
        ">
          ${pub.emoji ? `<span style="font-size:2rem;flex-shrink:0;">${pub.emoji}</span>` : ""}
          <span style="flex:1;">
            <strong style="display:block;font-size:0.92rem;font-weight:700;margin-bottom:3px;">${pub.titre}</strong>
            <span style="font-size:0.78rem;opacity:0.88;">${pub.description}</span>
          </span>
          <span style="
            background:white; color:${btnColor};
            padding:7px 14px; border-radius:4px;
            font-weight:700; font-size:0.76rem;
            white-space:nowrap; flex-shrink:0;
          ">${pub.bouton_texte || "En savoir plus"}</span>
          <span style="
            position:absolute;top:6px;right:6px;
            background:rgba(0,0,0,0.3);color:rgba(255,255,255,0.6);
            font-size:0.55rem;font-weight:600;letter-spacing:0.1em;
            padding:2px 5px;border-radius:2px;
          ">FR-ADS</span>
        </a>
      `;
      slot.style.opacity = "1";
      slot.style.transform = "translateY(0)";
    }, 180);
  }

  // ── 5. ROTATION ───────────────────────────────────────────
  document.querySelectorAll(".fr-ads-slot").forEach(slot => {
    let idx = 0;
    renderAd(slot, pubs[0]);

    setInterval(() => {
      if (cfg.aleatoire) {
        idx = Math.floor(Math.random() * pubs.length);
      } else {
        idx = (idx + 1) % pubs.length;
      }
      renderAd(slot, pubs[idx]);
    }, (cfg.rotation_secondes || 4) * 1000);
  });

})();
