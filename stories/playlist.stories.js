import {
  SAMPLE_MP3_URL,
  SAMPLE_MP3_URL_B,
  SAMPLE_MP3_URL_C,
  BRAHMS_OGG_URL,
  BRAHMS_MP3_URL,
  BRAHMS_FLAC_URL,
  MOZART_OGG_URL,
  MOZART_MP3_URL,
  MOZART_FLAC_URL,
} from './utils.js'
import PlayList from "./playlist.tsx";
import React from "react";

const mp3Playlist = [
  { src: SAMPLE_MP3_URL, type: 'audio/mpeg' },
  { src: SAMPLE_MP3_URL_B, type: 'audio/mpeg' },
  { src: SAMPLE_MP3_URL_C, type: 'audio/mpeg'},
]

const multiSourcePlaylist = [
  {
    src: BRAHMS_OGG_URL,
    type: 'audio/ogg',
    additionalSrcs: [
      { src: BRAHMS_MP3_URL, type: 'audio/mpeg' },
      { src: BRAHMS_FLAC_URL, type: 'audio/flac' },
    ]
  },
  {
    src: MOZART_OGG_URL,
    type: 'audio/ogg',
    additionalSrcs: [
      { src: MOZART_MP3_URL, type: 'audio/mpeg' },
      { src: MOZART_FLAC_URL, type: 'audio/flac' },
    ]
  }  
]

export default {
  title: "Play List",
  component: PlayList,
};

export const Playlist = {
  render: () => <PlayList playlist={mp3Playlist} />,
  name: "Playlist",
};

export const PlaylistWithSourceElements = {
  render: () => <PlayList playlist={multiSourcePlaylist} useSourceElements={true} />,
  name: "Playlist with <source> elements",
};
