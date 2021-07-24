export default function fitToViewport(
  imageSize: { width: number; height: number },
  containerSize: { width: number; height: number },
): { width: string; height: string } {
  const { width: imageWidth, height: imageHeight } = imageSize;
  const { width: containerWidth, height: containerHeight } = containerSize;
  const containerRatio = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;
  if (imageRatio > containerRatio) {
    return {
      width: containerWidth < imageWidth ? '100%' : `${imageWidth}px`,
      height: 'auto',
    };
  }
  return {
    width: 'auto',
    height: containerHeight < imageHeight ? '100%' : `${imageHeight}px`,
  };
}
