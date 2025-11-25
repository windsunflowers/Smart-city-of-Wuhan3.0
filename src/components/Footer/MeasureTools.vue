<template>
  <el-popover
    placement="top"
    trigger="click"
    popper-style="background-color:#53697670;color:#fff"
    :width="100"
  >
    <template #reference>
      <slot></slot>
    </template>
    <div class="popover-w">
      <i
        v-for="item in tools"
        :class="computedClass(item)"
        @click="measure(item)"
      ></i>
    </div>
  </el-popover>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import {
  DrawPolygon,
  DrawCircle,
  DrawRect,
  DrawLine,
  DrawEvent,
} from '@antv/l7-draw'

// 定义响应式数据
const tools = ref([
  'drawPolygonTool',
  'drawRectTool',
  'drawCircleTool',
  'line',
  'delete',
])

// 定义计算属性
const computedClass = computed(() => {
  return (item) => {
    const res = {
      iconfont: true,
      'query-item': true,
    }
    res[`icon-${item}`] = true
    return res
  }
})

// 定义查询绘制函数
let draw = null
const { scene } = inject('$scene_map')

function measure(type) {
  if (draw) {
    draw.disable()
    draw.clear()
  }
  switch (type) {
    case 'drawPolygonTool':
      draw = new DrawPolygon(scene, {
        //展示面积
        areaOptions: {},
      })
      break
    case 'drawRectTool':
      draw = new DrawRect(scene, {
        //展示面积
        areaOptions: {},
      })
      break
    case 'drawCircleTool':
      draw = new DrawCircle(scene, {
        //展示面积
        areaOptions: {},
      })
      break
    case 'line':
      draw = new DrawLine(scene, {
        distanceOptions: {
          // 是否展示总距离
          showTotalDistance: false,
          // 是否展示一段的距离
          showDashDistance: true,
          // 展示的格式
          format: (meters) => {
            if (meters >= 1000) {
              return +(meters / 1000).toFixed(2) + 'km'
            } else {
              return +meters.toFixed(2) + 'm'
            }
          },
        },
      })
      break
    case 'delete':
      if (draw) {
        draw.disable()
        draw.clear()
      }
      draw = null
    default:
      return
  }

  if (draw) {
    draw.enable()
  }
}
</script>

<style scoped>
.popover-w {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.query-item:hover {
  cursor: pointer;
  background: linear-gradient(
    to bottom,
    rgba(0, 128, 255, 0.6),
    rgba(0, 128, 255, 0.281)
  );
}
</style>
