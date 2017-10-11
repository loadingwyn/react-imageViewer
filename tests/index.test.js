import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme, { shallow } from 'enzyme';
import ImageSlides from '../src/ImageSlides';

Enzyme.configure({ adapter: new Adapter() });
const images = [
  '',
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'http://a4.att.hudong.com/05/55/01200000033533115855502090905.jpg',
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1503235534249&di=4c198d5a305627d12e5dae4c581c9e57&imgtype=0&src=http%3A%2F%2Fimg2.niutuku.com%2Fdesk%2Fanime%2F0529%2F0529-17277.jpg',
];

describe('<ImageSlides />', () => {
  it('should render a loading', () => {
    const wrapper = shallow(<ImageSlides images={images} isOpen />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders two imgs when then index is equal to 0', () => {
    const wrapper = shallow(<ImageSlides images={images} isOpen />);
    expect(wrapper.find('.image-slides-blackboard').length).toBe(2);
  });
  it('renders three imgs when then index is equal to 2', () => {
    const wrapper = shallow(<ImageSlides images={images} index={2} isOpen />);
    expect(wrapper.find('.image-slides-blackboard').length).toBe(3);
  });
});
