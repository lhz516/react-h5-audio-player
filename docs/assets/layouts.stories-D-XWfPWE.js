import{j as e}from"./iframe-DWWJ7iW9.js";import{S as o}from"./utils-MesXHYS8.js";import{H as r}from"./index-BX3YaWGJ.js";import"./preload-helper-D9Z9MdNV.js";const h=e.jsxs("svg",{role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:[e.jsx("title",{children:"asciinema icon"}),e.jsx("path",{d:"M1.61 0V24L22.39 12L1.61 0M5.76 7.2L10.06 9.68L5.76 12.16V7.2M12.55 11.12L14.08 12L5.76 16.8V15.04L12.55 11.12Z"})]}),A={title:"Layouts",component:r},s={render:()=>e.jsx(r,{src:o}),name:"Default"},a={render:()=>e.jsxs("div",{children:[e.jsx("p",{children:"300px"}),e.jsx(r,{style:{width:"300px"},src:o}),e.jsx("p",{children:"400px"}),e.jsx(r,{style:{width:"400px"},src:o}),e.jsx("p",{children:"500px"}),e.jsx(r,{style:{width:"500px"},src:o}),e.jsx("p",{children:"600px"}),e.jsx(r,{style:{width:"600px"},src:o}),e.jsx("p",{children:"100%"}),e.jsx(r,{src:o})]}),name:"Width",height:"700px"},n={render:()=>e.jsx(r,{src:o,showSkipControls:!0}),name:"Show Skip Controls"},t={render:()=>e.jsx(r,{src:o,showSkipControls:!0,showJumpControls:!1}),name:"Show Jump Controls and Show Skip Controls"},d={render:()=>e.jsx(r,{src:o,showJumpControls:!1}),name:"Hide all Controls"},i={render:()=>e.jsx(r,{src:o,customVolumeControls:[]}),name:"Hide Volume"},c={render:()=>e.jsx(r,{src:o,customAdditionalControls:[]}),name:"Hide Loop Button"},l={render:()=>e.jsx(r,{src:o,showDownloadProgress:!1}),name:"Hide Download Progress"},u={render:()=>e.jsx(r,{src:o,defaultCurrentTime:"Loading",defaultDuration:"Loading"}),name:"Custom default current time and duration"},m={render:()=>e.jsx(r,{src:o,showFilledProgress:!1}),name:"Hide filled progress"},p={render:()=>e.jsx(r,{src:o,header:"Now playing: Let it go!",footer:"This is a footer"}),name:"Show header and footer"},P={render:()=>e.jsx(r,{src:o,defaultCurrentTime:"Loading",defaultDuration:"Loading",customIcons:{play:h}}),name:"Custom icons"};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} />,
  name: 'Default'
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <p>300px</p>
      <AudioPlayer style={{
      width: '300px'
    }} src={SAMPLE_MP3_URL} />
      <p>400px</p>
      <AudioPlayer style={{
      width: '400px'
    }} src={SAMPLE_MP3_URL} />
      <p>500px</p>
      <AudioPlayer style={{
      width: '500px'
    }} src={SAMPLE_MP3_URL} />
      <p>600px</p>
      <AudioPlayer style={{
      width: '600px'
    }} src={SAMPLE_MP3_URL} />
      <p>100%</p>
      <AudioPlayer src={SAMPLE_MP3_URL} />
    </div>,
  name: 'Width',
  height: '700px'
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showSkipControls={true} />,
  name: 'Show Skip Controls'
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showSkipControls={true} showJumpControls={false} />,
  name: 'Show Jump Controls and Show Skip Controls'
}`,...t.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showJumpControls={false} />,
  name: 'Hide all Controls'
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customVolumeControls={[]} />,
  name: 'Hide Volume'
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customAdditionalControls={[]} />,
  name: 'Hide Loop Button'
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showDownloadProgress={false} />,
  name: 'Hide Download Progress'
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} defaultCurrentTime="Loading" defaultDuration="Loading" />,
  name: 'Custom default current time and duration'
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showFilledProgress={false} />,
  name: 'Hide filled progress'
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} header="Now playing: Let it go!" footer="This is a footer" />,
  name: 'Show header and footer'
}`,...p.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} defaultCurrentTime="Loading" defaultDuration="Loading" customIcons={{
    play: sampleIcon
  }} />,
  name: 'Custom icons'
}`,...P.parameters?.docs?.source}}};const g=["Default","Width","ShowSkipControls","ShowJumpControlsAndShowSkipControls","HideAllControls","HideVolume","HideLoopButton","HideDownloadProgress","CustomDefaultCurrentTimeAndDuration","HideFilledProgress","ShowHeaderAndFooter","CustomIcons"];export{u as CustomDefaultCurrentTimeAndDuration,P as CustomIcons,s as Default,d as HideAllControls,l as HideDownloadProgress,m as HideFilledProgress,c as HideLoopButton,i as HideVolume,p as ShowHeaderAndFooter,t as ShowJumpControlsAndShowSkipControls,n as ShowSkipControls,a as Width,g as __namedExportsOrder,A as default};
