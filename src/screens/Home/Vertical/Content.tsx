import { View } from 'react-native'
import Main from './Main'
import { createStyle } from '@/utils/tools'

const Content = () => {
  return (
    <View style={styles.container}>
      <Main />
    </View>
  )
}

const styles = createStyle({
  container: {
    flex: 1,
  },
})

export default Content
