import { useMemo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { pop } from '@/navigation'
import { useStatusbarHeight } from '@/store/common/hook'
import { useIsPlay, usePlayerMusicInfo, useProgress } from '@/store/player/hook'
import { createStyle } from '@/utils/tools'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import Image from '@/components/common/Image'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { useWindowSize } from '@/utils/hooks'
import { getCoverTheme } from './coverTheme'

const toPercent = (now: number, total: number): `${number}%` => {
  if (!total) return '0%'
  return `${Math.min(100, Math.max(0, Math.floor((now / total) * 100)))}%`
}

export default ({ componentId, active }: { componentId: string, active: boolean }) => {
  const statusBarHeight = useStatusbarHeight()
  const musicInfo = usePlayerMusicInfo()
  const { nowPlayTimeStr, maxPlayTimeStr, progress, maxPlayTime } = useProgress(active)
  const isPlay = useIsPlay()
  const winSize = useWindowSize()
  const discSize = Math.min(winSize.width * 0.84, 420)
  const coverTheme = useMemo(() => getCoverTheme(musicInfo?.pic ?? `${musicInfo?.id ?? 'track'}`), [musicInfo?.id, musicInfo?.pic])

  const goBack = () => {
    void pop(componentId)
  }

  return (
    <View style={[styles.container, { backgroundColor: coverTheme.bottom }]}>
      <View style={[styles.bgTintTop, { backgroundColor: coverTheme.top }]} />
      <View style={[styles.bgTintMiddle, { backgroundColor: coverTheme.middle }]} />

      <View style={[styles.header, { paddingTop: statusBarHeight + 8 }]}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={goBack}>
          <Icon name="chevron-left" rawSize={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text size={10} color="#6b7280" style={styles.headerUpper}>Playing From Playlist</Text>
          <Text size={13} color="#111827" numberOfLines={1} style={styles.headerTitle}>Late Night Grooves</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Icon name="menu" rawSize={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <View style={[styles.recordWrap, { width: discSize, height: discSize }]}>
          <View style={styles.recordTone} />
          <View style={styles.record}>
            <View style={styles.recordInner}>
              <Image style={styles.recordImage} url={musicInfo.pic} />
            </View>
          </View>
        </View>

        <View style={styles.songInfo}>
          <View style={styles.titleRow}>
            <TouchableOpacity activeOpacity={0.7}>
              <Icon name="comment" rawSize={20} color="#9ca3af" />
            </TouchableOpacity>
            <Text size={24} color="#111827" numberOfLines={1} style={styles.songTitle}>
              {musicInfo.name || 'Midnight City Echoes'}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Icon name="love" rawSize={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <Text size={18} color={coverTheme.accent} numberOfLines={1} style={styles.singer}>
            {musicInfo.singer || 'Neon Dreamer'}
          </Text>
          <View style={styles.snippetWrap}>
            <Text size={12} color="#9ca3af" numberOfLines={1}>
              Searching for the light in the shadows of the street...
            </Text>
          </View>
          <View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: toPercent(progress, maxPlayTime), backgroundColor: coverTheme.accent }]} />
            </View>
            <View style={styles.timeRow}>
              <Text size={11} color="#9ca3af" style={styles.timeText}>{nowPlayTimeStr}</Text>
              <Text size={11} color="#9ca3af" style={styles.timeText}>{maxPlayTimeStr}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.smallBtn} activeOpacity={0.8}>
          <Icon name="list-loop" rawSize={22} color="#9ca3af" />
        </TouchableOpacity>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.mediumBtn} activeOpacity={0.8} onPress={() => { void playPrev() }}>
            <Icon name="prevMusic" rawSize={28} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.playBtn, { backgroundColor: coverTheme.accent, shadowColor: coverTheme.accent }]} activeOpacity={0.85} onPress={togglePlay}>
            <Icon name={isPlay ? 'pause' : 'play'} rawSize={34} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediumBtn} activeOpacity={0.8} onPress={() => { void playNext() }}>
            <Icon name="nextMusic" rawSize={28} color="#374151" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.smallBtn} activeOpacity={0.8}>
          <Icon name="menu" rawSize={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = createStyle({
  container: {
    flex: 1,
  },
  bgTintTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '62%',
    opacity: 0.62,
  },
  bgTintMiddle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
    opacity: 0.34,
  },
  header: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerUpper: {
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerTitle: {
    marginTop: 2,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  recordWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  recordTone: {
    position: 'absolute',
    top: -6,
    right: -8,
    width: 70,
    height: 100,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    transform: [{ rotate: '12deg' }],
    opacity: 0.75,
  },
  record: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 4,
    borderColor: 'rgba(15,23,42,0.1)',
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  recordInner: {
    width: '46%',
    height: '46%',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  songInfo: {
    width: '100%',
    maxWidth: 420,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  songTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    marginHorizontal: 10,
  },
  singer: {
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12,
  },
  snippetWrap: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  timeRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediumBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
})
