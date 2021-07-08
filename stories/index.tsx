import React, { useCallback, useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react';
import ImageSlides, { Gallery, SlidesProps } from '../src/ImageSlides';

export default {
  title: 'Example',
  component: Gallery,
} as Meta;

const images = [
  'http://dingyue.nosdn.127.net/0UDLpU6BsCNm9v9OpT0Dhn=nHKJFC6SMByz8bMWxFM=1t1531988836046compressflag.jpeg',
  'http://dingyue.nosdn.127.net/9sFTTWDQoHjxyIkU9wzm8CiDNVbq48Mwf2hyhgRghxA5O1527909480497compressflag.jpeg',
  'http://dingyue.nosdn.127.net/lXMRCRbP9PYbv2gMBmHGXRnjspn6pT1PM5DrIGcEZSUTu1531904526913compressflag.jpeg',
];
const Template: Story<SlidesProps> = ({ index }) => {
  const [activeIndex, setActiveIndex] = useState(index);
  useEffect(() => {
    setActiveIndex(index);
  }, [index]);
  const handleChange = useCallback((newIndex: number) => {
    console.log(newIndex, 'new');
    setActiveIndex(newIndex);
  }, []);
  return <Gallery isOpen images={images} index={activeIndex} onChange={handleChange} />;
};
export const Slides = Template.bind({});

Slides.args = {
  index: 0,
};
