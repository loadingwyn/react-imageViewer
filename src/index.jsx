import React from 'react';
import ReactDOM from 'react-dom';
import ImageViewer from './ImageViewer';

const images = [
  'https://upload.wikimedia.org/wikipedia/commons/d/db/Cijin_District_view_from_Mt_QiHou.jpg',
  'https://www.goodfreephotos.com/albums/canada/ontario/niagara-falls/niagara-falls-view-from-elementz-restaurant-in-ontario-canada.jpg',
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/8/86/No_ecb_mode_picture.png',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1503235534249&di=4c198d5a305627d12e5dae4c581c9e57&imgtype=0&src=http%3A%2F%2Fimg2.niutuku.com%2Fdesk%2Fanime%2F0529%2F0529-17277.jpg',
  '',
];
ReactDOM.render(
  <ImageViewer images={images} isMobile />,
  document.querySelector('#root'),
);
