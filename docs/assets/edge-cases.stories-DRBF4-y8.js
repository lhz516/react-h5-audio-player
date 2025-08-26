import{j as s}from"./iframe-DKmbwMFx.js";import{H as e}from"./index-C4iBZ5Tl.js";import"./preload-helper-D9Z9MdNV.js";const{action:r}=__STORYBOOK_MODULE_ACTIONS__,m={title:"Edge Cases",component:e},o={render:()=>s.jsx(e,{onError:r("onError"),onPlayError:r("onPlayError")}),name:"No src"},n={render:()=>s.jsx(e,{src:"",onError:r("onError"),onPlayError:r("onPlayError")}),name:"Empty string src"},a={render:()=>s.jsx(e,{src:"https://invalidsrc.com/nothing.mp3",onError:r("onError"),onPlayError:r("onPlayError")}),name:"Invalid src"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer onError={action('onError')} onPlayError={action('onPlayError')} />,
  name: 'No src'
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src="" onError={action('onError')} onPlayError={action('onPlayError')} />,
  name: 'Empty string src'
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <AudioPlayer src="https://invalidsrc.com/nothing.mp3" onError={action('onError')} onPlayError={action('onPlayError')} />,
  name: 'Invalid src'
}`,...a.parameters?.docs?.source}}};const E=["NoSrc","EmptyStringSrc","InvalidSrc"];export{n as EmptyStringSrc,a as InvalidSrc,o as NoSrc,E as __namedExportsOrder,m as default};
