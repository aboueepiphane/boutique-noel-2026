# Avant H0 — ce qu'il reste à faire sur la boutique

Quatre opérations, dans cet ordre. Rien d'autre ne demande de toucher au code.

## 1. Remplir `src/config.ts` (5 minutes)

| Valeur | Ce qu'on y met |
|---|---|
| `SHOP_NAME` | le nom de la boutique, **identique** au nom du profil Pinterest |
| `SITE_URL` | l'adresse publique en https, sans barre oblique finale — sur GitHub Pages : `https://VOTRE-PSEUDO.github.io/boutique-noel-2026` |
| `AMAZON_TAG` | l'identifiant Partenaires Amazon (`votre-id-21`). **Sans lui, aucun clic n'est rémunéré.** |
| `CONTACT` | éditeur, adresse, SIREN, hébergeur, e-mail — ils alimentent les Mentions légales |

## 2. Coller les 36 liens affiliés dans `src/data/amazon.ts` (étape PR-03)

Pour chaque produit : fiche Amazon → barre **SiteStripe** → **Texte** → copier le lien → le coller
dans la case du produit.

Tant qu'une case reste vide, le bouton renvoie vers une **recherche Amazon** sur le mot-clé du
produit, avec l'identifiant de suivi : le bouton fonctionne, mais un lien direct convertit beaucoup
mieux. `npm run conformite` compte les cases encore vides.

## 3. Mettre en ligne avec GitHub Pages

**Votre adresse sera** `https://VOTRE-PSEUDO.github.io/NOM-DU-DEPOT/` — vous la connaissez donc
avant même le premier envoi. Avec un dépôt nommé `boutique-noel-2026` :
`https://votre-pseudo.github.io/boutique-noel-2026/`

### a. Créer le dépôt

Sur github.com : **New repository** → nom `boutique-noel-2026` → **Public** (Pages est gratuit sur
les dépôts publics) → ne cochez ni README ni .gitignore, le projet en a déjà → **Create**.

### b. Envoyer le projet

Dans le terminal de VS Code, à la racine du projet :

```powershell
git init -b main
git add .
git commit -m "Boutique de Noël 3D, vitrine d'affiliation Amazon"
git remote add origin https://github.com/VOTRE-PSEUDO/boutique-noel-2026.git
git push -u origin main
```

`node_modules` et `dist` ne partent pas : le `.gitignore` les écarte, et GitHub refabrique le site
lui-même.

### c. Activer Pages — l'étape qu'on oublie

Dépôt → **Settings** → **Pages** → **Build and deployment** → **Source** : choisir
**« GitHub Actions »**.

Sans ce réglage, l'action tourne et échoue à la dernière étape.

### d. Suivre la publication

Onglet **Actions** du dépôt : le travail « Publier la boutique » démarre tout seul. Deux à trois
minutes. Un rond vert, et la boutique est en ligne à l'adresse ci-dessus.

Le journal de l'action affiche aussi, à chaque publication, les adresses des 10 destinations
d'épingles et l'état des liens Amazon.

### e. Les fois suivantes

```powershell
git add .
git commit -m "ce que vous venez de changer"
git push
```

Plus rien à glisser, plus de `npm run build` à lancer à la main : GitHub refait tout.

**Si l'action échoue**, rien n'est publié et la version en ligne reste celle d'avant. Le journal
indique l'étape fautive : « Contrôler le code » ou « Contrôler le rendu des pages » signifie qu'une
modification a cassé quelque chose — corrigez, puis renvoyez.

## 4. Revendiquer le site auprès de Pinterest (étape OP-02, H0:15)

Paramètres Pinterest → **Comptes revendiqués** → **Site web** → copier la balise fournie, la coller
dans `index.html` à la place de la ligne commentée `p:domain_verify`, puis `git add . && git commit
-m "balise Pinterest" && git push` et lancer la vérification une fois l'action terminée.

---

# Les 10 adresses de destination des épingles

