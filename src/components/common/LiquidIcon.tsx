import { type ReactNode } from 'react'
import { TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native'
import { createStyle } from '@/utils/tools'

export type LiquidIconTone = 'default' | 'danger'

export const LiquidIconFrame = ({
  children,
  style,
  active = false,
  tone = 'default',
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  active?: boolean
  tone?: LiquidIconTone
}) => (
  <View
    style={[
      styles.frame,
      active ? styles.frameActive : null,
      tone == 'danger' ? styles.frameDanger : null,
      style,
    ]}
  >
    <View
      pointerEvents="none"
      style={[
        styles.tone,
        active ? styles.toneActive : null,
        tone == 'danger' ? styles.toneDanger : null,
      ]}
    />
    <View pointerEvents="none" style={styles.gloss} />
    <View pointerEvents="none" style={styles.innerBorder} />
    {children}
  </View>
)

export const LiquidIconButton = ({
  children,
  style,
  active = false,
  tone = 'default',
  onPress,
  activeOpacity = 0.82,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  active?: boolean
  tone?: LiquidIconTone
  onPress?: () => void
  activeOpacity?: number
}) => (
  <TouchableOpacity
    style={style}
    activeOpacity={activeOpacity}
    onPress={onPress}
    disabled={!onPress}
  >
    <LiquidIconFrame style={styles.fill} active={active} tone={tone}>
      {children}
    </LiquidIconFrame>
  </TouchableOpacity>
)

const styles = createStyle({
  fill: {
    width: '100%',
    height: '100%',
  },
  frame: {
    position: 'relative',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(229,225,230,0.34)',
    shadowColor: '#c6bec9',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  frameActive: {
    borderColor: 'rgba(255,255,255,0.64)',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  frameDanger: {
    borderColor: 'rgba(255,245,245,0.72)',
    backgroundColor: 'rgba(235,186,194,0.36)',
  },
  tone: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(227,220,230,0.26)',
  },
  toneActive: {
    backgroundColor: 'rgba(240,234,244,0.34)',
  },
  toneDanger: {
    backgroundColor: 'rgba(255,238,243,0.26)',
  },
  gloss: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
    height: '48%',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  innerBorder: {
    position: 'absolute',
    left: 1.5,
    right: 1.5,
    top: 1.5,
    bottom: 1.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
})
