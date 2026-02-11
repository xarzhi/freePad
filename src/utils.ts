const createHDCanvas = (canvas: any, w: number, h: number) => {
  const ratio = window.devicePixelRatio || 1
  canvas.width = w * ratio // 实际渲染像素
  canvas.height = h * ratio // 实际渲染像素
  canvas.style.width = `${w}px` // 控制显示大小
  canvas.style.height = `${h}px` // 控制显示大小
  const ctx = canvas.getContext('2d')
  ctx.scale(ratio, ratio)
  // canvas 绘制
  return canvas
}

export { createHDCanvas }
