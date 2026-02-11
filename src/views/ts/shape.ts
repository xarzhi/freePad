import {
  type ShapeBaseInfoApi,
  type ShapeBaseStyleApi,
  type AnchorsArrayApi,
  type LinearGradientStyleApi,
  type LinearGradientColorsItem
} from './api'

class ShapeBase {
  info: ShapeBaseInfoApi
  style: ShapeBaseStyleApi
  offsetX: number
  offsetY: number
  isActive: boolean
  text: string
  bgcMode: number
  linearGradientStyle: LinearGradientStyleApi
  name: string
  anchorRadius: number
  rotation: number
  constructor(info: ShapeBaseInfoApi, style?: ShapeBaseStyleApi) {
    this.name = ''
    this.info = info
    this.style = Object.assign(
      {},
      {
        background: 'transparent',
        border: 'black',
        borderWidth: 1,
        zIndex: 0
      },
      style
    )
    this.offsetX = 0
    this.offsetY = 0
    this.isActive = false
    this.text = ''
    this.bgcMode = 0 // 0:单色   1:线性渐变  2:径向渐变  3:锥形渐变
    this.linearGradientStyle = {
      position: {},
      colors: [],
      direction: 0 // 0：水平、1：垂直、2：左上到右下、3：右上到左下
    }
    this.anchorRadius = 5
    this.rotation = 0
  }
  // 判断点击的点是否在路径内
  isInside(offsetX: number, offsetY: number) {
    const { x, y, width, height } = this.info
    return (
      offsetX > x - 5 - this.anchorRadius / 2 &&
      offsetX < x + width + 5 + this.anchorRadius / 2 &&
      offsetY > y - 5 - this.anchorRadius / 2 - 30 &&
      offsetY < y + height + 5 + this.anchorRadius / 2
    )
  }
  // 判断鼠标是否在-左中-锚点
  moveDir(offsetX: number, offsetY: number) {
    const { x, y, width, height } = this.info
    const left =
      offsetX > x - 6.5 &&
      offsetX < x - 3.5 &&
      offsetY > y + height / 2 - this.anchorRadius / 2 &&
      offsetY < y + height / 2 + this.anchorRadius / 2

    const right =
      offsetX > x + width + 5 - this.anchorRadius / 2 &&
      offsetX < x + width + 5 + this.anchorRadius / 2 &&
      offsetY > y + height / 2 - this.anchorRadius / 2 &&
      offsetY < y + height / 2 + this.anchorRadius / 2

    const top =
      offsetX > x + width / 2 - this.anchorRadius / 2 &&
      offsetX < x + width / 2 + this.anchorRadius / 2 &&
      offsetY > y - 5 - this.anchorRadius / 2 &&
      offsetY < y - 5 + this.anchorRadius / 2

    const bottom =
      offsetX > x + width / 2 - this.anchorRadius / 2 &&
      offsetX < x + width / 2 + this.anchorRadius / 2 &&
      offsetY > y + height + 5 - this.anchorRadius / 2 &&
      offsetY < y + height + 5 + this.anchorRadius / 2

    const leftTop =
      offsetX > x - 5 - this.anchorRadius / 2 &&
      offsetX < x - 5 + this.anchorRadius / 2 &&
      offsetY > y - 5 - this.anchorRadius / 2 &&
      offsetY < y - 5 + this.anchorRadius / 2

    const leftBottom =
      offsetX > x - 5 - this.anchorRadius / 2 &&
      offsetX < x - 5 + this.anchorRadius / 2 &&
      offsetY > y + height + 5 - this.anchorRadius / 2 &&
      offsetY < y + height + 5 + this.anchorRadius / 2

    const rightTop =
      offsetX > x + width + 5 - this.anchorRadius / 2 &&
      offsetX < x + width + 5 + this.anchorRadius / 2 &&
      offsetY > y - 5 - this.anchorRadius / 2 &&
      offsetY < y - 5 + this.anchorRadius / 2

    const rightBottom =
      offsetX > x + width + 5 - this.anchorRadius / 2 &&
      offsetX < x + width + 5 + this.anchorRadius / 2 &&
      offsetY > y + height + 5 - this.anchorRadius / 2 &&
      offsetY < y + height + 5 + this.anchorRadius / 2

    const rotate =
      offsetX > x + width / 2 - this.anchorRadius / 2 - 3 &&
      offsetX < x + width / 2 + this.anchorRadius / 2 + 3 &&
      offsetY > y - 32 &&
      offsetY < y - 20
    
    if (left) {
      return 'w-resize'
    } else if (right) {
      return 'e-resize'
    } else if (top) {
      return 'n-resize'
    } else if (bottom) {
      return 's-resize'
    } else if (leftTop) {
      return 'nw-resize'
    } else if (leftBottom) {
      return 'sw-resize'
    } else if (rightTop) {
      return 'ne-resize'
    } else if (rightBottom) {
      return 'se-resize'
    } else if (rotate) {
      return 'grab'
    } else {
      return 0
    }
  }

