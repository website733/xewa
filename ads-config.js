// ============================================================
//  FR-ADS — ads-config.js
//  TON fichier de publicités. Modifie uniquement ce fichier.
// ============================================================

const FR_ADS_CONFIG = {

  // ── PARAMÈTRES GLOBAUX ──────────────────────────────────
  rotation_secondes: 4,     // Durée d'affichage de chaque pub (secondes)
  aleatoire: false,         // true = ordre aléatoire, false = ordre du tableau


  // ── TES PUBLICITÉS ──────────────────────────────────────
  pubs: [

    {
      id: "pub-001",
      actif: true,

      // Contenu
      emoji: "🚗",
      titre: "Renault E-Tech — Essai gratuit",
      description: "100% électrique. Réservez votre essai ce mois-ci.",
      bouton_texte: "Découvrir",
      lien: "https://www.renault.fr",

      // ✅ COULEURS : écris simplement le nom en français
      // Exemples : "rouge", "bleu marine", "rose pastel", "vert vif", "violet", "or"...
      // Liste complète dans widget.js
      couleur_fond: "rouge",         // Couleur du fond de la pub
      couleur_bouton: "rouge",       // Couleur du texte du bouton CTA

      // 🚫 BLOQUER SUR CERTAINS SITES
      // Laisse [] pour afficher partout.
      // Exemples : ["concurrent.fr", "autresite.com"]
      bloquer_sur: [],
    },

    {
      id: "pub-002",
      actif: true,

      emoji: "✈️",
      titre: "Paris → New York dès 349€",
      description: "Vols directs Air France. Offre valable jusqu'au 30 juin.",
      bouton_texte: "Réserver",
      lien: "https://www.airfrance.fr",

      couleur_fond: "bleu",
      couleur_bouton: "bleu",

      // Cette pub ne s'affichera PAS sur voyages-discount.fr ni sur promos-vols.com
      bloquer_sur: ["voyages-discount.fr", "promos-vols.com"],
    },

    {
      id: "pub-003",
      actif: true,

      emoji: "🌿",
      titre: "Arkopharma — Compléments naturels",
      description: "Fabriqués en France. Livraison offerte dès 30€.",
      bouton_texte: "Commander",
      lien: "https://www.arkopharma.fr",

      couleur_fond: "vert",
      couleur_bouton: "vert",

      bloquer_sur: [],
    },


    // ═══════════════════════════════════════════════════════
    //  MODÈLE — copie ce bloc et remplis les champs
    // ═══════════════════════════════════════════════════════
    /*
    {
      id: "pub-004",           // Change le numéro (doit être unique)
      actif: true,             // false = pub désactivée sans la supprimer

      emoji: "🛍️",            // Emoji ou "" pour aucun
      titre: "Ton titre ici",
      description: "Ta description courte ici.",
      bouton_texte: "En savoir plus",
      lien: "https://ton-site.fr",

      // Noms disponibles :
      // rouge · rouge vif · rouge pastel · bordeaux · rose · rose pastel · fushia
      // orange · orange pastel · corail · saumon · peche
      // jaune · jaune pastel · or · ambre
      // vert · vert vif · vert pastel · vert emeraude · menthe · turquoise
      // bleu · bleu vif · bleu pastel · bleu marine · bleu ciel · bleu roi · bleu nuit · cyan · indigo
      // violet · violet pastel · violet vif · lavande · mauve · lilas · prune
      // noir · gris · gris clair · gris sombre · blanc · creme · beige · brun · chocolat · caramel
      couleur_fond: "rose pastel",
      couleur_bouton: "rose",

      bloquer_sur: [],         // Ex: ["site-concurrent.fr"]
    },
    */

  ],

};
