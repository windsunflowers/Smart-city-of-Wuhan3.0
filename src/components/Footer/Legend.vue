<template>
  <div>
    <!-- 其他组件... -->
    <Legend ref="legendRef" />
    <!-- 图层切换按钮 -->
    <div class="layer-controls">
      <button @click="toggleLayer('roads')">道路</button>
      <button @click="toggleLayer('buildings')">建筑</button>
      <!-- 添加更多图层按钮... -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Legend from './Legend.vue'

const legendRef = ref(null)
const activeLayers = ref([])

// 定义图层颜色映射
const layerColors = {
  roads: '#dec163f8',
  buildings: '#0d587eff',
  undergroundPipes: '#fbff00ff',
  bridges: '#2824f6ff',
  powerGrid: '#4dd2f7ff',
  hospitals: '#DC143C'
}

// 切换图层显示
const toggleLayer = (layerType) => {
  // 这里实现您的图层切换逻辑
  
  // 更新图例
  updateLegend(layerType)
}

// 更新图例
const updateLegend = (layerType) => {
  // 检查是否已存在该图层
  const index = activeLayers.value.findIndex(layer => layer.type === layerType)
  
  if (index === -1) {
    // 添加新图层
    activeLayers.value.push({
      type: layerType,
      name: getLayerName(layerType),
      color: layerColors[layerType]
    })
  } else {
    // 移除图层
    activeLayers.value.splice(index, 1)
  }
  
  // 调用图例组件的更新方法
  legendRef.value?.updateLegend(activeLayers.value)
}

// 获取图层显示名称
const getLayerName = (type) => {
  const names = {
    roads: '道路',
    buildings: '建筑',
    undergroundPipes: '地下管道',
    bridges: '桥梁',
    powerGrid: '电网',
    hospitals: '医院'
  }
  return names[type] || type
}
</script>

<style>
.layer-controls {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 1000;
  display: flex;
  gap: 8px;
}

.layer-controls button {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.layer-controls button:hover {
  background: rgba(0, 0, 0, 0.9);
}
</style> -->