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
        :class="`iconfont query-item icon-${item}`"
        @click="queryEvents(item)"
      ></i>
    </div>
  </el-popover>
  <DisplayCard
    v-if="showTable"
    :table-data="dataSource"
    @close="handleClose"
    ref="displayCardRef"
  ></DisplayCard>
</template>

<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { DrawEvent, DrawPolygon, DrawRect, DrawCircle } from '@antv/l7-draw'
import { point, polygon, booleanPointInPolygon } from '@turf/turf'
import { getEvents } from '@/api/smart_city.js'

import DisplayCard from './DisplayCard.vue'

let eventsData = null

const tools = ref([
  'drawPolygonTool',
  'drawRectTool',
  'drawCircleTool',
  'delete',
])
const dataSource = ref([])
const open = ref(true)
const displayCardRef = ref(null) // 引用DisplayCard组件

const showTable = computed(() => {
  return dataSource.value.length > 0 && open.value
})

function handleClose() {
  open.value = false
}

onMounted(async () => {
  const res = await getEvents()
  eventsData = res.features
})

let draw = null
const { scene } = inject('$scene_map')

function queryEvents(type) {
  if (type === 'delete') {
    // 清除绘制的图形
    if (draw) {
      draw.disable()
      draw.clear()
    }
    
    // 清除雷达图
    if (displayCardRef.value) {
      displayCardRef.value.clearRadarMarker()
    } else {
      // 备用方法：通过图层名称查找并删除
      const layers = scene.getLayers()
      const radarLayer = layers.find(layer => layer.name === 'event-radar-layer')
      if (radarLayer) {
        scene.removeLayer(radarLayer)
      }
    }
    
    // 清空查询结果并关闭表格
    dataSource.value = []
    open.value = false
    
    draw = null
    return
  }
  
  // 处理其他绘图工具
  if (draw) {
    draw.disable()
    draw.clear()
  }
  
  switch (type) {
    case 'drawPolygonTool':
      draw = new DrawPolygon(scene, {})
      break
    case 'drawRectTool':
      draw = new DrawRect(scene, {})
      break
    case 'drawCircleTool':
      draw = new DrawCircle(scene, {})
      break
  }
  
  if (draw) {
    draw.enable()
    draw.on(DrawEvent.Change, (allFeatures) => {
      // 找出最后绘制的图形(多边形)
      const activeFeature = allFeatures[allFeatures.length - 1]

      allFeatures.forEach((item, index) => {
        // 除了最后一个, 其余的都删除掉
        if (index !== allFeatures.length - 1) {
          draw.removeFeature(item)
        }
      })
      
      if (eventsData && activeFeature) {
        const {
          geometry: { coordinates: coordinatesActive },
        } = activeFeature

        const resData = eventsData.filter((item) => {
          const { geometry } = item
          if (geometry.type === 'Point') {
            const pt = point(geometry.coordinates)
            const poly = polygon(coordinatesActive)
            return booleanPointInPolygon(pt, poly)
          }
          return false
        })
        
        // 获取到查询的结果
        dataSource.value = resData
        open.value = true
      }
    })
  }
}
</script>

<style scoped>
.el-button + .el-button {
  margin-left: 8px;
}

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
