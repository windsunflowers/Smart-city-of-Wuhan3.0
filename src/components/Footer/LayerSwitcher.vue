<template>
  <el-dialog
    v-model="layerDialogVisible"
    title="图层切换"
    width="400px"
    :before-close="handleDialogClose"
    class="glass-dialog"
  >
    <div class="layer-dialog-content">
      <div class="layer-group">
        <h4>基础设施图层</h4>
        <el-checkbox-group v-model="tempSelectedLayers" @change="handleLayerChange">
          <el-checkbox label="undergroundPipes">地铁线路</el-checkbox>
          <el-checkbox label="powerGrid">水体</el-checkbox>
          <el-checkbox label="universities">大学</el-checkbox>
          <el-checkbox label="hospitals">医院</el-checkbox>
          <el-checkbox label="bridges">桥梁</el-checkbox>
          <el-checkbox label="buildings">建筑</el-checkbox>
          <el-checkbox label="roads">道路</el-checkbox>
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

onMounted(() => {
  // 2. 设置延迟，例如 2000 毫秒（2秒）后才加载默认图层
  setTimeout(() => {
    // 这里填入你希望延迟显示的默认图层
    selectedLayers.value = ['roads', 'buildings', 'bridges', 'universities']
    
    // 🔥 重要：赋值后，建议手动触发一次图层可见性更新，确保地图上的图层也同步显示/隐藏
    // updateLayerVisibility() 
  }, 2000) 
})
const updateSelectedLayersFromScene = () => {
  if (!scene) return
 
  selectedLayers.value = [] // 清空列表
  
  scene.getLayers().forEach(layer => {
    if (!layer.name) return
    
    // === 修复开始：每个判断都加上 !selectedLayers.value.includes(...) ===

    if (/地下水管道/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('undergroundPipes')) {
        selectedLayers.value.push('undergroundPipes')
      }
    } 
    else if (/电网/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('powerGrid')) {
        selectedLayers.value.push('powerGrid')
      }
    } 
    else if (/大学|武汉大学建筑/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('universities')) {
        selectedLayers.value.push('universities')
      }
    } 
    // 医院这里你之前写对了，保持原样
    else if (/医院|武汉医院点位/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('hospitals')) {
        selectedLayers.value.push('hospitals')
      }
    } 
    else if (/人口热力图|热力图/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('peopleHeatmap')) {
        selectedLayers.value.push('peopleHeatmap')
      }
    } 

    // === 重点：修复建筑的重复添加 ===
    else if (/建筑|白膜|楼|房屋|buildings/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('buildings')) {
        selectedLayers.value.push('buildings')
      }
    } 
    // === 重点：修复道路的重复添加 ===
    else if (/路|道路/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('roads')) {
         selectedLayers.value.push('roads')
      }
    } 
    
    // === 重点：修复桥梁的重复添加 ===
    else if (/桥梁|武汉桥梁点位/i.test(layer.name) && layer.isVisible()) {
      if (!selectedLayers.value.includes('bridges')) {
        selectedLayers.value.push('bridges')
      }
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
      // 1. 地下管道 (保持原样)
      if (/地下水管道/i.test(layer.name)) {
        selectedLayers.value.includes('undergroundPipes') ? layer.show() : layer.hide()
      } 
      // 2. 电网 (保持原样)
      else if (/电网/i.test(layer.name)) {
        selectedLayers.value.includes('powerGrid') ? layer.show() : layer.hide()
      } 
      // 3. 大学 (保持原样)
      else if (/大学|武汉大学建筑/i.test(layer.name)) {
        selectedLayers.value.includes('universities') ? layer.show() : layer.hide()
      } 
      // 4. 医院 (保持原样)
      else if (/医院|武汉医院点位/i.test(layer.name)) {
        selectedLayers.value.includes('hospitals') ? layer.show() : layer.hide()
      } 
      // 5. 热力图 (保持原样)
      else if (/人口热力图|热力图/i.test(layer.name)) {
        if (selectedLayers.value.includes('peopleHeatmap')) {
          layer.show()
          layer.setZIndex(10)
        } else {
          layer.hide()
        }
      } 
      
      // === 核心修复区域 ===
      
      else if (/建筑|白膜|楼|房屋|buildings/i.test(layer.name)) {
        if (selectedLayers.value.includes('buildings')) {
          layer.show()
          layer.style({ opacity: mapElementsOpacity.value })
        } else {
          layer.hide()
        }
      }
      
      // 7. 桥梁 (注意：必须放在“道路”之前判断，因为你之前的道路正则里包含了"桥梁")
      else if (/桥梁|武汉桥梁点位/i.test(layer.name)) {
        if (selectedLayers.value.includes('bridges')) {
          layer.show()
          layer.style({ opacity: mapElementsOpacity.value })
        } else {
          layer.hide()
        }
      }

      // 8. 道路 (修复：去掉正则里的"桥梁"，防止冲突；添加 show/hide 逻辑)
      // 原正则 /武汉市|道路|桥梁/ 会把桥梁也吃掉，建议去掉 "桥梁"
      else if (/路|道路/i.test(layer.name)) {
        if (selectedLayers.value.includes('roads')) {
          layer.show()
          layer.style({ opacity: mapElementsOpacity.value })
        } else {
          layer.hide()
        }
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
    peopleHeatmap: '人口热力图',
    roads: '道路',
    buildings: '建筑',
    bridges: '桥梁'
  }
  return layerNames[layerKey] || layerKey
}

