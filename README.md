# React Image Slides
> A mobile friendly images slideshow react component
## Example
![demo](demo/demo.gif)

Features
- Support pinching to zoom and swiping smoothly(use [Alloyfinger](https://github.com/AlloyTeam/AlloyFinger))
- Image preloading
- Good performance(render no more than 3 images at a time, no matter how long the image array is)

## Install
`yarn add react-imageslides`

## Apis

Property            | Type   | Default        | Required | Description
:-------------------|:------:|:--------------:|:--------:|:----------------------------------------
images              | array  |                |    yes   | image urls to display
isOpen              | boolean|    false       |          | whether component is open
index               | number |        0       |          | index of the first image to display
useTouchEmulator    | boolean|    false       |          | toggle touch emulator
onClose             | func   |                |          | close window event. Should change the parent state such that the component is not rendered
