import { View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

const COLORS = ['#DFC2C3', '#DBB7BB', '#CCA1A6', '#B07C83'] as const

export default () => {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="pantonePinkPageBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS[0]} />
            <Stop offset="33%" stopColor={COLORS[1]} />
            <Stop offset="66%" stopColor={COLORS[2]} />
            <Stop offset="100%" stopColor={COLORS[3]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pantonePinkPageBg)" />
      </Svg>
    </View>
  )
}
