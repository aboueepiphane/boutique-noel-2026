import type { ModelKind, Product } from '../../data/types'
import { TreeProduct, TreeStand } from './trees'
import { BaubleSet, ClearBauble, CustomBauble, TopperStar, Snowflake, RockingHorse, BeadGarland } from './ornaments'
import { LedString, LightCurtain, RattanStar, Projector, LedCandles, OutdoorDeer } from './lights'
import { Santa, Reindeer, Snowman, Elf, Nativity, Nutcracker, Carousel } from './figures'
import { Wreath, Centerpiece, Tablecloth, Dinnerware, Stocking, GiftBoxes, RibbonSpools, WallStar } from './home'

/** Hauteur approximative de chaque modèle (en mètres, avant mise à l'échelle). */
export const MODEL_HEIGHT: Record<ModelKind, number> = {
  tree: 2.05, snowTree: 2.05, miniTree: 0.7, ledTree: 2.05, treeStand: 0.25, premiumTree: 2.45,
  bauble: 0.25, clearBauble: 0.28, customBauble: 0.33, star: 0.36, snowflake: 0.36, hangingFigure: 0.4, beadGarland: 0.55,
  ledString: 0.36, lightCurtain: 1.1, lightStar: 0.7, projector: 0.8, ledCandle: 0.2, outdoorDeer: 1.3,
  santa: 0.56, reindeer: 0.55, snowman: 0.49, elf: 0.47, nativity: 0.47, nutcracker: 0.57, carousel: 0.42,
  wreath: 0.66, centerpiece: 0.22, tablecloth: 0.16, dinnerware: 0.11, stocking: 0.56, giftBox: 0.3, ribbon: 0.1, wallDecor: 0.64,
}

export function ProductModel({ product, color }: { product: Product; color?: string }) {
  const c = color ?? product.color
  const a = product.accent
  switch (product.kind) {
    case 'tree': case 'snowTree': case 'miniTree': case 'ledTree': case 'premiumTree':
      return <TreeProduct kind={product.kind} color={c} />
    case 'treeStand': return <TreeStand color={c} />
    case 'bauble': return <BaubleSet color={c} accent={a} />
    case 'clearBauble': return <ClearBauble color={c} />
    case 'customBauble': return <CustomBauble color={c} />
    case 'star': return <TopperStar color={c} />
    case 'snowflake': return <Snowflake color={c} />
    case 'hangingFigure': return <RockingHorse color={c} accent={a} />
    case 'beadGarland': return <BeadGarland color={c} accent={a} />
    case 'ledString': return <LedString color={c} />
    case 'lightCurtain': return <LightCurtain color={c} />
    case 'lightStar': return <RattanStar color={c} />
    case 'projector': return <Projector color={c} />
    case 'ledCandle': return <LedCandles color={c} />
    case 'outdoorDeer': return <OutdoorDeer color={c} />
    case 'santa': return <Santa color={c} />
    case 'reindeer': return <Reindeer color={c} />
    case 'snowman': return <Snowman color={c === '#f3efe6' ? '#9b1c23' : c} />
    case 'elf': return <Elf color={c} />
    case 'nativity': return <Nativity color={c} />
    case 'nutcracker': return <Nutcracker color={c} />
    case 'carousel': return <Carousel color={c} accent={a} />
    case 'wreath': return <Wreath color={product.color} accent={a ?? '#9b1c23'} radius={c === product.color ? 0.22 : 0.22} />
    case 'centerpiece': return <Centerpiece color={c === '#c9a45c' ? '#f3efe6' : '#9b1c23'} />
    case 'tablecloth': return <Tablecloth color={c} accent={a} />
    case 'dinnerware': return <Dinnerware color={c} />
    case 'stocking': return <Stocking color={c} accent={a} />
    case 'giftBox': return <GiftBoxes color={c} accent={a} />
    case 'ribbon': return <RibbonSpools color={c} />
    case 'wallDecor': return <WallStar color={c} accent={a} />
  }
}
