<template>
  <el-dialog
    v-model="layerDialogVisible"
    title="图层切换"
    width="400px"
    :before-close="handleDialogClose"
  >
    <div class="layer-dialog-content">
      <div class="layer-group">
        <h4>基础设施图层</h4>
        <el-checkbox-group v-model="tempSelectedLayers" @change="handleLayerChange">
          <el-checkbox label="undergroundPipes">地铁线路</el-checkbox>
          <el-checkbox label="powerGrid">水体</el-checkbox>
          <el-checkbox label="universities">大学</el-checkbox>
          <el-checkbox label="hospitals">医院</el-checkbox>
        </el-checkbox-group>
        
        <br>
        <br>
        
        <h4>其他图层</h4>
        <el-checkbox-group v-model="tempSelectedLayers" @change="handleLayerChange">
          <el-checkbox label="peopleHeatmap">人口热力图</el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="layer-group">
        <h4>地图元素透明度</h4>
        <div class="opacity-control">
          <span>建筑/道路/桥梁:</span>
          <el-slider 
            v-model="tempMapElementsOpacity" 
            :min="0.1" 
            :max="1" 
            :step="0.1"
            show-input
            @input="handleOpacityChange"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="applyLayerChanges">应用</el-button>
      </span>
    </template>
  </el-dialog>

  <div class="legend-container" v-if="selectedLayers.length > 0">
    <div class="legend-title">当前图层</div>
    <div class="legend-item" v-for="layer in selectedLayers" :key="layer">
      <span class="legend-icon" :class="`legend-${layer}`"></span>
      <span class="legend-text">{{ getLayerName(layer) }}</span>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, nextTick, onMounted, defineExpose } from 'vue'
import { ElDialog, ElCheckbox, ElButton, ElSlider, ElCheckboxGroup } from 'element-plus'

// 图层切换核心逻辑
const { scene } = inject('$scene_map')
const injectedHeatmapLayer = inject('peopleHeatmapLayer', ref(null))
const layerDialogVisible = ref(false)
const selectedLayers = ref([])
const tempSelectedLayers = ref([])
const mapElementsOpacity = ref(1)
const tempMapElementsOpacity = ref(1)

// 初始化图层状态
onMounted(() => {
  setTimeout(() => {
    updateSelectedLayersFromScene()
  }, 2000)
})

// 从场景中更新已选择的图层
const updateSelectedLayersFromScene = () => {
  if (!scene) return
  
  selectedLayers.value = []
  
  scene.getLayers().forEach(layer => {
    if (!layer.name) return
    
    if (/地下水管道/i.test(layer.name) && layer.isVisible()) {
      selectedLayers.value.push('undergroundPipes')
    } else if (/电网/i.test(layer.name) && layer.isVisible()) {
      selectedLayers.value.push('powerGrid')
    } else if (/大学|武汉大学建筑/i.test(layer.name) && layer.isVisible()) {
      selectedLayers.value.push('universities')
    } else if (/医院|武汉医院点位/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('hospitals')) {
        selectedLayers.value.push('hospitals')
      }
    } else if (/人口热力图|热力图/i.test(layer.name) && layer.isVisible()) {
      selectedLayers.value.push('peopleHeatmap')
    }
  })
}

// 打开对话框 (这个方法将暴露给父组件)
const showLayerDialog = () => {
  updateSelectedLayersFromScene()
  tempSelectedLayers.value = [...selectedLayers.value]
  tempMapElementsOpacity.value = mapElementsOpacity.value
  layerDialogVisible.value = true
}

// 实时处理图层变化
const handleLayerChange = () => {
  selectedLayers.value = [...tempSelectedLayers.value]
  updateLayerVisibility()
}

// 实时处理透明度变化
const handleOpacityChange = () => {
  mapElementsOpacity.value = tempMapElementsOpacity.value
  updateLayerVisibility()
}

// 更新图层可见性
const updateLayerVisibility = () => {
  if (!scene) return
  
  scene.getLayers().forEach(layer => {
    if (!layer.name) return
    
    try {
      if (/地下水管道/i.test(layer.name)) {
        selectedLayers.value.includes('undergroundPipes') ? layer.show() : layer.hide()
      } else if (/电网/i.test(layer.name)) {
        selectedLayers.value.includes('powerGrid') ? layer.show() : layer.hide()
      } else if (/大学|武汉大学建筑/i.test(layer.name)) {
        selectedLayers.value.includes('universities') ? layer.show() : layer.hide()
      } else if (/医院|武汉医院点位/i.test(layer.name)) {
        selectedLayers.value.includes('hospitals') ? layer.show() : layer.hide()
      } else if (/人口热力图|热力图/i.test(layer.name)) {
        selectedLayers.value.includes('peopleHeatmap') ? layer.show() : layer.hide()
        if (selectedLayers.value.includes('peopleHeatmap')) {
          layer.setZIndex(10)
        }
      } else if (/武汉市|道路|桥梁/i.test(layer.name)) {
        layer.style({ opacity: mapElementsOpacity.value })
      }
    } catch (err) {
      console.warn(`更新图层 ${layer.name} 可见性失败:`, err.message)
    }
  })
  
  if (injectedHeatmapLayer.value) {
    try {
      if (selectedLayers.value.includes('peopleHeatmap')) {
        injectedHeatmapLayer.value.show()
        injectedHeatmapLayer.value.setZIndex(10)
      } else {
        injectedHeatmapLayer.value.hide()
      }
    } catch (err) {
      console.warn('通过注入的热力图图层更新失败:', err.message)
    }
  }
}

// 应用按钮触发更新
const applyLayerChanges = () => {
  selectedLayers.value = [...tempSelectedLayers.value]
  mapElementsOpacity.value = tempMapElementsOpacity.value
  updateLayerVisibility()
  nextTick(() => {
    layerDialogVisible.value = false
  })
}

// 取消按钮处理
const handleDialogClose = () => {
  // 恢复原始状态
  selectedLayers.value = [...tempSelectedLayers.value]
  mapElementsOpacity.value = tempMapElementsOpacity.value
  updateLayerVisibility()
  layerDialogVisible.value = false
}

// 图层名称映射
const getLayerName = (layerKey) => {
  const layerNames = {
    undergroundPipes: '地铁线路',
    powerGrid: '水体',
    universities: '大学',
    hospitals: '医院',
    peopleHeatmap: '人口热力图'
  }
  return layerNames[layerKey] || layerKey
}

// 使用 defineExpose 将 showLayerDialog 方法暴露出去
defineExpose({
  showLayerDialog
})
</script>

<style scoped>
/* 图层对话框样式 */
.layer-dialog-content {
  padding: 10px;
}
.layer-group {
  margin-bottom: 20px;
}
.layer-group h4 {
  margin-bottom: 15px;
  color: #409eff;
  font-size: 16px;
}
.opacity-control {
  display: flex;
  align-items: center;
}
.opacity-control span {
  margin-right: 15px;
  width: 120px;
}

/* 图例样式 */
.legend-container {
  position: fixed;
  left: 20px;
  bottom: 140px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 4px;
  color: white;
  z-index: 10;
  max-width: 200px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 8px;
  border-bottom: 1px solid #555;
  padding-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.legend-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 2px;
}

.legend-undergroundPipes {
  background: #fbff00ff;
}
.legend-powerGrid {
  background: #4dd2f7ff;
}
.legend-universities {
  background: #236ef0ff;
}
.legend-hospitals {
  background: #e90000;
}
.legend-peopleHeatmap {
  background: linear-gradient(90deg, #000080, #FF0000);
}

.legend-text {
  font-size: 12px;
}
</style>