import Content from './Content'
import PlayerBar from '@/components/player/PlayerBar'
import BottomNav from './BottomNav'
import StatusBar from '@/components/common/StatusBar'

export default () => {
  return (
    <>
      <StatusBar />
      <Content />
      <PlayerBar isHome />
      <BottomNav />
    </>
  )
}
