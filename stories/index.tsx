import React, { useCallback, useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react';
import Gallery, { GalleryProps } from '../src/Gallery';

export default {
  title: 'Example',
  component: Gallery,
} as Meta;

const images = [
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'http://dingyue.nosdn.127.net/0UDLpU6BsCNm9v9OpT0Dhn=nHKJFC6SMByz8bMWxFM=1t1531988836046compressflag.jpeg',
  'http://dingyue.nosdn.127.net/9sFTTWDQoHjxyIkU9wzm8CiDNVbq48Mwf2hyhgRghxA5O1527909480497compressflag.jpeg',
  'http://dingyue.nosdn.127.net/lXMRCRbP9PYbv2gMBmHGXRnjspn6pT1PM5DrIGcEZSUTu1531904526913compressflag.jpeg',
];
const Template: Story<GalleryProps> = ({ index }) => {
  const [activeIndex, setActiveIndex] = useState(index);
  useEffect(() => {
    setActiveIndex(index);
  }, [index]);
  const handleChange = useCallback((newIndex: number) => {
    setActiveIndex(newIndex);
  }, []);
  return <Gallery isOpen images={images} index={activeIndex} onChange={handleChange} />;
};
export const Slides = Template.bind({});

Slides.args = {
  index: 0,
};
