import React, { PureComponent, createRef } from 'react'
import AudioPlayer from '../src/index'
import { SAMPLE_MP3_URL } from './utils'

const NR_OF_CHUNKS = 11
const CHUNK_DURATION = 5
const DURATION = NR_OF_CHUNKS * CHUNK_DURATION
const audioRootUrl = '//localhost:1337/audio-cenc/long_input_44100_192k_'
const unencryptedAudioChunks = [...Array(NR_OF_CHUNKS)].map((_, i) => `${('00' + i).slice(-3)}.mp4`)
const encryptedAudioChunks = [...Array(NR_OF_CHUNKS)].map((_, i) => `${('00' + i).slice(-3)}_cenc.mp4`)

const mimeType = 'audio/mp4; codecs="mp4a.40.2"'

const { KEY, KID } = {
  KEY: '7f412f0575f44f718259beef56ec7771',
  KID: '2fef8ad812df429783e9bf6e5e493e53',
}

const config = [
  {
    initDataTypes: ['cenc'], // keyids, cenc
    audioCapabilities: [{ contentType: mimeType }],
  },
]

let pendingPromise

function EnsureMediaKeysCreated(el, keySystem, options) {
  if (pendingPromise) {
    return pendingPromise
  }

  pendingPromise = navigator
    .requestMediaKeySystemAccess(keySystem, options)
    .then((keySystemAccess) => keySystemAccess.createMediaKeys())
    .then((mediaKeys) => el.setMediaKeys(mediaKeys))

  return pendingPromise
}

function ArrayBufferToString(arr) {
  let str = ''
  const view = new Uint8Array(arr)
  for (let i = 0; i < view.length; i++) {
    str += String.fromCharCode(view[i])
  }
  return str
}

function StringToArrayBuffer(str) {
  const arr = new ArrayBuffer(str.length)
  const view = new Uint8Array(arr)
  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i)
  }
  return arr
}

