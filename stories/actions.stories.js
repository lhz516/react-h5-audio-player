import { action } from "@storybook/addon-actions";
import { SAMPLE_MP3_URL } from "./utils";
import AudioPlayer from "../src/index.tsx";
import React from "react";

export default {
  title: "Actions",
  component: AudioPlayer,
};

export const Actions = {
  render: () => (
    <AudioPlayer
      onAbort={action("onAbort")}
      onCanPlay={action("onCanPlay")}
      onCanPlayThrough={action("onCanPlayThrough")}
      onEnded={action("onEnded")}
      onPlaying={action("onPlaying")}
      onSeeking={action("onSeeking")}
      onSeeked={action("onSeeked")}
      onLoadStart={action("onLoadStart")}
      onLoadedMetaData={action("onLoadedMetaData")}
      onLoadedData={action("onLoadedData")}
      onError={action("onError")}
      onListen={action("onListen")}
      onVolumeChange={action("onVolumeChange")}
      onPause={action("onPause")}
      onPlay={action("onPlay")}
      onChangeCurrentTimeError={action("onChangeCurrentTimeError")}
      onClickPrevious={action("onClickPrevious")}
      onClickNext={action("onClickNext")}
      volume={0.8}
      showSkipControls
      progressUpdateInterval={100}
      src="https://assets.alllq.in/prod/AQ/content/audios/EnglishFluency/U1/A5/6-3-te.mp3"
    />
  ),

  name: "Actions",
};
