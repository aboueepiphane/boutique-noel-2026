import { PRODUCTS, TIER_LABEL, productsOf } from '../src/data/products'
import { AISLES } from '../src/data/aisles'
import { GUIDES } from '../src/data/guides'
import { amazonUrl, missingLinks } from '../src/data/amazon'
import { AMAZON_TAG } from '../src/config'

console.log('PRODUITS :', PRODUCTS.length, '(cible du dossier : 30 à 40)\n')
console.log('Rayon                    prod.  petit prix  cœur  premium  ancre')
let pb: string[] = []
for (const a of AISLES) {
  const l = productsOf(a.id)
  const n = (t: string) => l.filter((p) => p.tier === t).length
  console.log(
    `${a.title.padEnd(24)} ${String(l.length).padStart(4)}  ${String(n('petit-prix')).padStart(9)}  ${String(n('coeur')).padStart(4)}  ${String(n('premium')).padStart(7)}  #${a.anchor}`,
  )
  if (l.length < 6 || l.length > 8) pb.push(`${a.title} : ${l.length} produits (le dossier demande 6 à 8)`)
  for (const t of ['petit-prix', 'coeur', 'premium']) if (n(t) === 0) pb.push(`${a.title} : aucune pièce en gamme « ${TIER_LABEL[t as 'coeur']} »`)
}

console.log('\nGUIDES :', GUIDES.length)
for (const g of GUIDES) console.log(`  #${g.anchor.padEnd(16)} ${g.items.length} éléments → rayon ${g.aisle}`)

console.log('\nLIENS AMAZON')
const sansTag = PRODUCTS.filter((p) => !amazonUrl(p.id).includes(`tag=${AMAZON_TAG}`))
console.log('  produits sans identifiant de suivi dans leur lien :', sansTag.length)
console.log('  produits sans lien direct (repli recherche Amazon) :', missingLinks().length, '/', PRODUCTS.length)
console.log('  exemple :', amazonUrl(PRODUCTS[0].id))

const sansMotCle = PRODUCTS.filter((p) => !p.keyword.trim())
console.log('\nMOTS-CLÉS : produits sans mot-clé couvert :', sansMotCle.length)

console.log(pb.length ? '\nÀ CORRIGER :\n' + pb.map((x) => '  - ' + x).join('\n') : '\nRÉPARTITION CONFORME')
