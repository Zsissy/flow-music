import { useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { View } from 'react-native'

// import music from '@/utils/musicSdk'
// import InsetShadow from 'react-native-inset-shadow'
import SourceSelector, {
  type SourceSelectorType as _SourceSelectorType,
  type SourceSelectorProps as _SourceSelectorProps,
} from '@/components/SourceSelector'
import { type SearchInputProps } from './SearchInput'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { type Source as MusicSource } from '@/store/search/music/state'
import { type Source as SonglistSource } from '@/store/search/songlist/state'
import SearchBar, { type SearchBarType } from '@/components/modern/SearchBar'

type Sources = Readonly<Array<MusicSource | SonglistSource>>
type SourceSelectorProps = _SourceSelectorProps<Sources>
type SourceSelectorType = _SourceSelectorType<Sources>

export interface HeaderBarProps {
  onSourceChange: SourceSelectorProps['onSourceChange']
  onTipSearch: SearchInputProps['onChangeText']
  onSearch: SearchInputProps['onSubmit']
  onHideTipList: SearchInputProps['onBlur']
  onShowTipList: SearchInputProps['onTouchStart']
}

export interface HeaderBarType {
  setSourceList: SourceSelectorType['setSourceList']
  setText: (text: string) => void
  blur: () => void
}


export default forwardRef<HeaderBarType, HeaderBarProps>(({ onSourceChange, onTipSearch, onSearch, onHideTipList, onShowTipList }, ref) => {
  const sourceSelectorRef = useRef<SourceSelectorType>(null)
  const searchBarRef = useRef<SearchBarType>(null)
  const theme = useTheme()
  const [text, setText] = useState('')

  useImperativeHandle(ref, () => ({
    setSourceList(list, source) {
      sourceSelectorRef.current?.setSourceList(list, source)
    },
    setText(text) {
      setText(text)
    },
    blur() {
      searchBarRef.current?.blur()
    },
  }), [])


  return (
    <View style={{ ...styles.searchBar, backgroundColor: theme['c-app-background'] }}>
      <SearchBar
        ref={searchBarRef}
        value={text}
        onChangeText={(v) => { setText(v); onTipSearch(v) }}
        onSubmitEditing={({ nativeEvent }) => onSearch(nativeEvent.text)}
        onBlur={onHideTipList}
        onTouchStart={onShowTipList}
        placeholder="Search songs, artists, albums..."
      />
      <View style={styles.selector}>
        <SourceSelector ref={sourceSelectorRef} onSourceChange={onSourceChange} center />
      </View>
    </View>
  )
})

const styles = createStyle({
  searchBar: {
    zIndex: 2,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  selector: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
})
