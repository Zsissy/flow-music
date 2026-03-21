import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { useKeyboard } from '@/utils/hooks'
import { createStyle } from '@/utils/tools'
import { scaleSizeW } from '@/utils/pixelRatio'
import Image from '@/components/common/Image'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { useIsPlay, usePlayMusicInfo, usePlayerMusicInfo, useProgress } from '@/store/player/hook'
import { collectMusic, togglePlay, uncollectMusic } from '@/core/player/player'
import { useSettingValue } from '@/store/setting/hook'
import commonState from '@/store/common/state'
import { navigations } from '@/navigation'
import { getListMusics } from '@/core/list'
import { LIST_IDS } from '@/config/constant'
import { useI18n } from '@/lang'

const COVER_SIZE = 44
const RING_BORDER_WIDTH_RAW = 2
const COVER_INNER_SIZE = COVER_SIZE - RING_BORDER_WIDTH_RAW * 2
const RING_RENDER_SIZE = scaleSizeW(COVER_SIZE)
const RING_BORDER_WIDTH = scaleSizeW(RING_BORDER_WIDTH_RAW)
const CIRCLE_CENTER = RING_RENDER_SIZE / 2
const RING_RADIUS = (RING_RENDER_SIZE - RING_BORDER_WIDTH) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const sourceRingColorMap: Record<string, string> = {
  tx: '#31c27c',
  wy: '#d81e06',
  kg: '#2f88ff',
  kw: '#f59e0b',
  mg: '#e11d8d',
  local: '#64748b',
}

const SOURCE_RING_LIGHTEN_RATIO = 0.22

const lightenHex = (hex: string, ratio: number) => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return hex
  const value = match[1]
  const channel = (offset: number) => {
    const raw = parseInt(value.slice(offset, offset + 2), 16)
    const mixed = Math.round(raw + (255 - raw) * ratio)
    return mixed.toString(16).padStart(2, '0')
  }
  return `#${channel(0)}${channel(2)}${channel(4)}`
}

const getSourceColor = (source: string | null | undefined) => {
  const baseColor = !source ? '#111827' : (sourceRingColorMap[source.toLowerCase()] ?? '#111827')
  return lightenHex(baseColor, SOURCE_RING_LIGHTEN_RATIO)
}

