<template>
  <canvas
    ref="cvsRef"
    @mousedown="mouseDown"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @dblclick="dblClick"
    @keydown="keyDown"
    :style="{
      cursor: canvasCursor
    }"
  ></canvas>
  <div class="settingBtn" @click="settingShow = !settingShow">
    <i class="iconfont icon-caidan"></i>
  </div>
  <div class="setting" v-if="settingShow">
    <div class="export" @click="save">
      <i class="iconfont icon-xiazai"></i>
      <div class="content">导出图片</div>
    </div>
    <div class="reset" @click="reset">
      <i class="iconfont icon-reset"></i>
      <div class="content">重置画布</div>
    </div>
  </div>
  <!-- 选择绘制的图形 -->
  <div class="chooseBtns" @click="settingShow = false">
    <div
      :class="{
        btnBox: true,
        lock: true,
        focusBtn: isLock
      }"
      title="绘制后保持所选工具栏状态"
      @click="isLock = !isLock"
    >
      <button>
        <el-icon v-if="isLock"><Lock /></el-icon>
        <el-icon v-else><Unlock /></el-icon>
      </button>
    </div>
    <div class="line"></div>
    <div class="drawBtn">
      <template v-for="(item, index) in chooseBtns" :key="index">
        <div
          :class="{
            btnBox: true,
            focusBtn: mode === index
          }"
          :mode="item.mode"
          :title="item.title"
          @click="changeMode(item.mode)"
        >
          <button :class="item.name">
            <i :class="'iconfont ' + item.icon"></i>
          </button>
        </div>
      </template>
    </div>
  </div>
  <!-- 修改图形的样式 -->
  <div class="modify" v-if="modifyShow" @click="settingShow = false">
    <!-- 边框样式 -->
    <div class="borderStyle">
      <div class="title">边框</div>
      <div class="colors">
        <div class="singleColor">
          <div
            v-for="(item, index) in borderColors"
            :key="index"
            :class="{
              [item.color]: true
            }"
            :style="{
              boxShadow: activeShape
                ? activeShape.style.border === item.color
                  ? `0 0 5px ${item.color}`
                  : ''
                : ''
            }"
            :title="item.color"
            @click="changeBorderStyle(item)"
          ></div>
        </div>
        <div class="line"></div>
        <div class="chooseColor">
          <el-color-picker
            @active-change="borderChangeIpt"
            v-model="activeShapBorderColor"
            :predefine="predefineColors"
            :show-alpha="true"
          />
        </div>
      </div>
    </div>
    <!-- 背景颜色 -->
    <div class="borderStyle">
      <div class="sigleOrGradient">
        <div class="title">背景</div>
        <el-select
          v-model="bgcMode"
          placeholder="Select"
          :default-first-option="true"
          size="small"
          class="bgcSelect"
          @change="bgcModeChange"
        >
          <el-option
            v-for="item in bgcSelect"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- 修改线性渐变方向 -->

        <el-button
          size="small"
          ref="buttonRef"
          v-click-outside="onClickOutside"
          v-if="activeShape ? activeShape.bgcMode === 1 : false"
        >
          <div
            :class="{
              iconfont: true,
              'icon-resize': activeShape.linearGradientStyle.direction === 0,
              'icon-resize-vertical-copy': activeShape.linearGradientStyle.direction === 1,
              'icon-resize-title2-copy': activeShape.linearGradientStyle.direction === 2,
              'icon-resize-tilt': activeShape.linearGradientStyle.direction === 3
            }"
          ></div>
        </el-button>
        <el-popover
          ref="popoverRef"
          :virtual-ref="buttonRef"
          trigger="click"
          title="选择渐变方向"
          virtual-triggering
          ><div :style="{ display: 'flex' }">
            <el-button
              size="small"
              v-for="(item, index) in gradientDirList"
              :key="index"
              :style="{
                padding: '3px',
                boxsizing: 'border-box'
              }"
              @click="changeGradientDir(index)"
            >
              <div :class="['iconfont', item]"></div
            ></el-button>
          </div>
        </el-popover>
        <el-button
          size="small"
          v-if="activeShape ? activeShape.bgcMode === 1 : false"
          @click="addGradient"
          :icon="Plus"
        ></el-button>
      </div>
      <!-- 单色 -->
      <div class="colors" v-if="activeShape ? activeShape.bgcMode === 0 : false">
        <div class="bgc">
          <div
            v-for="(item, index) in bgcColors"
            :key="index"
            :title="item.color"
            @click="changeBgcStyle(item)"
            :class="{
              [item.color]: true
            }"
            :style="{
              boxShadow: activeShape
                ? activeShape.style.background === item.color
                  ? `0 0 5px ${item.color}`
                  : ''
                : ''
            }"
          ></div>
        </div>
        <div class="line"></div>
        <div class="chooseColor">
          <el-color-picker
            @active-change="bgcChangeIpt"
            v-model="activeShapBgcColor"
            :predefine="predefineColors"
            :show-alpha="true"
          />
        </div>
      </div>
      <!-- 线性渐变 -->
      <div class="linearGradient gradient" v-if="activeShape ? activeShape.bgcMode === 1 : false">
        <div v-if="!activeShape.linearGradientStyle.colors.length" class="prompt">
          <el-icon><Warning /></el-icon>
          点击加号添加渐变颜色
        </div>

        <div v-for="(item, index) in activeShape.linearGradientStyle.colors" :key="item.id">
          <div class="title colorNo">
            {{ item.id }}
          </div>
          <el-color-picker
            v-model="item.color"
            @active-change="singleGradientChange($event, index)"
            :predefine="predefineColors"
            :show-alpha="true"
          />
          <div class="title pianyi">偏移</div>
          <el-input-number
            v-model="item.offset"
            :min="0.0"
            :max="1.0"
            size="small"
            :precision="2"
            :step="0.1"
            controls-position="right"
          />
          <el-button size="small" class="removeSingleGradient" @click="removeSingleGradient(index)"
            >x</el-button
          >
        </div>
      </div>
    </div>

    <!-- 边框宽度 -->
    <div class="borderStyle">
      <div class="title">边框宽度</div>
      <div class="lines">
        <div
          v-for="(item, index) in linesStyle"
          :key="index"
          @click="changeBorderWidth(item)"
          :class="{
            activeColor: activeShape ? activeShape.style.borderWidth === item.borderWidth : 1
          }"
        >
          <div
            :style="{
              height: item.borderWidth + 'px'
            }"
          ></div>
        </div>
      </div>
    </div>
    <!-- ****** -->
  </div>

  <input
    class="textIpt"
    ref="textIpt"
    v-if="textIptShow"
    :style="{
      minWidth: textIptStyle.width,
      left: textIptStyle.left,
      top: textIptStyle.top
    }"
    @blur="textIptBlur"
    v-model="textIptValue"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, nextTick, watch, unref } from 'vue'