À reporter dans la feuille **Épingles** du tableur de pilotage. Remplacer le début par l'adresse
réelle de la boutique.

| Destination | Adresse | Reçoit |
|---|---|---|
| Rayon Sapins | `/#sapins` | vagues 2 et 3 |
| Rayon Guirlandes & LED | `/#guirlandes` | vagues 2 et 3 |
| Rayon Boules & ornements | `/#boules` | vagues 2 et 3 |
| Rayon Figurines & villages | `/#figurines` | vagues 2 et 3 |
| Rayon Table & extérieur | `/#table` | vagues 2 et 3 |
| Guide « Décorer son sapin en 5 étapes » | `/#guide-sapin` | vague 1 (recette I1) |
| Guide « Les palettes de Noël 2026 » | `/#guide-palettes` | vague 1 (recette I2) |
| Guide « 7 erreurs de déco de Noël à éviter » | `/#guide-erreurs` | vague 1 (recette I3) |
| Guide « 4 styles de Noël tendance » | `/#guide-styles` | vague 1 (recette I4) |
| Accueil | `/` | **le site du compte professionnel Pinterest** |

Jamais une adresse Amazon ni une ancre comme site du compte professionnel : l'accueil, en https.

`npm run ancres` réaffiche cette liste avec l'adresse de `config.ts` et vérifie que chaque ancre
ouvre bien sa destination.

---

# Les trois contrôles automatiques

```bash
npm run ancres       # les 9 ancres ouvrent-elles la bonne destination ?
npm run conformite   # produits par rayon, 3 gammes par rayon, liens affiliés, mots-clés
npm run rendu        # rendu réel de chaque page, et absence de prix / panier / avis
npm run typecheck    # cohérence du code
```

À relancer après chaque remplacement de produit.

---

# Le test des 12 points (page A3 du dossier) — à faire à la main

Les contrôles automatiques ne remplacent pas celui-ci : sur un téléphone Android, un iPhone si
possible et un ordinateur, **en 4G et pas en Wi-Fi**.

- [ ] L'accueil s'affiche en moins de 3 secondes
- [ ] Chaque ancre de rayon ouvre le bon rayon
- [ ] Chaque ancre de guide ouvre le bon guide
- [ ] Les 36 boutons « Voir sur Amazon » ouvrent le bon produit — **en navigation privée**
- [ ] Aucun texte coupé, aucun élément qui déborde
- [ ] Aucune faute d'orthographe (relecture par une autre personne)
- [ ] Titre de l'onglet et icône personnalisés
- [ ] Mention d'affiliation visible en bas de chaque écran
- [ ] Pages À propos, Contact, Mentions légales présentes
- [ ] Navigation fluide 2 minutes sans saccade
- [ ] Adresse en https, nom propre et lisible
- [ ] Un inconnu dit « je ferais confiance » en 10 secondes

Un seul point non coché : on ne démarre pas le chrono.

---

# Ce qui reste à décider dans le catalogue

`npm run conformite` signale trois écarts qui demandent de choisir de vrais produits sur Amazon,
pendant l'étape PR-01/PR-02 :

- **Boules & ornements : 9 produits** là où le dossier en demande 6 à 8. En retirer un, ou le
  déplacer vers un autre rayon (en pensant à son emplacement 3D dans `src/data/layout.ts`).
- **Boules & ornements : aucune pièce premium** (> 80 €). Un gros coffret de boules en verre soufflé
  ou un lot complet peut remplir cette case.
- **Figurines & villages : aucune pièce petit prix** (< 25 €). Une figurine seule ou un lot de petits
  santons convient.

Le champ `tier` de chaque produit doit refléter **le prix réel du produit choisi sur Amazon**, pas
une estimation : c'est lui qui alimente les filtres de gamme et les recettes F2 (petit budget).

Le champ `keyword` est le mot-clé du référentiel que le produit couvre. C'est le garde-fou du
pilier 1 : une épingle ne doit jamais promettre un mot-clé qu'aucun produit ne couvre.