const getTrackColor = (hex: string) => {
  if (/^#[0-9a-f]{6}$/i.test(hex)) return `${hex}33`
  return '#e5e7eb'
}

const getMusicSource = (musicInfo: LX.Player.PlayMusicInfo['musicInfo'] | null | undefined) => {
  if (!musicInfo) return null
  if ('progress' in musicInfo) return musicInfo.metadata.musicInfo.source
  return musicInfo.source
}

export default memo(({ isHome = false }: { isHome?: boolean }) => {
  const t = useI18n()
  const { keyboardShown } = useKeyboard()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')
  const musicInfo = usePlayerMusicInfo()
  const playMusicInfo = usePlayMusicInfo()
  const { progress } = useProgress()
  const isPlay = useIsPlay()
  const loveCheckId = useRef(0)
  const [isLoved, setIsLoved] = useState(false)
  const ringColor = useMemo(() => {
    if (!musicInfo.id) return '#111827'
    return getSourceColor(getMusicSource(playMusicInfo.musicInfo))
  }, [musicInfo.id, playMusicInfo.musicInfo])
  const trackColor = useMemo(() => getTrackColor(ringColor), [ringColor])
  const normalizedProgress = useMemo(() => {
    if (!musicInfo.id || !Number.isFinite(progress)) return 0
    if (progress <= 0) return 0
    if (progress >= 1) return 1
    return progress
  }, [musicInfo.id, progress])
  const progressStrokeOffset = useMemo(() => {
    return RING_CIRCUMFERENCE * (1 - normalizedProgress)
  }, [normalizedProgress])

  const showPlayDetail = () => {
    if (!musicInfo.id) return
    navigations.pushPlayDetailScreen(commonState.componentIds.home!)
  }

  const refreshLovedState = useCallback(async(targetId?: string | null) => {
    const musicId = targetId ?? musicInfo.id
    if (!musicId) {
      setIsLoved(false)
      return
    }
    const musicIdStr = String(musicId)
    const currentCheckId = ++loveCheckId.current
    const loveList = await getListMusics(LIST_IDS.LOVE)
    if (currentCheckId !== loveCheckId.current) return
    setIsLoved(loveList.some(song => String(song.id) === musicIdStr))
  }, [musicInfo.id])

  useEffect(() => {
    void refreshLovedState(musicInfo.id)
  }, [musicInfo.id, refreshLovedState])

  useEffect(() => {
    const handleLoveListChanged = (ids: string[]) => {
      if (!ids.includes(LIST_IDS.LOVE)) return
      void refreshLovedState()
    }
    global.app_event.on('myListMusicUpdate', handleLoveListChanged)
    return () => {
      global.app_event.off('myListMusicUpdate', handleLoveListChanged)
    }
  }, [refreshLovedState])

  const handleToggleLoved = () => {
    if (!musicInfo.id) return
    const nextLoved = !isLoved
    setIsLoved(nextLoved)
    if (nextLoved) collectMusic()
    else uncollectMusic()
  }

  const keepPlayBarOnKeyboard = Reflect.get(global.lx, 'keepPlayBarOnKeyboard') === true
  if (autoHidePlayBar && keyboardShown && !keepPlayBarOnKeyboard) return null

  return (
    <View style={styles.wrap}>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.contentPress}
          onPress={showPlayDetail}
          onLongPress={isHome ? global.app_event.jumpListPosition : undefined}
        >
          <View style={styles.left}>
            <View style={styles.ring}>
              <View style={styles.coverClip}>
                <Image url={musicInfo.pic} style={styles.pic} />
              </View>
              <Svg width={RING_RENDER_SIZE} height={RING_RENDER_SIZE} style={styles.ringSvg} pointerEvents="none">
                <Circle
                  cx={CIRCLE_CENTER}
                  cy={CIRCLE_CENTER}
                  r={RING_RADIUS}
                  stroke={trackColor}
                  strokeWidth={RING_BORDER_WIDTH}
                  fill="none"
                />
                <Circle
                  cx={CIRCLE_CENTER}
                  cy={CIRCLE_CENTER}
                  r={RING_RADIUS}
                  stroke={ringColor}
                  strokeWidth={RING_BORDER_WIDTH}
                  fill="none"
                  strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                  strokeDashoffset={progressStrokeOffset}
                  transform={`rotate(-90 ${CIRCLE_CENTER} ${CIRCLE_CENTER})`}
                  opacity={normalizedProgress > 0 ? 1 : 0}
                />
              </Svg>
            </View>
          </View>
          <View style={styles.center}>
            <Text size={13} color="#111827" numberOfLines={1} style={styles.title}>
              {musicInfo.name || t('player_bar_not_playing')}
            </Text>
            <Text size={10} color="#6b7280" numberOfLines={1}>
              {musicInfo.singer || t('player_bar_choose_song')}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={handleToggleLoved}>
            {isLoved
              ? <Text size={18} color="#ef4444" style={styles.loveFilled}>{'\u2665'}</Text>
              : <Icon name="love" rawSize={18} color="#9ca3af" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} activeOpacity={0.85} onPress={togglePlay}>
            <Icon name={isPlay ? 'pause' : 'play'} rawSize={18} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Icon name="menu" rawSize={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

const styles = createStyle({
  wrap: {
    paddingHorizontal: 12,
    paddingBottom: 6,
    marginTop: -12,
  },
  container: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8e8ec',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  contentPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    marginRight: 10,
  },
  ring: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: scaleSizeW(COVER_SIZE / 2),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverClip: {
    width: COVER_INNER_SIZE,
    height: COVER_INNER_SIZE,
    borderRadius: scaleSizeW(COVER_INNER_SIZE / 2),
    overflow: 'hidden',
  },
  pic: {
    width: '100%',
    height: '100%',
    borderRadius: scaleSizeW(COVER_INNER_SIZE / 2),
  },
  ringSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  center: {
    flex: 1,
    paddingRight: 6,
  },
  title: {
    fontWeight: '700',
    marginBottom: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loveFilled: {
    lineHeight: 19,
    fontWeight: '700',
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 2,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
})