import { createHDCanvas } from '@/utils'
import { type ChooseBtnsItem, type SelectApi } from './ts/api'
import useShapes from '@/hooks/useShapes'
import { ClickOutside as vClickOutside } from 'element-plus'

import { Lock, Unlock, Plus, Warning } from '@element-plus/icons-vue'
import { Rect, RoundRect, Ellipse, Circle, Line, Text } from './ts/shape'
import { moveDir } from './ts/utils'
// ===========================数据==============================
const cvsRef = ref()
const settingShow = ref<boolean>(false) // 显示图形样式设置面板
const isLock = ref<boolean>(false) // 保持所选工具栏状态
const mode = ref(0) // 绘制图形
const isMove = ref<boolean>(false)
const shapList = reactive<any[]>([]) // 总图形数组
const activeShape = ref<any>(null) // 当前聚焦图形
const isCreate = ref<boolean>(false)
const modifyShow = ref<boolean>(false)
const lastShap = ref<any>(null)
const textIpt = ref<any>(null) // 文本框
const textIptShow = ref<boolean>(false) // 文本框显示
const textIptValue = ref<string>('') // 文本框值
const activeShapBorderColor = ref<string>('#000') // 聚焦图形边框颜色
const activeShapBgcColor = ref<string>('#000') // 聚焦图形边框颜色
const bgcMode = ref<number>(0)
const buttonRef = ref()
const popoverRef = ref()
const changeDir = ref<string>() // 图形尺寸改变方式
const lastShapeInfo = ref<any>(null)

