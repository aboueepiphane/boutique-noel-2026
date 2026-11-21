/** Curseur de la souris au-dessus d'un élément interactif de la scène 3D. */
export const setCursor = (c: 'pointer' | null) => {
  if (typeof document !== 'undefined') document.body.style.cursor = c ?? ''
}
