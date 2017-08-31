# React Image Viewer
> A mobile friendly lightbox component for displaying images
## Example
![demo](demo/demo.gif)

Features
- Support pinching to zoom and swiping smoothly(use [Alloyfinger](https://github.com/AlloyTeam/AlloyFinger))
- Image preloading
- Good performance(render no more than 3 images at a time, no matter how long the image array is)

## Apis

Property            | Type   | Default        | Required | Description
:-------------------|:------:|:--------------:|:--------:|:----------------------------------------
images              | array  |                |    yes   | image urls to display
isMobile            | string |    false       |          | toggle touch emulator
onClose             | func   |                |          | close window event. Should change the parent state such that the component is not rendered