const copyShapeInfo = reactive<{ x: number; y: number }>({ x: 100, y: 100 })
const mouseDownPosition = reactive<{ x: number; y: number }>({ x: 0, y: 0 })
const textIptStyle = reactive({
  // 文本样式
  width: '',
  left: '',
  top: '',
  height: '',
  lineHeight: ''
})
const canvasCursor = ref<string>('default')
const borderColors = reactive<Array<{ color: string }>>([
  { color: 'black' },
  { color: 'red' },
  { color: 'blue' },
  { color: 'aqua' },
  { color: 'pink' }
])
const bgcColors = reactive<Array<{ color: string }>>([
  { color: 'transparent' },
  { color: 'red' },
  { color: 'blue' },
  { color: 'aqua' },
  { color: 'pink' }
])
const linesStyle = reactive<Array<{ title: string; borderWidth: number }>>([
  { title: '细线', borderWidth: 1 },
  { title: '较细', borderWidth: 2 },
  { title: '中线', borderWidth: 5 },
  { title: '粗线', borderWidth: 8 }
])
const bgcSelect = reactive<SelectApi>([
  {
    value: 0,
    label: '单色'
  },
  {
    value: 1,
    label: '线性渐变'
  },
  {
    value: 2,
    label: '径向渐变'
  },
  {
    value: 3,
    label: '锥形渐变'
  }
])
// 线性渐变方向
const gradientDir = ref<number>(0)
const gradientDirList = reactive<Array<string>>([
  'icon-resize',
  'icon-resize-vertical-copy',
  'icon-resize-title2-copy',
  'icon-resize-tilt'
])
// 预定义颜色
const predefineColors = ref<Array<string>>([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577'
])
const ctx = ref()
const { drawRect, drawRoundRect, drawEllipse, drawCircle, drawLine, drawText } = useShapes(
  activeShape,
  shapList
)
// 模式选择按钮列表
const chooseBtns = ref<Array<ChooseBtnsItem>>([
  {
    name: 'default',
    mode: 0,
    title: '默认',
    icon: 'icon-bianji-shubiao'
  },
  {
    name: 'rect',
    mode: 1,
    title: '直角矩形',
    icon: 'icon-zhijiaojuxing'
  },
  {
    name: 'roundRect',
    mode: 2,
    title: '圆角矩形',
    icon: 'icon-yuanjiaojuxing'
  },
  {
    name: 'circle',
    mode: 3,
    title: '圆形',
    icon: 'icon-yuanxingweixuanzhong'
  },
  {
    name: 'ellipse',
    mode: 4,
    title: '椭圆',
    icon: 'icon-tuoyuanxing'
  },
  {
    name: 'line',
    mode: 5,
    title: '线段',
    icon: 'icon-line'
  },
  {
    name: 'text',
    mode: 6,
    title: '文本',
    icon: 'icon-wenzi1'
  },
  {
    name: 'pencil',
    mode: 7,
    title: '铅笔',
    icon: 'icon-24'
  },
  {
    name: 'erase',
    mode: 8,
    title: '橡皮擦',
    icon: 'icon-xiangpi'
  }
])

