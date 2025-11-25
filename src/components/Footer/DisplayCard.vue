<template>
  <div class="display-card">
    <el-table
      :data="computedData"
      size="small"
      :max-height="400"
      @row-click="handleRowClick"
    >
      <el-table-column prop="event_num" label="事件编号"></el-table-column>
      <el-table-column prop="name" label="类型"></el-table-column>
      <el-table-column label="操作">
        <el-button size="small" type="primary" link>详情</el-button>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed, inject, ref, onUnmounted } from 'vue'
import { PointLayer } from '@antv/l7'

const props = defineProps({
  tableData: {
    type: Array,
  },
})
const emit = defineEmits(['close'])

const { scene, map } = inject('$scene_map')
// 使用全局变量存储雷达图层
let markerLayer = null

// 导出清除雷达图的方法
function clearRadarMarker() {
  if (markerLayer) {
    scene.removeLayer(markerLayer)
    markerLayer = null
  }
}

defineExpose({ clearRadarMarker })

const computedData = computed(() => {
  return props.tableData.map((item) => {
    const {
      geometry,
      properties: { event_num, name },
    } = item

    return {
      geometry,
      event_num,
      name,
    }
  })
})

function handleRowClick(row) {
  // 清除已经存在的图层
  clearRadarMarker()

  // 根据坐标绘制点
  const data = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: row.geometry.coordinates,
        },
      },
    ],
  }
  
  // 创建新的雷达图层
  markerLayer = new PointLayer({
    name: 'event-radar-layer' // 添加名称便于识别和管理
  })
    .source(data)
    .shape('radar')
    .size(20)
    .color('#f00')
    .animate(true)

  scene.addLayer(markerLayer)

  // 修改飞行导航，设置pitch为0实现俯视效果
  map.flyTo({
    center: row.geometry.coordinates,
    zoom: 15,
    speed: 1,
    pitch: 0, // 改为0，实现俯视
    bearing: 0 // 确保方向朝北
  })
  
  emit('close')
}

// 在组件卸载时不清除雷达图，让用户手动清除
</script>

<style scoped>
.display-card {
  position: fixed;
  bottom: 80px;
  background: #53697670;
  border-radius: 4px;
  box-shadow: 0 0 5px 3px #333;
}
.eleCeil {
  background: transparent;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-table) {
  background-color: transparent;
}

:deep(.el-table tr) {
  background-color: transparent;
  color: #fff;
  cursor: pointer;
}

:deep(.el-table tr:hover) {
  color: #333;
  background-color: rgba(0, 0, 0, 0.5);
}

:deep(.el-table--enable-row-transition .el-table__body td.el-table__cell) {
  background-color: transparent;
}

:deep(.el-table th.el-table__cell) {
  background-color: transparent;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: none;
}

:deep(.el-table__inner-wrapper::before) {
  height: 0;
}
:deep(.el-table.is-scrolling-right th.el-table-fixed-column--right) {
  background-color: transparent;
}
</style>