function HexToBase64(hex) {
  let bin = ''
  for (let i = 0; i < hex.length; i += 2) {
    bin += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  }
  return window.btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function handleMessage(ev) {
  const msgStr = JSON.parse(ArrayBufferToString(ev.message))

  const outKeys = []

  outKeys.push({
    kty: 'oct',
    alg: 'A128KW',
    kid: HexToBase64(KID),
    k: HexToBase64(KEY),
  })

  const update = JSON.stringify({
    keys: outKeys,
    type: msgStr.type,
  })

  ev.target.update(StringToArrayBuffer(update))
}

interface ChunkData {
  name: string
  data: BufferSource | null
  segmentTime: number
  chunkIndex: number
}

interface MediaSourcePlayerState {
  audioSrc: string
  srcDuration: number
}

interface MediaEncryptedEvent {
  target: HTMLAudioElement
  initDataType: string
  initData: BufferSource
}

class MediaSourcePlayer extends PureComponent<MediaSourcePlayer> {
  player = createRef<AudioPlayer>()
  mediaSource: MediaSource | null = null
  loadingChunk = false
  chunks: ChunkData[] = []
  whenBufferUpdateEndCallbacks = []
  sourceBuffer: any = null

  state: MediaSourcePlayerState = {
    audioSrc: '',
    srcDuration: void 0,
  }

  onEncrypted(ev: MediaEncryptedEvent): void {
    const audio: HTMLAudioElement = ev.target
    EnsureMediaKeysCreated(audio, 'org.w3.clearkey', config).then(() => {
      const session = audio.mediaKeys.createSession()
      session.addEventListener('message', handleMessage)

      return session.generateRequest(ev.initDataType, ev.initData)
    })

    // and for the storybook action
    this.props.onEncrypted(ev)
  }

  onSeek(audio: HTMLAudioElement, time: number): Promise<void> {
    const playlist = this.chunks
    const bufferIsCompleteUpToNewCurrentTime = playlist.every((chunk, i) => {
      const chunkStartTime = chunk.segmentTime * i
      return chunkStartTime > time || chunk.data
    })
    return new Promise((resolve) => {
      if (bufferIsCompleteUpToNewCurrentTime) {
        audio.currentTime = time
        this.checkBufferLoad()
        resolve()
      } else {
        if (!audio.paused) audio.pause()

        const firstChunkInNewSegment = playlist.find((chunk, i) => {
          const chunkEndTime = chunk.segmentTime * (i + 1)
          return chunkEndTime > time
        })

        // set the player time relative to the new time
        const segmentStartTime = firstChunkInNewSegment.segmentTime * firstChunkInNewSegment.chunkIndex
        this.onTimeUpdate()

        this.whenBufferUpdateEndCallbacks.push(() => {
          audio.currentTime = time
          this.checkBufferLoad()

          if (audio.paused) {
            audio.play().then(resolve)
          } else resolve()
        })

        // use or fetch buffers
        const timestampOffset = segmentStartTime
        this.loadChunk(firstChunkInNewSegment, timestampOffset)
      }
    })
  }

  onChunkLoad(): void {
    this.loadingChunk = false

    // do logic after chunk is loaded
    this.whenBufferUpdateEndCallbacks.forEach((fn) => fn())
    this.whenBufferUpdateEndCallbacks = []
  }

  checkBufferLoad(): void {
    if (this.loadingChunk) return
    const { sourceBuffer, mediaSource } = this

    const playlist = this.chunks
    const allDataLoaded = playlist.every((chunk) => chunk.data)
    if (allDataLoaded && mediaSource.readyState === 'open') {
      mediaSource.endOfStream()
    }
    if (allDataLoaded) return

    const audio = this.player.current.audio.current

    const futureNotLoadedChunkIndex = playlist.findIndex((chunk, i) => {
      const chunkstartTime = CHUNK_DURATION * i
      return chunkstartTime > audio.currentTime && !chunk.data
    })
    const nearestUnloadedChunkStartTime = futureNotLoadedChunkIndex * CHUNK_DURATION
    const remainingBufferToUse = nearestUnloadedChunkStartTime - audio.currentTime
    const bufferIsTooShort = remainingBufferToUse < CHUNK_DURATION

    if (bufferIsTooShort) {
      if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
        this.loadChunk(playlist[futureNotLoadedChunkIndex], nearestUnloadedChunkStartTime)
      }
    }
  }

  onTimeUpdate(): void {
    if (this.state.audioSrc === SAMPLE_MP3_URL) return
    this.checkBufferLoad()
  }

  setSong(chunkNames: string[]): void {
    this.chunks = chunkNames.map((filename, i) => ({
      name: audioRootUrl + filename,
      data: null,
      segmentTime: CHUNK_DURATION,
      chunkIndex: i,
    }))

    this.mediaSource = new MediaSource()
    const audioSrc = URL.createObjectURL(this.mediaSource)
    this.setState({ audioSrc, srcDuration: DURATION })

    this.mediaSource.addEventListener('sourceopen', () => {
      const audio = this.player.current.audio.current
      URL.revokeObjectURL(audio.src)
      this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType)

      this.loadChunk(this.chunks[0], 0)

      this.sourceBuffer.addEventListener('updateend', () => {
        this.onChunkLoad()
      })
    })
  }

  loadChunk(next: ChunkData, timestampOffset: number): void {
    if (!next) {
      this.mediaSource.endOfStream()
      return
    }
    this.loadingChunk = true

    fetch(next.name)
      .then((res) => res.arrayBuffer())
      .then((data) => {
        next.data = data
        if (typeof timestampOffset !== 'undefined') {
          this.sourceBuffer.timestampOffset = timestampOffset
        }
        this.sourceBuffer.appendBuffer(data)
      })
  }

  render(): React.ReactNode {
    return (
      <div>
        <button onClick={() => this.setSong(unencryptedAudioChunks)}>Play non encrypted audio</button>
        <button onClick={() => this.setSong(encryptedAudioChunks)}>Play encrypted audio</button>
        <button onClick={() => this.setState({ audioSrc: SAMPLE_MP3_URL, srcDuration: void 0 })}>
          Play normal progressive download audio
        </button>

        <AudioPlayer
          autoPlayAfterSrcChange={false}
          ref={this.player}
          src={this.state.audioSrc}
          useMSE={{
            srcDuration: this.state.srcDuration,
            onEcrypted: (e) => this.onEncrypted(e),
            onSeek: (audio, time) => this.onSeek(audio, time),
          }}
          onListen={() => this.onTimeUpdate()}
          listenInterval={250}
        />
      </div>
    )
  }
}

export default MediaSourcePlayer