// =========================方法=================================
// 改变线性渐变方向
const changeGradientDir = (index: number) => {
  gradientDir.value = index
  if (activeShape.value) {
    activeShape.value.linearGradientStyle.direction = index
  }
}
// 初始化
const init = () => {
  const canvas = cvsRef.value
  ctx.value = canvas.getContext('2d')
  createHDCanvas(canvas, window.innerWidth, window.innerHeight)
  window.onresize = () => {
    createHDCanvas(canvas, window.innerWidth, window.innerHeight)
  }
  document.addEventListener('keydown', (e) => {
    const ctrl_z = e.ctrlKey && e.keyCode === 90
    const ctrl_c = e.ctrlKey && e.keyCode === 67
    const ctrl_v = e.ctrlKey && e.keyCode === 86
    // 撤回
    if (ctrl_z) {
      shapList.pop()
    } else if (ctrl_c) {
      // 复制当前图形
      if (activeShape.value) {
        const copyShape = JSON.stringify(activeShape.value)
        navigator.clipboard.writeText(copyShape)
        copyShapeInfo.x = 100
        copyShapeInfo.y = 100
      }
    } else if (ctrl_v) {
      // 粘贴复制的图形
      navigator.clipboard.readText().then((res) => {
        const copyShape = JSON.parse(res)
        let shape: any
        const name = copyShape.name
        switch (name) {
          case 'rect':
            shape = new Rect(copyShape.info, copyShape.style)
            break
          case 'roundRect':
            shape = new RoundRect(copyShape.info, copyShape.style)
            break
          case 'ellipse':
            shape = new Ellipse(copyShape.info, copyShape.style)
            break
          case 'circle':
            shape = new Circle(copyShape.info, copyShape.style)
            break
          case 'line':
            shape = new Line(copyShape.info, copyShape.style)
            break
          case 'text':
            shape = new Text(copyShape.info, copyShape.style)
            break
          default:
            break
        }
        Object.keys(copyShape).forEach((item) => {
          shape[item] = copyShape[item]
        })
        shape.info.x = copyShapeInfo.x
        shape.info.y = copyShapeInfo.y
        copyShapeInfo.x += 30
        copyShapeInfo.y += 30
        shapList.push(shape)
      })
    }
  })
  const animate = () => {
    requestAnimationFrame(animate)
    ctx.value.clearRect(0, 0, canvas.width, canvas.height)
    shapList.forEach((item) => {
      item.draw(ctx.value)
    })

    if (activeShape.value) {
      modifyShow.value = true
      shapList.forEach((item) => {
        item.isActive = false
      })
      activeShape.value.isActive = true
    } else {
      isCreate.value = false
      modifyShow.value = false
      shapList.forEach((item) => {
        item.isActive = false
      })
    }
  }
  animate()
}
const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
}
// =========================canvas鼠标事件===================================
const mouseDown = (e: any) => {
  const x: number = e.offsetX
  const y: number = e.offsetY
  mouseDownPosition.x = x
  mouseDownPosition.y = y
  isCreate.value = true
  settingShow.value = false
  if (isCreate.value) {
    switch (mode.value) {
      case 0:
        defaultMode(x, y)
        break
      case 1:
        drawRect(x, y)
        break
      case 2:
        drawRoundRect(x, y)
        break
      case 3:
        drawCircle(x, y)
        break
      case 4:
        drawEllipse(x, y)
        break
      case 5:
        drawLine(x, y)
        break
      case 6:
        textIptShow.value = true
        textIptStyle.width = 100 + 'px'
        textIptStyle.left = x + 'px'
        textIptStyle.top = y + 'px'
        nextTick(() => {
          textIpt.value.focus()
        })
        drawText(x, y)
        break
      default:
        break
    }
  }
  if (activeShape.value) {
    if (activeShape.value.moveDir(x, y)) {
      changeDir.value = activeShape.value.moveDir(x, y)
    }

    lastShapeInfo.value = JSON.parse(JSON.stringify(activeShape.value))
  }
}

const mouseMove = (e: any) => {
  const x = e.offsetX
  const y = e.offsetY

  // 创建图形时改变图形尺寸
  if (isCreate.value) {
    if (activeShape.value.name !== 'line') {
      if (x < mouseDownPosition.x) {
        activeShape.value.info.x = x
        activeShape.value.info.width = mouseDownPosition.x - x
      } else {
        activeShape.value.info.width = x - activeShape.value.info.x
      }
      if (y < mouseDownPosition.y) {
        activeShape.value.info.y = y
        activeShape.value.info.height = mouseDownPosition.y - y
      } else {
        activeShape.value.info.height = y - activeShape.value.info.y
      }
    } else {
      activeShape.value.info.width = x - activeShape.value.info.x
      activeShape.value.info.height = y - activeShape.value.info.y
      activeShape.value.endX = x
      activeShape.value.endY = y
    }
  }
  // 根据鼠标是否在聚焦图形上，改变鼠标形状
  if (activeShape.value) {
    if (activeShape.value.isInside(x, y)) {
      // 判断是否可移动
      canvasCursor.value = 'move'
    } else {
      canvasCursor.value = 'default'
    }
    // 根据不同锚点改变鼠标样式
    if (activeShape.value.moveDir(x, y)) {
      canvasCursor.value = activeShape.value.moveDir(x, y)
    }
  }

  if (isMove.value) {
    moveDir(x, y, activeShape, lastShapeInfo, changeDir, ctx, mouseDownPosition)
  }
}

const mouseUp = () => {
  isMove.value = false
  isCreate.value = false
  changeDir.value = ''
  if (!isLock.value) {
    mode.value = 0
    canvasCursor.value = 'default'
  }
  lastShapeInfo.value = null
}

const dblClick = () => {
  if (activeShape.value) {
    lastShap.value = activeShape.value
    const { x, y, width, height } = activeShape.value.info
    textIptShow.value = true
    textIptStyle.width = width + 'px'
    textIptStyle.left = x + 'px'
    textIptStyle.top = y + height / 2 - 10 + 'px'

    if (activeShape.value.text) {
      textIptValue.value = activeShape.value.text
      activeShape.value.text = ''
    } else {
      textIptValue.value = ''
    }

    nextTick(() => {
      textIpt.value.focus()
    })
  } else {
    return
  }
}

