# React Image Slides
[![codecov](https://codecov.io/gh/loadingwyn/react-imageslides/branch/master/graph/badge.svg)](https://codecov.io/gh/loadingwyn/react-imageslides)
> A mobile friendly images slideshow react component
## Example
![demo](demo/demo.gif)

Features
- supports swiping(use [Alloyfinger](https://github.com/AlloyTeam/AlloyFinger))
- preloads Images
- no unnecessary rendering(renders no more than 3 images at a time)

## Install
`yarn add react-imageslides`

The package has peer dependencies on `react@^16.0.0`, `react-dom@16.0.0`, and `alloyfinger`.

## Apis

Property            | Type   | Default        | Required | Description
:-------------------|:------:|:--------------:|:--------:|:----------------------------------------
images              | array  |                |    yes   | image urls to display
isOpen              | boolean|    false       |          | whether component is open
index               | number |        0       |          | index of the first image to display
useTouchEmulator    | boolean|    false       |          | whether touch emulator is used
onClose             | func   |                |          | close window event

## Todo

- ~~Add tests~~
- Add pop-up animation effects
- support pinch
