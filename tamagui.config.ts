import { defaultConfig } from '@tamagui/config/v5'
import { createTamagui } from 'tamagui'

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    body: {
      ...defaultConfig.fonts.body,
      family: 'Inter',
    },
    heading: {
      ...defaultConfig.fonts.heading,
      family: 'Inter-Black',
    },
  },
  themes: {
    ...defaultConfig.themes,
    blue: {
      ...defaultConfig.themes.light,
      // background: '#0a7ea4',
      // color: '#ffffff',
      // borderColor: '#0a7ea4',
    },
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}