const keyDown = (e: any) => {
  // 删除聚焦图形
  if (e.keyCode === 8) {
    if (activeShape.value) {
      const index = shapList.indexOf(activeShape.value)
      shapList.splice(index, 1)
    }
  }
  console.log(e.keyCode)
}
const textIptBlur = () => {
  if (lastShap.value) {
    lastShap.value.text = textIpt.value.value
    lastShap.value = null
    textIptShow.value = false
  }
}

const save = () => {
  const url = cvsRef.value.toDataURL()
  const date = new Date()
  const a = document.createElement('a')
  a.setAttribute('download', 'draw-' + date.getTime())
  a.href = url
  a.click()
}
// =====================移动图形======================================
const defaultMode = (x: number, y: number) => {
  isCreate.value = false
  const pointList: any[] = []
  shapList.forEach((item: any, index: number) => {
    item.style.zIndex = index
    if (item.isInside(x, y)) {
      pointList.push(item)
    }
  })

  if (pointList.length) {
    pointList.sort((a, b) => b.style.zIndex - a.style.zIndex)
    activeShape.value = pointList[0]
    const zIndexs = shapList.map((item) => item.style.zIndex)
    activeShape.value.style.zIndex = Math.max(...zIndexs) + 1
    shapList.sort((a, b) => a.style.zIndex - b.style.zIndex)
  } else {
    activeShape.value = null
  }
  if (activeShape.value) {
    isMove.value = true
    activeShape.value.offsetX = x - activeShape.value.info.x
    activeShape.value.offsetY = y - activeShape.value.info.y
  }
}
// ========================修改图形样式====================================
// 绘制模式改变
const changeMode = (m: number) => {
  mode.value = m
}
// 修改边框颜色
const changeBorderStyle = (item: any) => {
  activeShape.value.style.border = item.color
}
const borderChangeIpt = (value: string | null) => {
  activeShape.value.style.border = value as string
  activeShapBorderColor.value = value as string
}
// 修改背景颜色
const changeBgcStyle = (item: any) => {
  activeShape.value.style.background = item.color
}
const bgcChangeIpt = (value: string | null) => {
  activeShape.value.style.background = value
  activeShapBgcColor.value = value as string
}
// 修改边框宽度
const changeBorderWidth = (item: any) => {
  activeShape.value.style.borderWidth = item.borderWidth
}

// 背景模式改变
const bgcModeChange = (value: number) => {
  if (activeShape.value) {
    activeShape.value.bgcMode = value
  }
}
// 添加单个渐变颜色
const addGradient = () => {
  if (activeShape.value.linearGradientStyle.colors.length === 10) {
    ElMessage({
      message: '最多十个，不能再加啦！',
      type: 'warning'
    })
    return
  }
  activeShape.value.linearGradientStyle.colors.push({
    id: activeShape.value.linearGradientStyle.colors.length + 1,
    color: '#000',
    offset: 0
  })
  activeShape.value.linearGradientStyle.colors.forEach((item: any, index: number) => {
    const length = activeShape.value.linearGradientStyle.colors.length
    item.offset = Number((1 / (length - 1)).toFixed(2)) * index
    if (index === length - 1) {
      item.offset = 1
    }
  })
}
// 移除单个渐变颜色
const removeSingleGradient = (index: number) => {
  activeShape.value.linearGradientStyle.colors.splice(index, 1)
}
// 修改单个渐变色
const singleGradientChange = (e: string | null, index: number) => {
  activeShape.value.linearGradientStyle.colors[index].color = e as string
}

// ==========================setting按钮事件==================================
const reset = () => {
  if (shapList.length) {
    ElMessageBox.confirm('确定清空画布吗?')
      .then(() => {
        ctx.value.clearRect(0, 0, cvsRef.value.width, cvsRef.value.height)
        shapList.splice(0, shapList.length)
        activeShape.value = null
        ElNotification({
          title: 'Success',
          message: '画布已清空',
          type: 'success'
        })
      })
      .catch(() => {
        ElMessage({
          message: '可能出现了bug',
          type: 'error'
        })
      })
  } else {
    ElMessage({
      message: '画布已经很干净啦！',
      type: 'success'
    })
  }
}
// 监控
watch(activeShape, () => {
  if (activeShape.value) {
    bgcMode.value = activeShape.value.bgcMode
  } else {
    bgcMode.value = 0
  }
})
// 生命周期
onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
@import url(./canvas.scss);
</style>