  // 移动
  update(x: number, y: number) {
    this.info.x = x
    this.info.y = y
  }
  // 设置样式
  setStyle(ctx: any) {
    if (this.bgcMode === 0) {
      ctx.fillStyle = this.style.background
    } else if (this.bgcMode === 1) {
      const { x, y, width, height } = this.info
      let startX, startY, endX, endY
      // 调节水平渐变方向
      switch (this.linearGradientStyle.direction) {
        case 0:
          startX = x
          startY = y
          endX = x + width
          endY = y
          break
        case 1:
          startX = x
          startY = y
          endX = x
          endY = y + height
          break
        case 2:
          startX = x
          startY = y
          endX = x + width
          endY = y + height
          break
        case 3:
          startX = x + width
          startY = y
          endX = x
          endY = y + height
          break
        default:
          break
      }

      this.linearGradientStyle.position.startX = startX
      this.linearGradientStyle.position.startY = startY
      this.linearGradientStyle.position.endX = endX
      this.linearGradientStyle.position.endY = endY

      this.setLinearGradient(ctx)
    }
    ctx.strokeStyle = this.style.border
    ctx.lineWidth = this.style.borderWidth
    ctx.globalAlpha = 0.9
  }
  // 绘制虚线矩形的锚点
  drawAnchors(arr: AnchorsArrayApi, ctx: any) {
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = 'blue'
    arr.forEach((item: any) => {
      ctx.beginPath()
      ctx.lineWidth = 1
      ctx.save()
      ctx.translate(this.info.x + this.info.width / 2, this.info.y + this.info.height / 2)
      ctx.rotate(this.rotation)
      // ctx.arc(item.x, item.y, this.anchorRadius, 0, Math.PI * 2)
      ctx.arc(item.x-this.info.x-this.info.width / 2, item.y-this.info.y - this.info.height / 2, this.anchorRadius, 0, Math.PI * 2)
      ctx.restore()
      ctx.setLineDash([])
      ctx.fill()
      ctx.stroke()
    })
  }
  // 绘制虚线矩形
  drawDashBorder({ x, y, width, height }: ShapeBaseInfoApi, an: AnchorsArrayApi, ctx: any) {
    if (this.isActive) {
      ctx.beginPath()
      ctx.setLineDash([5, 2])
      ctx.lineWidth = 1
      ctx.strokeStyle = 'blue'
      ctx.fillStyle = 'blue'

      if (!an.length) {
        ctx.save()
        ctx.translate(x + width / 2, y + height / 2)
        ctx.rotate(this.rotation)
        ctx.rect(-(width + 10) / 2, -(height + 10) / 2, width + 10, height + 10)
        ctx.restore()
      }
      ctx.stroke()

      const anchors: AnchorsArrayApi = an.length
        ? an
        : [
            {
              x: x - 5,
              y: y - 5
            },
            {
              x: x + width / 2,
              y: y - 5
            },
            {
              x: x + width + 5,
              y: y - 5
            },
            {
              x: x - 5,
              y: y + height + 5
            },
            {
              x: x - 5,
              y: y + height / 2
            },
            {
              x: x + width + 5,
              y: y + height / 2
            },
            {
              x: x + width / 2,
              y: y + height + 5
            },
            {
              x: x + width + 5,
              y: y + height + 5
            },
            {
              x: x + width / 2,
              y: y - 25
            }
          ]

      this.drawAnchors(anchors, ctx)
    }
  }
  // 绘制文字
  drawText(ctx: any) {
    const { x, y, width, height } = this.info
    // ctx.save()
    ctx.beginPath()
    ctx.textAlign = 'center'
    ctx.font = '16px Arial'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000'
    ctx.fillText(this.text, x + width / 2, y + height / 2)
    // ctx.restore()

    ctx.closePath()
  }
  // 添加线性渐变背景
  setLinearGradient(ctx: any) {
    const { startX, startY, endX, endY } = this.linearGradientStyle.position
    const lineargradient = ctx.createLinearGradient(startX, startY, endX, endY)
    if (this.linearGradientStyle.colors) {
      this.linearGradientStyle.colors.forEach((item: LinearGradientColorsItem) => {
        if (item.color) {
          lineargradient.addColorStop(item.offset, item.color)
        }
      })
    }
    ctx.fillStyle = lineargradient
  }
}

