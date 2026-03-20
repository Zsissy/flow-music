import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useKeyboard } from '@/utils/hooks'
import { createStyle } from '@/utils/tools'
import Image from '@/components/common/Image'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { useIsPlay, usePlayerMusicInfo } from '@/store/player/hook'
import { collectMusic, togglePlay, uncollectMusic } from '@/core/player/player'
import { useSettingValue } from '@/store/setting/hook'
import commonState from '@/store/common/state'
import { navigations } from '@/navigation'
import { getListMusics } from '@/core/list'
import { LIST_IDS } from '@/config/constant'
import { useI18n } from '@/lang'

export default memo(({ isHome = false }: { isHome?: boolean }) => {
  const t = useI18n()
  const { keyboardShown } = useKeyboard()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')
  const musicInfo = usePlayerMusicInfo()
  const isPlay = useIsPlay()
  const loveCheckId = useRef(0)
  const [isLoved, setIsLoved] = useState(false)

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
              <Image url={musicInfo.pic} style={styles.pic} />
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
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#7f0df2',
    padding: 3,
  },
  pic: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
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
    backgroundColor: '#7f0df2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7f0df2',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
})
