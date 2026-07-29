import{r as A,j as e}from"./iframe-DHVN01Gt.js";import{S as s}from"./utils-MesXHYS8.js";import{H as r,R as o}from"./index-CoIUZD0E.js";import"./preload-helper-PPVm8Dsz.js";const L=()=>{const[_,t]=A.useState("100%"),p=A.useCallback(C=>{const U=C.target.volume;t(`${(U*100).toFixed(0)}%`)},[]);return e.jsx(r,{src:s,onVolumeChange:p,customVolumeControls:[o.VOLUME,e.jsxs("div",{children:["  ",_]},2)]})};L.__docgenInfo={description:"",methods:[],displayName:"VolumePercentage"};const g={layout:"stacked",customControlsSection:[o.CURRENT_TIME,o.CURRENT_LEFT_TIME],customProgressBarSection:[o.PROGRESS_BAR,o.MAIN_CONTROLS]},E=()=>{const[_,t]=A.useState({}),p=()=>t(g),C=()=>t({});return e.jsxs("div",{className:"container",children:[e.jsx("button",{onClick:p,children:"stacked"}),e.jsx("button",{onClick:C,children:"horizontal"}),e.jsx("h1",{children:"Hello, audio player!"}),e.jsx(r,{src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",volume:.5,layout:"stacked-reverse",..._})]})};E.__docgenInfo={description:"",methods:[],displayName:"ChangeLayout"};const O={title:"Layouts - Advanced",component:r},a={render:()=>e.jsx(r,{src:s}),name:"Stacked"},n={render:()=>e.jsx(r,{src:s,layout:"stacked-reverse"}),name:"Stacked Reverse"},c={render:()=>e.jsx(r,{src:s,layout:"horizontal"}),name:"Horizontal"},u={render:()=>e.jsx(r,{src:s,layout:"horizontal-reverse"}),name:"Horizontal Reverse"},m={render:()=>e.jsx(r,{src:s,customProgressBarSection:[o.PROGRESS_BAR,o.CURRENT_TIME,e.jsx("div",{children:"/"},"1"),o.DURATION]}),name:"Custom progress bar section"},i={render:()=>e.jsx(r,{src:s,customControlsSection:[e.jsx("div",{children:"This is an additional module in controls section"},"1"),o.ADDITIONAL_CONTROLS,o.MAIN_CONTROLS,o.VOLUME_CONTROLS]}),name:"Custom controls section"},d={render:()=>e.jsx(r,{src:s,customAdditionalControls:[o.LOOP,e.jsx("button",{children:"button 2 "},"1"),e.jsx("button",{children:"button 3 "},"2"),e.jsx("button",{children:"button 4 "},"3")]}),name:"Custom additional controls"},l={render:()=>e.jsx(L,{}),name:"Custom volume controls"},R={render:()=>e.jsx(r,{src:s,customProgressBarSection:[o.CURRENT_TIME,e.jsx("div",{children:"/"},"1"),o.DURATION,o.PROGRESS_BAR,o.VOLUME],customVolumeControls:[]}),name:"Move Volume control to Progress bar section"},S={render:()=>e.jsx(r,{src:s,customProgressBarSection:[o.CURRENT_TIME,o.PROGRESS_BAR,o.CURRENT_LEFT_TIME]}),name:"Use current left time"},P={render:()=>e.jsx(E,{}),name:"Change Layout"};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} />,
  name: 'Stacked'
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="stacked-reverse" />,
  name: 'Stacked Reverse'
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="horizontal" />,
  name: 'Horizontal'
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="horizontal-reverse" />,
  name: 'Horizontal Reverse'
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customProgressBarSection={[RHAP_UI.PROGRESS_BAR, RHAP_UI.CURRENT_TIME, <div key="1">/</div>, RHAP_UI.DURATION]} />,
  name: 'Custom progress bar section'
}`,...m.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customControlsSection={[<div key="1">This is an additional module in controls section</div>, RHAP_UI.ADDITIONAL_CONTROLS, RHAP_UI.MAIN_CONTROLS, RHAP_UI.VOLUME_CONTROLS]} />,
  name: 'Custom controls section'
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customAdditionalControls={[RHAP_UI.LOOP, <button key="1">button 2 </button>, <button key="2">button 3 </button>, <button key="3">button 4 </button>]} />,
  name: 'Custom additional controls'
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <VolumePercentage />,
  name: 'Custom volume controls'
}`,...l.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customProgressBarSection={[RHAP_UI.CURRENT_TIME, <div key="1">/</div>, RHAP_UI.DURATION, RHAP_UI.PROGRESS_BAR, RHAP_UI.VOLUME]} customVolumeControls={[]} />,
  name: 'Move Volume control to Progress bar section'
}`,...R.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.CURRENT_LEFT_TIME]} />,
  name: 'Use current left time'
}`,...S.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <ChangeLayout />,
  name: 'Change Layout'
}`,...P.parameters?.docs?.source}}};const v=["Stacked","StackedReverse","Horizontal","HorizontalReverse","CustomProgressBarSection","CustomControlsSection","CustomAdditionalControls","CustomVolumeControls","MoveVolumeControlToProgressBarSection","UseCurrentLeftTime","ChangeLayoutStory"];export{P as ChangeLayoutStory,d as CustomAdditionalControls,i as CustomControlsSection,m as CustomProgressBarSection,l as CustomVolumeControls,c as Horizontal,u as HorizontalReverse,R as MoveVolumeControlToProgressBarSection,a as Stacked,n as StackedReverse,S as UseCurrentLeftTime,v as __namedExportsOrder,O as default};
