import { memo, useCallback, useMemo, useRef } from 'react'

import { View } from 'react-native'

import SubTitle from '../../components/SubTitle'
import CheckBox from '@/components/common/CheckBox'
import { createStyle } from '@/utils/tools'
import { setApiSource } from '@/core/apiSource'
import { useI18n } from '@/lang'
import apiSourceInfo from '@/utils/musicSdk/api-source-info'
import { useSettingValue } from '@/store/setting/hook'
import { useStatus, useUserApiList } from '@/store/userApi'
import Button from '../../components/Button'
import UserApiEditModal, { type UserApiEditModalType } from './UserApiEditModal'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
// import { importUserApi, removeUserApi } from '@/core/userApi'

const apiSourceList = apiSourceInfo.map(api => ({
  id: api.id,
  name: api.name,
  disabled: api.disabled,
}))

interface SourceProps {
  embedded?: boolean
}

const useActive = (id: string) => {
  const activeLangId = useSettingValue('common.apiSource')
  const isActive = useMemo(() => activeLangId == id, [activeLangId, id])
  return isActive
}

const Item = ({ id, name, desc, statusLabel, change, embedded = false, isLast = false }: {
  id: string
  name: string
  desc?: string
  statusLabel?: string
  change: (id: string) => void
  embedded?: boolean
  isLast?: boolean
}) => {
  const isActive = useActive(id)
  const theme = useTheme()

  const content = (
    <CheckBox marginBottom={embedded ? 0 : 5} check={isActive} onChange={() => { change(id) }} need>
      <Text style={styles.sourceLabel}>
        {name}
        {
          desc ? <Text style={styles.sourceDesc} color={theme['c-500']} size={13}>  {desc}</Text> : null
        }
        {
          statusLabel ? <Text style={styles.sourceStatus} size={13}>  {statusLabel}</Text> : null
        }
      </Text>
    </CheckBox>
  )

  if (!embedded) return content

  return (
    <View style={[styles.embeddedItem, !isLast && styles.embeddedItemBorder]}>
      {content}
    </View>
  )
}

export default memo(({ embedded = false }: SourceProps) => {
  const t = useI18n()
  const list = useMemo(() => apiSourceList.map(s => ({
    // @ts-expect-error
    name: t(`setting_basic_source_${s.id}`) || s.name,
    id: s.id,
  })), [t])
  const setApiSourceId = useCallback((id: string) => {
    setApiSource(id)
  }, [])
  const userApiListRaw = useUserApiList()
  const apiStatus = useStatus()
  const apiSourceSetting = useSettingValue('common.apiSource')
  const userApiList = useMemo(() => {
    const getApiStatus = () => {
      let status
      if (apiStatus.status) status = t('setting_basic_source_status_success')
      else if (apiStatus.message == 'initing') status = t('setting_basic_source_status_initing')
      else status = t('setting_basic_source_status_failed')

      return status
    }
    return userApiListRaw.map(api => {
      const statusLabel = api.id == apiSourceSetting ? `[${getApiStatus()}]` : ''
      return {
        id: api.id,
        name: api.name,
        label: `${api.name}${statusLabel}`,
        desc: [/^\d/.test(api.version) ? `v${api.version}` : api.version].filter(Boolean).join(', '),
        statusLabel,
      }
    })
  }, [userApiListRaw, apiStatus, apiSourceSetting, t])

  const mergedList = useMemo(() => {
    const builtIn = list.map(item => ({ ...item, desc: undefined as string | undefined, statusLabel: undefined as string | undefined }))
    const custom = userApiList.map(item => ({ id: item.id, name: item.name, desc: item.desc, statusLabel: item.statusLabel }))
    return [...builtIn, ...custom]
  }, [list, userApiList])

  const modalRef = useRef<UserApiEditModalType>(null)
  const handleShow = () => {
    modalRef.current?.show()
  }

  const content = (
    <>
      <View style={[styles.list, embedded && styles.listEmbedded]}>
        {
          mergedList.map((item, index) => (
            <Item
              name={item.name}
              desc={item.desc}
              statusLabel={item.statusLabel}
              id={item.id}
              key={`${item.id}_${index}`}
              change={setApiSourceId}
              embedded={embedded}
              isLast={index === mergedList.length - 1}
            />
          ))
        }
      </View>
      <View style={[styles.btn, embedded && styles.btnEmbedded]}>
        <Button onPress={handleShow}>{t('setting_basic_source_user_api_btn')}</Button>
      </View>
      <UserApiEditModal ref={modalRef} />
    </>
  )

  if (embedded) {
    return <View style={styles.embeddedContainer}>{content}</View>
  }

  return (
    <SubTitle title={t('setting_basic_source')}>
      {content}
    </SubTitle>
  )
})

const styles = createStyle({
  embeddedContainer: {
    marginTop: 2,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  listEmbedded: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#edf0f3',
    backgroundColor: '#fafbfc',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  embeddedItem: {
    paddingVertical: 5,
  },
  embeddedItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f3',
  },
  btn: {
    marginTop: 10,
    flexDirection: 'row',
  },
  btnEmbedded: {
    marginTop: 12,
    marginLeft: 2,
    marginBottom: 4,
  },
  sourceLabel: {

  },
  sourceDesc: {

  },
  sourceStatus: {

  },
})
