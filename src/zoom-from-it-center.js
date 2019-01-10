const $ = require('jquery')
const log = require('./log')

//我的思路是，缩放绑定window，套三层div，双指落地，内层div 0大小，svg中心始终在内层中心，双指落地时先做好转换，把内层的偏移转移到中层上

let offsetM = {
  top: 0,
  left: 0
},
  offsetI = {
    top: 0,
    left: 0
  },
  scaleI = 1,
  width = $(window).width(),
  height = $(window).height(),
  modes = {
    none: 0,
    drag: 1,
    scale: 2
  },
  mode = modes.none,
  scaleStartDistance,
  dragStartPosition,
  moveDelegate = () => { },
  $inner = $('.inner'),
  $middle = $('.middle')

$(window).on('touchstart', e => {
  changeState(e)
}).on('touchmove', e => {
  moveDelegate(e)
}).on('touchend touchcancle', e => {
  changeState(e)
})

function changeState(e) {
  const lastMode = mode
  let newMode
  switch (e.touches.length) {
    case 1:
      newMode = modes.drag
      break;
    case 2:
      newMode = modes.scale
      break;
    default:
      newMode = modes.none
  }
  if (lastMode != newMode) {
    cleanMode(lastMode)
    startMode(newMode, e)
  }
}

function cleanMode(m) {

}

function startMode(m, e) {
  mode = m
  if (m == modes.drag) {
    startDrag(e)
    moveDelegate = moveDrag
    return
  }
  if (m == modes.scale) {
    startScale(e)
    moveDelegate = moveScale
    return
  }

  moveDelegate = () => { }
}

function startDrag(e) {
  log('start drag')
  dragStartPosition = {
    offset: {
      ...offsetI,
    },
    touch: touch2pos(e.touches[0]),
  }
}

function moveDrag(e) {
  const newTouch = touch2pos(e.touches[0])
  const { offset, touch } = dragStartPosition
  offsetI = posAdd(offset, posSub(newTouch, touch))
  $inner.css(offsetI)
}

function startScale(e) {
  
  log('start scale')
  offsetM = posAdd(offsetM, offsetI)
  offsetI = { top: 0, left: 0 }
  $middle.css(offsetM)
  $inner.css(offsetI)
  //const middle = posDevide(posAdd(touch2pos(e.touches[0]), touch2pos(e.touches[1])), 2)


  const diff = posSub(touch2pos(e.touches[0]), touch2pos(e.touches[1]))
  scaleStartDistance = {
    scale: scaleI,
    distance: Math.hypot(diff.top, diff.left),
  }
}

function moveScale(e) {  
  const { scale, distance } = scaleStartDistance
  const diff = posSub(touch2pos(e.touches[0]), touch2pos(e.touches[1]))
  const curDistance = Math.hypot(diff.top, diff.left)
  scaleI = scale * curDistance / distance
  if (scaleI < 0.1) {
    scaleI = 0.1
  }
  log(`${scaleI}`)
  $inner.css({
    transform: `scale(${scaleI})`
  })
}

function touch2pos(t) {
  return {
    top: t.pageY,
    left: t.pageX,
  }
}

function posAdd(p1, p2) {
  return {
    top: p1.top + p2.top,
    left: p1.left + p2.left,
  }
}

function posSub(p1, p2) {
  return {
    top: p1.top - p2.top,
    left: p1.left - p2.left,
  }
}

function posDevide(p1, by) {
  return {
    top: p1.top / by,
    left: p1.left / by,
  }
}