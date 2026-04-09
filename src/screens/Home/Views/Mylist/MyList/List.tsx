import { memo, useEffect, useRef } from 'react'
import { View, TouchableOpacity, FlatList, type NativeScrollEvent, type NativeSyntheticEvent, type FlatListProps } from 'react-native'

import { Icon } from '@/components/common/Icon'
import { LiquidIconFrame } from '@/components/common/LiquidIcon'

import { useTheme } from '@/store/theme/hook'
import { useActiveListId, useMyList } from '@/store/list/hook'
import { createStyle } from '@/utils/tools'
import { LIST_SCROLL_POSITION_KEY } from '@/config/constant'
import { getListPosition, saveListPosition } from '@/utils/data'
import { setActiveList } from '@/core/list'
import Text from '@/components/common/Text'
import { type Position } from './ListMenu'
import { scaleSizeH } from '@/utils/pixelRatio'

type FlatListType = FlatListProps<LX.List.MyListInfo>

const ITEM_HEIGHT = scaleSizeH(56)

const ListItem = memo(({ item, index, activeId, onPress, onShowMenu }: {
  onPress: (item: LX.List.MyListInfo) => void
  index: number
  activeId: string
  item: LX.List.MyListInfo
  onShowMenu: (item: LX.List.MyListInfo, index: number, position: { x: number, y: number, w: number, h: number }) => void
}) => {
  const theme = useTheme()
  const moreButtonRef = useRef<TouchableOpacity>(null)
  const active = activeId == item.id

  const handleShowMenu = () => {
    if (moreButtonRef.current?.measure) {
      moreButtonRef.current.measure((fx, fy, width, height, px, py) => {
        // console.log(fx, fy, width, height, px, py)
        onShowMenu(item, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
      })
    }
  }

  const handlePress = () => {
    onPress(item)
  }

  return (
    <View style={[styles.listItem, { height: ITEM_HEIGHT }, active ? styles.listItemActive : null]}>
      <View pointerEvents="none" style={[styles.listItemGlassBase, active ? styles.listItemGlassBaseActive : null]} />
      <View pointerEvents="none" style={styles.listItemGlassTone} />
      <View pointerEvents="none" style={styles.listItemGlassGlossTop} />
      <View pointerEvents="none" style={styles.listItemGlassInnerBorder} />
      <View pointerEvents="none" style={styles.listItemGlassEdgeGlow} />
      <View style={[styles.cover, active ? styles.coverActive : null]}>
        <Text size={12} color={theme['c-primary']}>{item.name.slice(0, 1)}</Text>
      </View>
      <TouchableOpacity style={styles.listName} onPress={handlePress}>
        <Text numberOfLines={1} color={active ? theme['c-primary'] : theme['c-font']}>{item.name}</Text>
        <Text size={11} color={theme['c-500']}>Playlist</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleShowMenu} ref={moreButtonRef} style={styles.listMoreBtn}>
        <LiquidIconFrame style={styles.listMoreIcon}>
          <Icon name="dots-vertical" color={theme['c-350']} size={12} />
        </LiquidIconFrame>
      </TouchableOpacity>
    </View>
  )
}, (prevProps, nextProps) => {
  return !!(prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.item.name == nextProps.item.name &&
    prevProps.activeId != nextProps.item.id &&
    nextProps.activeId != nextProps.item.id
  )
})


export default ({ onShowMenu }: {
  onShowMenu: (info: { listInfo: LX.List.MyListInfo, index: number }, position: Position) => void
}) => {
  const flatListRef = useRef<FlatList>(null)
  const allList = useMyList()
  const activeListId = useActiveListId()

  const handleToggleList = (item: LX.List.MyListInfo) => {
    // setVisiblePanel(false)
    global.app_event.changeLoveListVisible(false)
    requestAnimationFrame(() => {
      setActiveList(item.id)
    })
  }


  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    void saveListPosition(LIST_SCROLL_POSITION_KEY, nativeEvent.contentOffset.y)
  }

  const showMenu = (listInfo: LX.List.MyListInfo, index: number, position: Position) => {
    onShowMenu({ listInfo, index }, position)
  }

  useEffect(() => {
    void getListPosition(LIST_SCROLL_POSITION_KEY).then((offset) => {
      flatListRef.current?.scrollToOffset({ offset, animated: false })
    })
  }, [])

  const renderItem: FlatListType['renderItem'] = ({ item, index }) => (
    <ListItem
      key={item.id}
      item={item}
      index={index}
      activeId={activeListId}
      onPress={handleToggleList}
      onShowMenu={showMenu}
    />
  )
  const getkey: FlatListType['keyExtractor'] = item => item.id
  const getItemLayout: FlatListType['getItemLayout'] = (data, index) => {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
  }

  return (
    <FlatList
      ref={flatListRef}
      onScroll={handleScroll}
      style={styles.container}
      data={allList}
      maxToRenderPerBatch={9}
      // updateCellsBatchingPeriod={80}
      windowSize={9}
      removeClippedSubviews={true}
      initialNumToRender={18}
      renderItem={renderItem}
      keyExtractor={getkey}
      // extraData={activeIndex}
      getItemLayout={getItemLayout}
    />
  )
}


const styles = createStyle({
  container: {
    flexShrink: 1,
    flexGrow: 0,
  },
  // listContainer: {
  //   // borderBottomWidth: BorderWidths.normal2,
  // },

  listItem: {
    position: 'relative',
    height: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    paddingLeft: 8,
    borderWidth: 1,
    borderRadius: 18,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(206,220,228,0.4)',
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#9db4c1',
    shadowOpacity: 0.28,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },
  listItemActive: {
    shadowOpacity: 0.34,
    shadowRadius: 15,
    elevation: 9,
  },
  listItemGlassBase: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(190,208,218,0.34)',
  },
  listItemGlassBaseActive: {
    backgroundColor: 'rgba(186,206,218,0.42)',
  },
  listItemGlassTone: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(224,232,238,0.14)',
  },
  listItemGlassGlossTop: {
    position: 'absolute',
    left: 7,
    right: 7,
    top: 5,
    height: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  listItemGlassInnerBorder: {
    position: 'absolute',
    left: 1.5,
    top: 1.5,
    right: 1.5,
    bottom: 1.5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  listItemGlassEdgeGlow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 4,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  cover: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(221,233,240,0.28)',
  },
  coverActive: {
    backgroundColor: 'rgba(225,236,244,0.38)',
  },
  listName: {
    height: '100%',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 1,
    paddingLeft: 12,
  },
  // listNameText: {
  //   // height: 46,
  //   fontSize: 14,
  // },
  listMoreBtn: {
    height: '100%',
    width: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listMoreIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
  },
})
