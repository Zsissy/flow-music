import { BorderRadius } from '@/theme'
import { createStyle } from '@/utils/tools'
import { memo, useCallback, useEffect, useState } from 'react'
import { View, type ViewProps, Image as _Image, StyleSheet } from 'react-native'
import FastImage, { type FastImageProps } from '@d11/react-native-fast-image'
import loadFailPic from '../../../assets/img/loadfail.png'
export type { OnLoadEvent } from '@d11/react-native-fast-image'

export interface ImageProps extends ViewProps {
  style: FastImageProps['style']
  url?: string | number | null
  cache?: boolean
  resizeMode?: FastImageProps['resizeMode']
  blurRadius?: number
  showFallback?: boolean
  onError?: (url: string | number) => void
}


export const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
}

const EmptyPic = memo(({ style, nativeID }: { style: ImageProps['style'], nativeID: ImageProps['nativeID'] }) => {
  return (
    <View style={StyleSheet.compose(styles.emptyPicWrap, style)} nativeID={nativeID}>
      <_Image source={loadFailPic} style={styles.emptyPicImage} resizeMode="cover" />
    </View>
  )
})

const Image = memo(({ url, cache, resizeMode = FastImage.resizeMode.cover, blurRadius, showFallback = true, style, onError, nativeID }: ImageProps) => {
  const [isLoaded, setLoaded] = useState(false)
  const [isError, setError] = useState(false)

  const handleLoad = useCallback(() => {
    setLoaded(true)
    setError(false)
  }, [])

  const handleError = useCallback(() => {
    setLoaded(false)
    setError(true)
    onError?.(url!)
  }, [onError, url])

  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [url])

  let uri = typeof url == 'number'
    ? _Image.resolveAssetSource(url).uri
    : url?.startsWith('/')
      ? 'file://' + url
      : url

  if (!uri) return <EmptyPic style={style} nativeID={nativeID} />

  const showNetworkImage = isLoaded && !isError

  return (
    <View style={StyleSheet.compose(styles.imageWrap, style)}>
      {showFallback ? <_Image source={loadFailPic} style={styles.imageLayer} resizeMode="cover" /> : null}
      <FastImage
        style={StyleSheet.compose(styles.imageLayer, showNetworkImage ? undefined : styles.hiddenLayer)}
        transition="fade"
        source={{
          uri,
          headers: defaultHeaders,
          priority: FastImage.priority.normal,
          cache: cache === false ? 'web' : 'immutable',
        }}
        onError={handleError}
        onLoad={handleLoad}
        resizeMode={resizeMode}
        blurRadius={blurRadius}
        nativeID={nativeID}
      />
    </View>
  )
}, (prevProps, nextProps) => {
  return prevProps.url == nextProps.url &&
    prevProps.style == nextProps.style &&
    prevProps.nativeID == nextProps.nativeID &&
    prevProps.blurRadius == nextProps.blurRadius &&
    prevProps.showFallback == nextProps.showFallback
})

export const getSize = (uri: string, success: (width: number, height: number) => void, failure?: (error: any) => void) => {
  _Image.getSize(uri, success, failure)
}
export const clearMemoryCache = async() => {
  return Promise.all([FastImage.clearMemoryCache(), FastImage.clearDiskCache()])
}
export default Image

const styles = createStyle({
  emptyPicWrap: {
    borderRadius: BorderRadius.normal,
    overflow: 'hidden',
  },
  emptyPicImage: {
    width: '100%',
    height: '100%',
  },
  imageWrap: {
    overflow: 'hidden',
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  hiddenLayer: {
    opacity: 0,
  },
})
