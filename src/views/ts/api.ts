// 图形父类

export interface ShapeBaseInfoApi {
  x: number
  y: number
  width: number
  height: number
  radius?: number
}

export interface ShapeBaseStyleApi {
  background?: string
  border?: string
  borderWidth?: number
  zIndex?: number
}

export type AnchorsArrayApi = Array<AnchorsItem>

export interface AnchorsItem {
  x: number
  y: number
}

export interface LinearGradientColorsItem {
  id:number
  color: string
  offset: number
}

export interface LinearGradientStyleApi {
  position: {
    startX?: number
    startY?: number
    endX?: number
    endY?: number
  }
  colors?: Array<LinearGradientColorsItem>
  direction?: number
}

export interface ChooseBtnsItem {
  name: string
  mode: number
  title: string
  icon: string
}

export interface GradientItem {
  id: number
  color: string
  offset: number
}

export interface SelectItem {
  value: number
  label: string
}

export type SelectApi = Array<SelectItem>
