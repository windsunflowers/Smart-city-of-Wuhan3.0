<!-- // Legend.vue 的优化版 script setup
<script setup>
import { ref } from 'vue'

// 1. 先定义颜色，确保变量已被声明
const layerColors = {
  roads: '#dec163f8',
  buildings: '#0d587eff',
  universities: '#32CD32', // 注意：建议统一改为 universities
  bridges: '#2824f6ff',
  undergroundPipes: '#fbff00ff',
  powerGrid: '#4dd2f7ff',
  hospitals: '#DC143C'
}

// 2. 初始化 activeLayers
// 这里硬编码了4个图层，只要组件加载，这4个必定会显示
const activeLayers = ref([
  { type: 'roads', name: '道路', color: layerColors.roads },
  { type: 'buildings', name: '建筑', color: layerColors.buildings },
  { type: 'universities', name: '大学', color: layerColors.universities },
  { type: 'bridges', name: '桥梁', color: layerColors.bridges }
])

// 获取名称
const getLayerName = (type) => {
  const names = {
    roads: '道路',
    buildings: '建筑',
    universities: '大学',
    bridges: '桥梁',
    // ... 其他
  }
  return names[type] || type
}

// 检查是否激活
const isLayerActive = (type) => activeLayers.value.some(l => l.type === type)

// 切换逻辑
const toggleLayer = (layerType) => {
  const index = activeLayers.value.findIndex(l => l.type === layerType)
  
  if (index === -1) {
    // 添加
    activeLayers.value.push({
      type: layerType,
      name: getLayerName(layerType),
      color: layerColors[layerType] || '#ccc'
    })
    console.log('显示:', layerType)
    // 这里加上 map.setLayoutProperty...
  } else {
    // 移除
    activeLayers.value.splice(index, 1)
    console.log('隐藏:', layerType)
    // 这里加上 map.setLayoutProperty...
  }
}
</script> -->