const $ = require('jquery')
const log = require('./log')

let offsetI = {
    top: 0,
    left: 0
  },
  offsetSVG = {
    top: 0,
    left: 0
  },
  scaleI = 1,
  modes = {
    none: 0,
    drag: 1,
    scale: 2
  },
  mode = modes.none,
  scaleStartDistance,
  dragStartPosition,
  moveDelegate = () => { },
  $svg = $('.svg'),
  $inner = $('.inner')

$(window).on('touchstart', e => {
  changeState(e)
}).on('touchmove', e => {
  moveDelegate(e)
}).on('touchend touchcancle', e => {
  changeState(e)
})

/**
 * 切换状态，在手指落下和抬起的时候
 * @param {*} e 
 */
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

/**
 * 切换后清理上一个状态，暂时紧用于调试
 * @param {*} m 
 */
function cleanMode(m) {
  log(`clean ${m}`)
}

/**
 * 开始某个模式，比如拖拽、缩放或者什么都不做
 * @param {*} m 
 * @param {*} e 
 */
function startMode(m, e) {
  mode = m
  if (m == modes.drag) {
    startDrag(e)
    log('m == modes.drag')
    moveDelegate = moveDrag
    return
  }
  if (m == modes.scale) {
    startScale(e)
    
  log('m == modes.scale')
    moveDelegate = moveScale
    return
  }
  log('else')
  moveDelegate = () => { }
}

/**
 * 拖拽开始，需要记录当前位置和触点位置
 * @param {*} e 
 */
function startDrag(e) {
  log('start drag')
  dragStartPosition = {
    offset: {
      ...offsetI,
    },
    touch: touch2pos(e.touches[0]),
  }
}

/**
 * 拖拽移动回调，根据startDrag记录的当前位置和触点位置，融合新的触点位置算出目标位置
 * @param {*} e 
 */
function moveDrag(e) {
  log('moveDrag')
  const newTouch = touch2pos(e.touches[0])
  const { offset, touch } = dragStartPosition
  offsetI = posAdd(offset, posSub(newTouch, touch))
  $inner.css(offsetI)
}

/**
 * 缩放开始
 * 1.需要对位置进行转换，把inner盒子挪到两个触点中心并保持内容位置不变，需要额外注意经过缩放的转换
 * 2.记录当前缩放和触点间距
 * @param {*} e 
 */
function startScale(e) {  
  log('start scale')
  const posSVG = posAdd(offsetI, posMul(offsetSVG, scaleI))
  offsetI = posMul(posAdd(touch2pos(e.touches[0]), touch2pos(e.touches[1])), 0.5)
  offsetSVG = posMul(posSub(posSVG, offsetI), 1 / scaleI)

  $inner.css(offsetI)
  $svg.css(offsetSVG)

  const diff = posSub(touch2pos(e.touches[0]), touch2pos(e.touches[1]))
  scaleStartDistance = {
    scale: scaleI,
    distance: Math.hypot(diff.top, diff.left),
  }
}

/**
 * 缩放移动回调，根据之前的缩放和触点间距，融合新的触点间距计算新的缩放，注意最小值避免scale归0无法放大
 * @param {*} e 
 */
function moveScale(e) {
  log('moveScale')
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

/**
 * 触点到坐标，工具函数
 * @param {*} t 
 */
function touch2pos(t) {
  return {
    top: t.pageY,
    left: t.pageX,
  }
}

/**
 * 坐标相加，工具函数
 * @param {*} p1 
 * @param {*} p2 
 */
function posAdd(p1, p2) {
  return {
    top: p1.top + p2.top,
    left: p1.left + p2.left,
  }
}

/**
 * 坐标相减，工具函数
 * @param {*} p1 
 * @param {*} p2 
 */
function posSub(p1, p2) {
  return {
    top: p1.top - p2.top,
    left: p1.left - p2.left,
  }
}

/**
 * 坐标翻倍，工具函数
 * @param {*} p1 
 * @param {*} by 
 */
function posMul(p1, by) {
  return {
    top: p1.top * by,
    left: p1.left * by,
  }
}