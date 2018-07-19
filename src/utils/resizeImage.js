export default function resizeImage(imageWidth, imageHeight) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const screenRadio = screenWidth / screenHeight;
  const imageRadio = imageWidth / imageHeight;
  if (imageRadio > screenRadio) {
    return {
      width: screenWidth < imageWidth ? '100%' : `${imageWidth}px`,
      height: 'auto',
    };
  }
  return {
    width: 'auto',
    height: screenHeight < imageHeight ? '100%' : `${imageHeight}px`,
  };
}
