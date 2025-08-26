import{j as r}from"./iframe-DKmbwMFx.js";import{S as a}from"./utils-MesXHYS8.js";import{H as s}from"./index-C4iBZ5Tl.js";import"./preload-helper-D9Z9MdNV.js";const d={title:"Update Intervals",component:s},e={render:()=>r.jsxs("div",{children:[r.jsx("p",{children:"50ms"}),r.jsx(s,{autoPlay:!0,progressUpdateInterval:50,src:a}),r.jsx("p",{children:"500ms"}),r.jsx(s,{autoPlay:!0,progressUpdateInterval:500,src:a,muted:!0}),r.jsx("p",{children:"1000ms"}),r.jsx(s,{autoPlay:!0,progressUpdateInterval:1e3,src:a,muted:!0})]}),name:"Compares"};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <p>50ms</p>
      <AudioPlayer autoPlay progressUpdateInterval={50} src={SAMPLE_MP3_URL} />
      <p>500ms</p>
      <AudioPlayer autoPlay progressUpdateInterval={500} src={SAMPLE_MP3_URL} muted />
      <p>1000ms</p>
      <AudioPlayer autoPlay progressUpdateInterval={1000} src={SAMPLE_MP3_URL} muted />
    </div>,
  name: "Compares"
}`,...e.parameters?.docs?.source}}};const m=["Compares"];export{e as Compares,m as __namedExportsOrder,d as default};
