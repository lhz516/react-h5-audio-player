import {
  SAMPLE_MP3_URL,
  SAMPLE_MP3_URL_B,
  SAMPLE_MP3_URL_C,
  SAMPLE_URL_A_OGG,
  SAMPLE_URL_A_MP3,
  SAMPLE_URL_A_FLAC,
  SAMPLE_URL_B_OGG,
  SAMPLE_URL_B_MP3,
  SAMPLE_URL_B_FLAC,
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
    src: SAMPLE_URL_A_OGG,
    type: 'audio/ogg',
    additionalSrcs: [
      { src: SAMPLE_URL_A_MP3, type: 'audio/mpeg' },
      { src: SAMPLE_URL_A_FLAC, type: 'audio/flac' },
    ]
  },
  {
    src: SAMPLE_URL_B_OGG,
    type: 'audio/ogg',
    additionalSrcs: [
      { src: SAMPLE_URL_B_MP3, type: 'audio/mpeg' },
      { src: SAMPLE_URL_B_FLAC,type: 'audio/flac' },
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
