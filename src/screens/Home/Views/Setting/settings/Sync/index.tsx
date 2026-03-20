import { memo, useState } from 'react'

import { View } from 'react-native'

import Section from '../../components/Section'
import IsEnable from './IsEnable'
import History from './History'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
// import SyncHost from './SyncHost'

interface Props {
  embedded?: boolean
}

export default memo(({ embedded = false }: Props) => {
  const t = useI18n()

  const [host, setHost] = useState('')

  const content = (
    <>
      <IsEnable host={host} setHost={setHost} compact={embedded} />
      <History setHost={setHost} compact={embedded} />
    </>
  )

  if (embedded) {
    return <View style={styles.embeddedContainer}>{content}</View>
  }

  return (
    <Section title={t('setting_sync')}>
      {content}
    </Section>
  )
})

const styles = createStyle({
  embeddedContainer: {
    marginTop: 2,
  },
})
