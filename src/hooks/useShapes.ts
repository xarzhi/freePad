import { Rect, RoundRect, Ellipse, Circle, Line, Text } from '../views/ts/shape'

const useShapes = (activeShape: any, shapList: any[]) => {
  // 直角矩形
  const drawRect = (x: number, y: number) => {
    const rect = new Rect({
      x: x,
      y: y,
      width: 0,
      height: 0
    })
    activeShape.value = rect
    shapList.push(rect)
  }
  // 圆角矩形
  const drawRoundRect = (x: number, y: number) => {
    const roundRect = new RoundRect({
      x: x,
      y: y,
      width: 0,
      height: 0
    })
    activeShape.value = roundRect
    shapList.push(roundRect)
  }
  // 椭圆
  const drawEllipse = (x: number, y: number) => {
    const ellipse = new Ellipse({
      x: x,
      y: y,
      width: 0,
      height: 0
    })
    activeShape.value = ellipse
    shapList.push(ellipse)
  }
  //圆形
  const drawCircle = (x: number, y: number) => {
    const circle = new Circle({
      x,
      y,
      radius: 50,
      height: 0,
      width: 0
    })
    activeShape.value = circle
    shapList.push(circle)
  }
  // 线段
  const drawLine = (x: number, y: number) => {
    const line = new Line({ x, y, width: 0, height: 0 })
    activeShape.value = line
    shapList.push(line)
  }
  // 文本
  const drawText = (x: number, y: number) => {
    const text = new Text({
      x: x,
      y: y,
      width: 200,
      height: 10
    })
    activeShape.value = text
    text.style.border='transparent'
    shapList.push(text)
  }

  
  return {
    drawRect,
    drawRoundRect,
    drawEllipse,
    drawCircle,
    drawLine,
    drawText
  }
}

export default useShapes
