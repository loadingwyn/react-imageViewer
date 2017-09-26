# React Image Slides
> A mobile friendly images slideshow react component
## Example
![demo](demo/demo.gif)

Features
- Support pinching to zoom and swiping smoothly(use [Alloyfinger](https://github.com/AlloyTeam/AlloyFinger))
- Preload Images
- Only render no more than 3 images (previous, current, next) at a time for performance

## Install
`yarn add react-imageslides`

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