// 使用 defineExpose 将 showLayerDialog 方法暴露出去
defineExpose({
  showLayerDialog
})
</script>

<style scoped>
/* =========================================
   1. 强制覆盖 Element Plus 默认样式 (消除白框)
   ========================================= */

/* 把最外层的白色壳子变透明，去掉阴影 */
:deep(.el-dialog) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  --el-dialog-margin-top: 15vh; /* 保持默认位置 */
}

/* 修复标题栏：背景透明，文字改亮色 */
:deep(.el-dialog__header) {
  margin-right: 0 !important;
  padding: 20px 20px 10px !important; /* 调整标题位置 */
  background: transparent !important;
  z-index: 10; /* 确保标题在玻璃层之上 */
  position: relative;
}

/* 标题文字发光效果 */
:deep(.el-dialog__title) {
  color: #fff !important;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.8);
}

/* 关闭按钮(X) 改为浅蓝 */
:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #a0cfff !important;
  font-size: 18px;
}
:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #409eff !important;
}

/* 去掉默认的 body 内边距，让你的玻璃背景填满 */
:deep(.el-dialog__body) {
  padding: 0 !important;
  background: transparent !important;
}

/* 底部按钮区也设为透明 */
:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  background: transparent !important;
  text-align: right;
}

/* =========================================
   2. 您的自定义玻璃感界面 (内部样式)
   ========================================= */

/* 核心容器：这才是用户真正看到的“弹窗” */
.layer-dialog-content {
  padding: 10px 20px 20px 20px; /* 内部留白 */
  
  /* 深蓝渐变 + 玻璃磨砂 */
  background: linear-gradient(
    145deg, 
    rgba(12, 35, 68, 0.85) 0%, 
    rgba(4, 15, 30, 0.95) 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* 边框和圆角 */
  border: 1px solid rgba(64, 158, 255, 0.25);
  border-top: 1px solid rgba(64, 158, 255, 0.4);
  border-radius: 12px;
  
  /* 立体阴影 */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}

.layer-group {
  margin-bottom: 24px;
}

/* 标题样式 */
.layer-group h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #79bbff;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
  border-left: 3px solid #409eff;
  padding-left: 12px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.1), transparent);
  border-radius: 0 4px 4px 0;
  line-height: 1.5;
}

/* 文本样式 */
.opacity-control {
  display: flex;
  align-items: center;
}
.opacity-control span {
  margin-right: 15px;
  width: 120px;
  color: #dbf0ff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Checkbox 颜色适配 (确保文字能看清) */
:deep(.el-checkbox) {
  color: #dbf0ff !important;
}
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #409eff !important;
}

/* =========================================
   3. 图例样式 (保持不变)
   ========================================= */
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

.legend-undergroundPipes { background: #fbff00ff; }
.legend-powerGrid { background: #4dd2f7ff; }
.legend-universities { background: #236ef0ff; }
.legend-hospitals { background: #e90000; }
.legend-peopleHeatmap { background: linear-gradient(90deg, #000080, #FF0000); }
.legend-roads { background: #ffffffff; }
.legend-buildings { background: #6400deff; }
.legend-bridges { background: #f3b763ff; }

.legend-text {
  font-size: 12px;
}
</style>
<style>
/* === 核心逻辑：直接修改弹窗外壳 === */
.glass-dialog.el-dialog {
  /* 1. 把原来的白色背景干掉，换成你的深蓝玻璃渐变 */
  background: linear-gradient(
    145deg, 
    rgba(12, 35, 68, 0.9) 0%, 
    rgba(4, 15, 30, 0.95) 100%
  ) !important;
  
  /* 2. 加上磨砂效果 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* 3. 边框和发光 */
  border: 1px solid rgba(64, 158, 255, 0.3) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5) !important;
  border-radius: 12px !important;
}

/* === 标题栏修正 === */
.glass-dialog .el-dialog__header {
  margin-right: 0 !important;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1); /* 给标题加个淡淡的分隔线 */
}

.glass-dialog .el-dialog__title {
  color: #79bbff !important; /* 标题改成亮蓝色 */
  font-weight: 600;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

/* 关闭按钮颜色 */
.glass-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #a0cfff !important;
}
.glass-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #fff !important;
}

/* === 内容区修正 === */
.glass-dialog .el-dialog__body {
  padding: 20px !important; /* 调整内边距 */
  color: #fff; /* 全局文字变白 */
}

/* === 底部按钮区修正 === */
.glass-dialog .el-dialog__footer {
  border-top: 1px solid rgba(64, 158, 255, 0.1); /* 底部加个淡淡的分隔线 */
  padding: 15px 20px !important;
}

/* 如果您原来的 .layer-dialog-content 里还有背景色，记得删掉，
   因为现在整个大弹窗已经是蓝色的了，不需要里面再套一层颜色。*/
</style>