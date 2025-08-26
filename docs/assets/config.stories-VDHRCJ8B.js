import{j as s}from"./iframe-DKmbwMFx.js";import{S as o}from"./utils-MesXHYS8.js";import{H as a}from"./index-C4iBZ5Tl.js";import"./preload-helper-D9Z9MdNV.js";const m={title:"Config",component:a},r={render:()=>s.jsx(a,{progressJumpSteps:{forward:3e4,backward:1e4},src:o}),name:"Forward and backward jump step",height:"auto"},e={render:()=>s.jsx(a,{progressJumpStep:1e4,src:o}),name:"Deprecated jump step",height:"auto"};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer progressJumpSteps={{
    forward: 30000,
    backward: 10000
  }} src={SAMPLE_MP3_URL} />,
  name: 'Forward and backward jump step',
  height: 'auto'
}`,...r.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer progressJumpStep={10000} src={SAMPLE_MP3_URL} />,
  name: 'Deprecated jump step',
  height: 'auto'
}`,...e.parameters?.docs?.source}}};const c=["ForwardAndBackwardJumpStep","DeprecatedJumpStep"];export{e as DeprecatedJumpStep,r as ForwardAndBackwardJumpStep,c as __namedExportsOrder,m as default};
