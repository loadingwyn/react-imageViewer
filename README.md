# React Image Viewer

[![version](https://img.shields.io/npm/v/react-imageslides)](https://www.npmjs.com/package/react-imageslides)

> React-slides@3 redesigns all apis and uses React Hooks. If you are user of React-slides@2, please read api docs carefully.

## Example

![demo](demo/demo.gif)

[![Edit l2xpwy3xrq](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/l2xpwy3xrq?view=preview)

## Features

- Close to the native experience(powered by [Alloyfinger](https://github.com/AlloyTeam/AlloyFinger))
- High performance(no unneccessary rendering)
- Support both touch screen devices and desktops

## Get Started

1.  Run `yarn add react-imageslides react react-dom alloyfinger`
    The package has peer dependencies on `react@^17.0.0`, `react-dom@^17.0.0`, and `alloyfinger`.

2.  Render it!

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Gallery from 'react-imageslides';
const images = [
  'http://dingyue.nosdn.127.net/lXMRCRbP9PYbv2gMBmHGXRnjspn6pT1PM5DrIGcEZSUTu1531904526913compressflag.jpeg',
  'http://dingyue.nosdn.127.net/9sFTTWDQoHjxyIkU9wzm8CiDNVbq48Mwf2hyhgRghxA5O1527909480497compressflag.jpeg',
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1503235534249&di=4c198d5a305627d12e5dae4c581c9e57&imgtype=0&src=http%3A%2F%2Fimg2.niutuku.com%2Fdesk%2Fanime%2F0529%2F0529-17277.jpg',
];
function App() {
  const [activeIndex, setActiveIndex] = useState(index);
  useEffect(() => {
    setActiveIndex(index);
  }, [index]);
  const handleChange = useCallback((newIndex: number) => {
    setActiveIndex(newIndex);
  }, []);
  return <Gallery isOpen images={images} index={activeIndex} onChange={handleChange} />;
}
ReactDOM.render(<App />, document.getElementById('root'));
```

## Apis

| Property    |  Type  | Default | Required | Description                                 |
| :---------- | :----: | :-----: | :------: | :------------------------------------------ |
| images      | array  |         |   yes    | Image urls to display                       |
| onChange    |  func  |         |   yes    | Callback fired when the index changes       |
| isOpen      |  bool  |         |   yes    | Whether the component is open               |
| index       | number |         |   yes    | Index of the first image to display         |
| loadingIcon |  node  |         |          | Placeholder when image is loading           |
| onClick     |  func  |         |          | Callback fired when user clicks gallery     |
| onKeyPress  |  func  |         |          | Callback fired when user press down any key |
| onSingleTap |  func  |         |          | Callback fired when user taps gallery       |
