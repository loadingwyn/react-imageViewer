# React Image Slides

[![codecov](https://codecov.io/gh/loadingwyn/react-imageslides/branch/master/graph/badge.svg)](https://codecov.io/gh/loadingwyn/react-imageslides)

> A mobile friendly images slideshow react component

## Example

![demo](demo/demo.gif)

[![Edit l2xpwy3xrq](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/l2xpwy3xrq?view=preview)

## Features

* native swiping experience(use [Alloyfinger](https://github.com/AlloyTeam/AlloyFinger))
* double tap to zoom in/out
* preloads Images
* no unnecessary rendering(renders no more than 3 images at a time)

## Get Started

1. Run `yarn add react-imageslides react react-dom alloyfinger`
   The package has peer dependencies on `react@^16.0.0`, `react-dom@16.0.0`, and `alloyfinger`.

2. Render it!

```js
import React from 'react';
import ReactDOM from 'react-dom';
import ImageSlides from 'react-imageslides';
const images = [
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'http://a4.att.hudong.com/05/55/01200000033533115855502090905.jpg',
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1503235534249&di=4c198d5a305627d12e5dae4c581c9e57&imgtype=0&src=http%3A%2F%2Fimg2.niutuku.com%2Fdesk%2Fanime%2F0529%2F0529-17277.jpg',
];
ReactDOM.render(
  <ImageSlides images={images} isOpen />,
  document.getElementById('root'),
);
```

## Apis

| Property         |  Type   | Default | Required | Description                                                               |
| :--------------- | :-----: | :-----: | :------: | :------------------------------------------------------------------------ |
| images           |  array  |         |   yes    | image urls to display                                                     |
| isOpen           | boolean |  false  |          | whether component is open                                                 |
| index            | number  |    0    |          | index of the first image to display                                       |
| addon            |  func   |         |          | display extra infomation of the image (addon must return a react element) |
| useTouchEmulator | boolean |  false  |          | use touch emulator                                          |
| onClose          |  func   |         |          | close window event                                                        |
| onChange         |  func   |         |          | swipe image event                                                         |

## Todo

* ~~Add tests~~
* Add pop-up animation effects
* support pinch
