import { useEffect, useRef, useState } from 'react'
import { Keyboard, Modal, ScrollView, Switch, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import FileSelect, { type FileSelectType } from '@/components/common/FileSelect'
import Input from '@/components/common/Input'
import { createStyle } from '@/utils/tools'
import { useStatusbarHeight } from '@/store/common/hook'
import Source, { type SourceType } from '@/screens/Home/Views/Setting/settings/Basic/Source'
import Sync, { type SyncType } from '@/screens/Home/Views/Setting/settings/Sync'
import { getUserName, saveUserAvatar, saveUserName } from '@/utils/data'
import { useTheme } from '@/store/theme/hook'

const SHOW_ADVANCED_SWITCHES = false
const DEFAULT_USER_NAME = 'Alex Rivera'

const settingItems = [
  { title: 'App Theme', subtitle: 'Light Mode', icon: 'setting', enabled: true },
  { title: 'High Quality Streaming', subtitle: 'Use better audio quality on Wi-Fi', icon: 'play', enabled: true },
  { title: 'Download over Cellular', subtitle: 'Allow mobile data download', icon: 'download-2', enabled: false },
  { title: 'Show Notifications', subtitle: 'Mini controls on lock screen', icon: 'menu', enabled: true },
]

export default () => {
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  const headerTopPadding = statusBarHeight + 8
  const headerHeight = headerTopPadding + 46 + 8
  const sourceRef = useRef<SourceType>(null)
  const syncRef = useRef<SyncType>(null)
  const avatarFileRef = useRef<FileSelectType>(null)
  const [nickname, setNickname] = useState(DEFAULT_USER_NAME)
  const [nicknameDraft, setNicknameDraft] = useState(DEFAULT_USER_NAME)
  const [isNameModalVisible, setNameModalVisible] = useState(false)

  useEffect(() => {
    let isUnmounted = false
    void getUserName().then((name) => {
      if (isUnmounted) return
      const value = name ?? DEFAULT_USER_NAME
      setNickname(value)
      setNicknameDraft(value)
    })

    const handleNameUpdate = (name: string) => {
      const value = name.trim() ? name : DEFAULT_USER_NAME
      setNickname(value)
      setNicknameDraft(value)
    }
    global.app_event.on('userNameUpdated', handleNameUpdate)

    return () => {
      isUnmounted = true
      global.app_event.off('userNameUpdated', handleNameUpdate)
    }
  }, [])

  const handleAddSource = () => {
    sourceRef.current?.showAddPicker()
  }
  const handleAddSyncHost = () => {
    syncRef.current?.showHostInput()
  }
  const handlePickAvatar = () => {
    avatarFileRef.current?.show({
      title: '\u9009\u62e9\u5934\u50cf\u56fe\u7247',
      dirOnly: false,
      filter: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
    }, (path) => {
      void saveUserAvatar(path).then(() => {
        global.app_event.userAvatarUpdated(path)
      })
    })
  }
  const handleShowNameModal = () => {
    setNicknameDraft(nickname)
    setNameModalVisible(true)
  }
  const handleCloseNameModal = () => {
    setNicknameDraft(nickname)
    setNameModalVisible(false)
  }
  const handleSaveName = () => {
    const draft = nicknameDraft.trim()
    const current = nickname.trim()
    let newName = DEFAULT_USER_NAME
    if (current) newName = current
    if (draft) newName = draft
    void saveUserName(newName).then(() => {
      setNickname(newName)
      global.app_event.userNameUpdated(newName)
      setNameModalVisible(false)
    })
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, styles.headerFloating, { paddingTop: headerTopPadding }]}>
        <View style={styles.searchWrap}>
          <Icon name="search-2" rawSize={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search settings..."
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + 12 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={styles.titleArea}>
          <Text size={28} color="#111827" style={styles.pageTitle}>Settings</Text>
        </View>

        <View style={styles.list}>
          <View style={styles.sectionCard}>
            <Text size={15} color="#111827" style={styles.cardTitle}>{'\u4e2a\u4eba\u8bbe\u7f6e'}</Text>
            <TouchableOpacity style={styles.profileRow} activeOpacity={0.75} onPress={handlePickAvatar}>
              <View style={styles.profileLeft}>
                <View style={styles.profileIconWrap}>
                  <Icon name="album" rawSize={16} color="#5b6474" />
                </View>
                <Text size={14} color="#111827" style={styles.profileLabel}>{'\u5934\u50cf\u9009\u62e9'}</Text>
              </View>
              <Icon name="chevron-right-2" rawSize={16} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileRow} activeOpacity={0.75} onPress={handleShowNameModal}>
              <View style={styles.profileLeft}>
                <View style={styles.profileIconWrap}>
                  <Icon name="menu" rawSize={16} color="#5b6474" />
                </View>
                <Text size={14} color="#111827" style={styles.profileLabel}>{'\u6635\u79f0\u7f16\u8f91'}</Text>
              </View>
              <Icon name="chevron-right-2" rawSize={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.cardTitleRow}>
              <Text size={15} color="#111827" style={styles.cardTitleNoMargin}>{'\u97f3\u4e50\u64ad\u653e'}</Text>
              <TouchableOpacity style={styles.addBtn} activeOpacity={0.75} onPress={handleAddSource}>
                <Text size={18} color="#111827" style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Source ref={sourceRef} embedded />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.cardTitleRow}>
              <Text size={15} color="#111827" style={styles.cardTitleNoMargin}>{'\u6570\u636e\u540c\u6b65'}</Text>
              <TouchableOpacity style={styles.addBtn} activeOpacity={0.75} onPress={handleAddSyncHost}>
                <Text size={18} color="#111827" style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Sync ref={syncRef} embedded />
          </View>
        </View>

        {
          SHOW_ADVANCED_SWITCHES ? (
            <View style={styles.list}>
              {settingItems.map(item => (
                <View key={item.title} style={styles.item}>
                  <View style={styles.left}>
                    <View style={styles.iconBox}>
                      <Icon name={item.icon} rawSize={18} color="#7f0df2" />
                    </View>
                    <View style={styles.textWrap}>
                      <Text size={14} color="#111827" style={styles.itemTitle}>{item.title}</Text>
                      <Text size={11} color="#6b7280">{item.subtitle}</Text>
                    </View>
                  </View>
                  <Switch value={item.enabled} trackColor={{ false: '#d1d5db', true: '#c4b5fd' }} thumbColor={item.enabled ? '#7f0df2' : '#f9fafb'} />
                </View>
              ))}
            </View>
          ) : null
        }
      </ScrollView>
      <FileSelect ref={avatarFileRef} />
      <Modal
        visible={isNameModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleCloseNameModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text size={17} color="#111827" style={styles.modalTitle}>{'\u6635\u79f0\u7f16\u8f91'}</Text>
                <Input
                  placeholder={('\u8bf7\u8f93\u5165\u6635\u79f0')}
                  value={nicknameDraft}
                  onChangeText={setNicknameDraft}
                  style={[styles.modalInput, { backgroundColor: theme['c-primary-background'] }]}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={handleCloseNameModal} activeOpacity={0.75}>
                    <Text size={14} color="#4b5563">{'\u53d6\u6d88'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleSaveName} activeOpacity={0.85}>
                    <Text size={14} color="#111827" style={styles.modalBtnPrimaryText}>{'\u4fdd\u5b58'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = createStyle({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingBottom: 18,
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 6,
    backgroundColor: '#f8f9fa',
  },
  searchWrap: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#111827',
    fontSize: 13,
    paddingVertical: 0,
  },
  titleArea: {
    paddingHorizontal: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  pageTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f1f3',
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitleNoMargin: {
    fontWeight: '700',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    lineHeight: 22,
    fontWeight: '600',
  },
  profileRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  profileLabel: {
    fontWeight: '500',
  },
  item: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f1f3',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    marginLeft: 10,
    flex: 1,
  },
  itemTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eef0f3',
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    borderRadius: 12,
    height: 44,
  },
  modalActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flexGrow: 1,
    flexShrink: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnGhost: {
    backgroundColor: '#f3f4f6',
  },
  modalBtnPrimary: {
    backgroundColor: '#e5e7eb',
  },
  modalBtnPrimaryText: {
    fontWeight: '600',
  },
})
