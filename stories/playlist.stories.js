import { SAMPLE_MP3_URL } from "./utils";
import AudioPlayer from "../src/index.tsx";
import PlayList from "./playlist.tsx";
import React from "react";

export default {
  title: "Play List",
  component: PlayList,
};

export const Playlist = {
  render: () => <PlayList />,
  name: "playlist",
};
