/**
 * Contrôle des 9 ancres du dossier : chaque adresse doit ouvrir la bonne destination.
 * Lancer : npm run ancres
 */
import { routeFromHash } from '../src/state/ui'
import { AISLES } from '../src/data/aisles'
import { GUIDES } from '../src/data/guides'
import { SITE_URL } from '../src/config'

let ko = 0
console.log('Ancre                destination                    adresse à mettre dans l’épingle')
for (const a of AISLES) {
  const r = routeFromHash(a.anchor)
  const ok = r.view === 'rayons' && r.aisle === a.id
  if (!ok) ko++
  console.log(`${ok ? '✓' : '✗'} #${a.anchor.padEnd(16)} rayon ${a.title.padEnd(23)} ${SITE_URL}/#${a.anchor}`)
}
for (const g of GUIDES) {
  const r = routeFromHash(g.anchor)
  const ok = r.view === 'inspiration' && r.guide === g.anchor
  if (!ok) ko++
  console.log(`${ok ? '✓' : '✗'} #${g.anchor.padEnd(16)} guide ${g.title.padEnd(23)} ${SITE_URL}/#${g.anchor}`)
}
console.log(ko ? `\n${ko} ancre(s) en échec` : '\nLes 9 ancres du dossier répondent.')