// 矩形类
class Rect extends ShapeBase {
  constructor(info: ShapeBaseInfoApi, style?: ShapeBaseStyleApi) {
    super(info, style)
    this.name = 'rect'
  }
  draw(ctx: any) {
    const { x, y, width, height } = this.info
    ctx.beginPath()
    this.setStyle(ctx)
    ctx.save()
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate(this.rotation)
    ctx.rect(-width / 2, -height / 2, width, height)
    ctx.restore()
    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    // 绘制文字
    this.drawText(ctx)
    this.drawDashBorder({ x, y, width, height }, [], ctx)
  }
}
// 圆角矩形类
class RoundRect extends ShapeBase {
  constructor(info: ShapeBaseInfoApi, style?: ShapeBaseStyleApi) {
    super(info, style)
    this.name = 'roundRect'
  }
  draw(ctx: any) {
    const { x, y, width, height } = this.info
    let radius = width * height * 0.001
    if (width * height > 25000) {
      radius = 25
    } else if (width * height < 10000) {
      radius = 10
    }
    ctx.beginPath()
    this.setStyle(ctx)
    // 设置线性渐变
    ctx.roundRect(x, y, width, height, radius)

    ctx.fill()
    ctx.stroke()

    this.drawText(ctx)

    this.drawDashBorder({ x, y, width, height }, [], ctx)
  }
}
// 椭圆类
class Ellipse extends ShapeBase {
  constructor(info: ShapeBaseInfoApi, style?: ShapeBaseStyleApi) {
    super(info, style)
    this.name = 'ellipse'
  }
  draw(ctx: any) {
    const { x, y, width, height } = this.info
    const center = {
      x: x + width / 2,
      y: y + height / 2
    }
    ctx.beginPath()
    this.setStyle(ctx)
    ctx.ellipse(center.x, center.y, width / 2, height / 2, 0, 0, Math.PI * 2)

    ctx.stroke()
    ctx.fill()
    ctx.closePath()

    this.drawDashBorder({ x, y, width, height }, [], ctx)
  }
}
// 圆
class Circle extends ShapeBase {
  constructor(info: ShapeBaseInfoApi, style?: ShapeBaseStyleApi) {
    super(info, style)
    this.name = 'circle'
  }
  draw(ctx: any) {
    const { x, y, width } = this.info
    const center = {
      x: x + width / 2,
      y: y + width / 2
    }
    ctx.beginPath()
    this.setStyle(ctx)
    ctx.arc(center.x, center.y, width / 2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()

    this.drawDashBorder({ x, y, width, height: width }, [], ctx)
  }
}
// 线段
class Line extends ShapeBase {
  endX: number
  endY: number
  constructor(info: any, style?: ShapeBaseStyleApi) {
    super(info, style)
    this.name = 'line'
    this.endX = this.info.x
    this.endY = this.info.y
  }
  draw(ctx: any) {
    const { x, y, width, height } = this.info
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(this.endX, this.endY)
    ctx.closePath()
    this.setStyle(ctx)
    ctx.stroke()
    // this.drawDashBorder(
    //   { x, y, width, height },
    //   [
    //     {
    //       x: x,
    //       y: y
    //     },
    //     {
    //       x: x + width,
    //       y: y + height
    //     }
    //   ],
    //   ctx
    // )
    this.drawDashBorder({ x, y, width, height }, [], ctx)
  }
}

// 文本
class Text extends ShapeBase {
  content: string

  constructor(info: ShapeBaseInfoApi, style?: ShapeBaseStyleApi) {
    super(info, style)
    this.content = ''
    this.name = 'text'
  }
  draw(ctx: any) {
    const { x, y } = this.info
    ctx.save()
    ctx.beginPath()
    const width = ctx.measureText(this.content).width
    ctx.font = 'normal 400 16px Arial'
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillText(this.content, x, y + 14, width)
    this.setStyle(ctx)
    ctx.stroke()
    ctx.closePath()

    this.drawDashBorder({ x, y, width: 200, height: 20 }, [], ctx)
  }
}

export { Text, Line, Circle, Ellipse, RoundRect, Rect }
