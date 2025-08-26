import{r as p,j as e}from"./iframe-DKmbwMFx.js";import{S as s}from"./utils-MesXHYS8.js";import{H as o,R as r}from"./index-C4iBZ5Tl.js";import"./preload-helper-D9Z9MdNV.js";class C extends p.PureComponent{player=p.createRef();state={volumeText:"100%"};componentDidMount(){this.player.current.audio.current.addEventListener("volumechange",t=>{this.setState({volumeText:`${(t.target.volume*100).toFixed(0)}%`})})}render(){const{volumeText:t}=this.state;return e.jsx(o,{ref:this.player,src:s,customVolumeControls:[r.VOLUME,e.jsxs("div",{children:["  ",t]},2)]})}}C.__docgenInfo={description:"",methods:[],displayName:"VolumePercentage"};const U={layout:"stacked",customControlsSection:[r.CURRENT_TIME,r.CURRENT_LEFT_TIME],customProgressBarSection:[r.PROGRESS_BAR,r.MAIN_CONTROLS]},A=()=>{const[_,t]=p.useState({}),L=()=>t(U),E=()=>t({});return e.jsxs("div",{className:"container",children:[e.jsx("button",{onClick:L,children:"stacked"}),e.jsx("button",{onClick:E,children:"horizontal"}),e.jsx("h1",{children:"Hello, audio player!"}),e.jsx(o,{src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",volume:.5,layout:"stacked-reverse",..._})]})};A.__docgenInfo={description:"",methods:[],displayName:"ChangeLayout"};const v={title:"Layouts - Advanced",component:o},a={render:()=>e.jsx(o,{src:s}),name:"Stacked"},n={render:()=>e.jsx(o,{src:s,layout:"stacked-reverse"}),name:"Stacked Reverse"},c={render:()=>e.jsx(o,{src:s,layout:"horizontal"}),name:"Horizontal"},i={render:()=>e.jsx(o,{src:s,layout:"horizontal-reverse"}),name:"Horizontal Reverse"},u={render:()=>e.jsx(o,{src:s,customProgressBarSection:[r.PROGRESS_BAR,r.CURRENT_TIME,e.jsx("div",{children:"/"},"1"),r.DURATION]}),name:"Custom progress bar section"},d={render:()=>e.jsx(o,{src:s,customControlsSection:[e.jsx("div",{children:"This is an additional module in controls section"},"1"),r.ADDITIONAL_CONTROLS,r.MAIN_CONTROLS,r.VOLUME_CONTROLS]}),name:"Custom controls section"},m={render:()=>e.jsx(o,{src:s,customAdditionalControls:[r.LOOP,e.jsx("button",{children:"button 2 "},"1"),e.jsx("button",{children:"button 3 "},"2"),e.jsx("button",{children:"button 4 "},"3")]}),name:"Custom additional controls"},l={render:()=>e.jsx(C,{}),name:"Custom volume controls"},R={render:()=>e.jsx(o,{src:s,customProgressBarSection:[r.CURRENT_TIME,e.jsx("div",{children:"/"},"1"),r.DURATION,r.PROGRESS_BAR,r.VOLUME],customVolumeControls:[]}),name:"Move Volume control to Progress bar section"},S={render:()=>e.jsx(o,{src:s,customProgressBarSection:[r.CURRENT_TIME,r.PROGRESS_BAR,r.CURRENT_LEFT_TIME]}),name:"Use current left time"},P={render:()=>e.jsx(A,{}),name:"Change Layout"};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} />,
  name: 'Stacked'
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="stacked-reverse" />,
  name: 'Stacked Reverse'
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="horizontal" />,
  name: 'Horizontal'
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="horizontal-reverse" />,
  name: 'Horizontal Reverse'
}`,...i.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customProgressBarSection={[RHAP_UI.PROGRESS_BAR, RHAP_UI.CURRENT_TIME, <div key="1">/</div>, RHAP_UI.DURATION]} />,
  name: 'Custom progress bar section'
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customControlsSection={[<div key="1">This is an additional module in controls section</div>, RHAP_UI.ADDITIONAL_CONTROLS, RHAP_UI.MAIN_CONTROLS, RHAP_UI.VOLUME_CONTROLS]} />,
  name: 'Custom controls section'
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customAdditionalControls={[RHAP_UI.LOOP, <button key="1">button 2 </button>, <button key="2">button 3 </button>, <button key="3">button 4 </button>]} />,
  name: 'Custom additional controls'
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};const x=["Stacked","StackedReverse","Horizontal","HorizontalReverse","CustomProgressBarSection","CustomControlsSection","CustomAdditionalControls","CustomVolumeControls","MoveVolumeControlToProgressBarSection","UseCurrentLeftTime","ChangeLayoutStory"];export{P as ChangeLayoutStory,m as CustomAdditionalControls,d as CustomControlsSection,u as CustomProgressBarSection,l as CustomVolumeControls,c as Horizontal,i as HorizontalReverse,R as MoveVolumeControlToProgressBarSection,a as Stacked,n as StackedReverse,S as UseCurrentLeftTime,x as __namedExportsOrder,v as default};
