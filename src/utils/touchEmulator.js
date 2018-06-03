export default function touchEmulator(el) {
  let down = false;
  function preventMouseEvents(event) {
    event.preventDefault();
    // event.stopPropagation();
  }
  function trigger(mouseEvent, touchEvent, downState) {
    const newEvent = new CustomEvent(touchEvent);
    el.addEventListener(mouseEvent, event => {
      if (touchEvent === 'touchstart' || down) {
        const touch = {
          pageX: event.pageX,
          pageY: event.pageY,
          type: touchEvent,
        };
        newEvent.touches = [touch];
        newEvent.changedTouches = [touch];
        event.preventDefault();
      }
      if (touchEvent !== 'touchmove') {
        down = downState;
      }
      el.dispatchEvent(newEvent, { bubbles: true });
    });
  }
  trigger('mousedown', 'touchstart', true);
  trigger('mousemove', 'touchmove', true);
  trigger('mouseup', 'touchend', false);
  trigger('mouseout', 'touchend', false);
  trigger('mouseleave', 'touchend', false);
  el.addEventListener('mouseenter', preventMouseEvents, true);
  el.addEventListener('mouseleave', preventMouseEvents, true);
  el.addEventListener('mouseout', preventMouseEvents, true);
  el.addEventListener('mouseover', preventMouseEvents, true);
}
