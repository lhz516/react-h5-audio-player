import { SAMPLE_MP3_URL } from "./utils";
import AudioPlayer from "../src/index.tsx";
import React from "react";

export default {
  title: "Update Intervals",
  component: AudioPlayer,
};

export const Compares = {
  render: () => (
    <div>
      <p>50ms</p>
      <AudioPlayer autoPlay progressUpdateInterval={50} src={SAMPLE_MP3_URL} />
      <p>500ms</p>
      <AudioPlayer
        autoPlay
        progressUpdateInterval={500}
        src={SAMPLE_MP3_URL}
        muted
      />
      <p>1000ms</p>
      <AudioPlayer
        autoPlay
        progressUpdateInterval={1000}
        src={SAMPLE_MP3_URL}
        muted
      />
    </div>
  ),

  name: "Compares",
};
