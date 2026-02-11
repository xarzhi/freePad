export const moveDir = (
  x: number,
  y: number,
  activeShape: any,
  lastShapeInfo: any,
  changeDir: any,
  ctx: any,
  mouseDownPosition: any
) => {
  const activeInfo = activeShape.value.info
  const lastInfo = lastShapeInfo.value.info

  // 计算旋转弧度
  const bian1 = y - mouseDownPosition.y
  const bian2 = x - mouseDownPosition.x
  const tan = bian1 / bian2
  const rad = Math.atan(tan)

  switch (changeDir.value) {
    case 'e-resize': // 右
      if (x < lastShapeInfo.value.info.x) {
        activeInfo.x = x
        activeInfo.width = lastInfo.x - x
      } else {
        activeInfo.width = x - activeInfo.x
      }
      break
    case 'w-resize': //左
      if (x > lastInfo.x + lastInfo.width) {
        activeInfo.x = lastInfo.x + lastInfo.width
        activeInfo.width = x - activeInfo.x
      } else {
        activeInfo.x = x
        activeInfo.width = lastInfo.x + lastInfo.width - x
      }
      break
    case 'n-resize': //上
      if (y > lastInfo.y + lastInfo.height) {
        activeInfo.y = lastInfo.y + lastInfo.height
        activeInfo.height = y - activeInfo.y
      } else {
        activeInfo.y = y
        activeInfo.height = lastInfo.y + lastInfo.height - y
      }
      break
    case 's-resize': // 下
      if (y < lastInfo.y) {
        activeInfo.y = y
        activeInfo.height = lastInfo.y - y
      } else {
        activeInfo.height = y - activeInfo.y
      }
      break
    case 'se-resize': //右下
      if (x < lastInfo.x) {
        activeInfo.x = x
        activeInfo.width = lastInfo.x - x
      } else {
        activeInfo.width = x - activeInfo.x
      }
      if (y < lastInfo.y) {
        activeInfo.y = y
        activeInfo.height = lastInfo.y - y
      } else {
        activeInfo.height = y - activeInfo.y
      }
      break
    case 'ne-resize': // 右上
      if (x < lastShapeInfo.value.info.x) {
        activeInfo.x = x
        activeInfo.width = lastInfo.x - x
      } else {
        activeInfo.width = x - activeInfo.x
      }

      if (y > lastInfo.y + lastInfo.height) {
        activeInfo.y = lastInfo.y + lastInfo.height
        activeInfo.height = y - activeInfo.y
      } else {
        activeInfo.y = y
        activeInfo.height = lastInfo.y + lastInfo.height - y
      }
      break
    case 'nw-resize': // 左上
      if (x > lastInfo.x + lastInfo.width) {
        activeInfo.x = lastInfo.x + lastInfo.width
        activeInfo.width = x - activeInfo.x
      } else {
        activeInfo.x = x
        activeInfo.width = lastInfo.x + lastInfo.width - x
      }
      if (y > lastInfo.y + lastInfo.height) {
        activeInfo.y = lastInfo.y + lastInfo.height
        activeInfo.height = y - activeInfo.y
      } else {
        activeInfo.y = y
        activeInfo.height = lastInfo.y + lastInfo.height - y
      }
      break
    case 'sw-resize': // 左下
      if (x > lastInfo.x + lastInfo.width) {
        activeInfo.x = lastInfo.x + lastInfo.width
        activeInfo.width = x - activeInfo.x
      } else {
        activeInfo.x = x
        activeInfo.width = lastInfo.x + lastInfo.width - x
      }
      if (y < lastInfo.y) {
        activeInfo.y = y
        activeInfo.height = lastInfo.y - y
      } else {
        activeInfo.height = y - activeInfo.y
      }
      break
    case 'grab':
      activeShape.value.rotation = rad
      break
    default: // 拖动图形
      activeShape.value.update(x - activeShape.value.offsetX, y - activeShape.value.offsetY)
      activeShape.value.draw(ctx.value)
      break
  }
}
