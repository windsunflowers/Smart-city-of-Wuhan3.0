<template>
  <el-popover 
    placement="top" 
    :width="350" 
    trigger="click"
    :hide-after="0"
    popper-class="model-popover"
    v-model:visible="popoverVisible">
    <template #reference>
      <slot></slot>
    </template>
    <div class="obj-models-container">
      <div class="models-header">
        <h3>模型与图层</h3>
      </div>
      
      <div class="models-content">
        <el-form size="small">
          <el-form-item label="选择">
            <el-radio-group v-model="selectedModel" class="model-radio-group">
              <el-radio 
                v-for="model in availableModels" 
                :key="model.id" 
                :label="model.id">
                {{ model.name }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item 
            label="3D Tiles URL" 
            v-if="currentModelInfo && currentModelInfo.type === '3dtiles'">
            <el-input 
              v-model="currentModelInfo.tilesetUrl"
              placeholder="https://.../tileset.json"
              size="small"
            />
            <div class="picking-hint">
              请输入 3D Tiles 数据集的 tileset.json 文件 URL
            </div>
          </el-form-item>

          <template v-if="currentModelInfo && currentModelInfo.type === 'obj'">
            <el-form-item label="放置位置">
              <div class="location-input-group">
                <el-input v-model="currentModelInfo.location" placeholder="经度,纬度"></el-input>
                <el-button type="info" size="small" @click.stop="startLocationPicker" :disabled="isPickingLocation">
                  {{ isPickingLocation ? '正在选择...' : '选择位置' }}
                </el-button>
              </div>
              <div v-if="isPickingLocation" class="picking-hint">
                请点击地图选择模型放置位置
              </div>
            </el-form-item>
            
            <el-form-item label="模型高度">
              <el-slider v-model="currentModelInfo.height" :min="0" :max="100" :step="0.1" show-input>
                <template #append>米</template>
              </el-slider>
            </el-form-item>
            
            <el-form-item label="缩放比例">
              <el-slider v-model="currentModelInfo.scale" :min="0.1" :max="50" :step="0.1" show-input></el-slider>
            </el-form-item>
            
            <el-form-item label="旋转角度">
              <el-slider v-model="currentModelInfo.rotation" :min="0" :max="360" show-input>
                <template #append>°</template>
              </el-slider>
            </el-form-item>
          </template>
          
          <div class="model-actions">
            <el-button type="primary" @click.stop="placeModel" :loading="isLoading">
              {{ isLoading ? '加载中...' : '放置' }}
            </el-button>
            <el-button type="danger" @click.stop="removeModel" :disabled="!isModelPlaced || isLoading">
              移除
            </el-button>
          </div>
          
          <div v-if="isLoading" class="loading-indicator">
            <div class="spinner"></div>
            <p>正在加载，请稍候...</p>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </el-form>
      </div>
      
      <div class="popover-footer">
        <el-button size="small" @click="popoverVisible = false">关闭</el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, inject, onBeforeUnmount, computed, watch } from 'vue'
import modelLoadHelper from './hooks/useObjModels.js'
import { add3DTilesLayer, remove3DTilesLayer } from './hooks/use3DTiles.js'

// 地图实例
const { map } = inject('$scene_map')

// Popover可见性控制
const popoverVisible = ref(false)

// 模型状态
const selectedModel = ref('house')
const isModelPlaced = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

// 为每个模型独立设置位置和参数
const availableModels = ref([
  { 
    id: 'house', 
    name: '房屋模型 (OBJ)',
    type: 'obj',
    objUrl: '/models/house/house.obj',
    mtlUrl: '/models/house/house.mtl',
    location: '114.26888, 30.5465555',
    height: 0,
    scale: 1,
    rotation: 0,
    defaultScale: 1
  },
  { 
    id: 'source', 
    name: '黄鹤楼 (OBJ)',
    type: 'obj',
    objUrl: '/models/source/model.obj',
    mtlUrl: '/models/source/model.mtl',
    location: '114.297068, 30.547058',
    height: 0,
    scale: 10,
    rotation: 0,
    defaultScale: 10
  },
  {
    id: 'building-3dtiles',
    name: '建筑模型 (3D Tiles)',
    type: '3dtiles',
    // 【重要修改】直接使用中文路径，不要手动编码
    tilesetUrl: 'http://192.168.3.111:8088/gaeaExplorerServer/model/webqxsy/武汉未来科技城/tileset.json',
    location: '114.297068, 30.547058'
  }
])

// 当前选择的模型信息
const currentModelInfo = computed(() => {
  return availableModels.value.find(model => model.id === selectedModel.value)
})

// 用于存储帮助类实例或图层信息
let modelHelperInstance = null
let activeLayerInfo = null 

// 监听模型切换
watch(selectedModel, (newModelId) => {
  console.log('切换到模型:', newModelId)
})

// 重构 placeModel 函数
const placeModel = async () => {
  try {
    errorMessage.value = ''
    isLoading.value = true
    
    // 如果已经有模型放置，先移除
    if (isModelPlaced.value) {
      removeModel()
    }
    
    const model = currentModelInfo.value
    if (!model) {
      errorMessage.value = '请选择一个模型'
      isLoading.value = false;
      return
    }

    const layerId = `custom-layer-${model.id}`
    
    // ===========================
    //  分支 1: 加载 OBJ 模型
    // ===========================
    if (model.type === 'obj') {
      const [lng, lat] = model.location.split(',').map(coord => parseFloat(coord.trim()))
      if (isNaN(lng) || isNaN(lat)) {
        errorMessage.value = '坐标格式无效，请使用"经度,纬度"格式'
        isLoading.value = false
        return
      }
      
      const options = {
        modelId: layerId,
        center: [lng, lat],
        height: model.height,
        angle: model.rotation,
        scale: { 
          x: model.scale, 
          y: model.scale, 
          z: model.scale 
        },
        modelType: model.type,
        objUrl: model.objUrl,
        mtlUrl: model.mtlUrl
      }
      
      console.log('开始加载OBJ模型:', model.name, '选项:', options)
      modelHelperInstance = new modelLoadHelper(map, options)
      await modelHelperInstance.addModel()
      
      activeLayerInfo = { 
        id: layerId, 
        type: 'obj',
        modelId: model.id 
      }
      flyToModel(lng, lat, model.id) 
    }
    
    // ===========================
    //  分支 2: 加载 3D Tiles 模型
    // ===========================
    else if (model.type === '3dtiles') {
      // 1. 确保使用原始 URL (中文)，不要手动编码，也不要解码
      // 因为我们要在 use3DTiles.js 里手动 fetch
      const finalUrl = model.tilesetUrl;

      const options = {
        id: layerId,
        url: finalUrl,
        maximumScreenSpaceError: 16
      }
      
      try {
        // 调用新的 Blob 代理加载逻辑
        await add3DTilesLayer(map, options)
        
        activeLayerInfo = { 
          id: layerId, 
          type: '3dtiles',
          modelId: model.id 
        }
        
        // 飞到模型位置
        if (model.location) {
          const [lng, lat] = model.location.split(',').map(Number)
          if (!isNaN(lng)) {
            flyToModel(lng, lat, model.id)
          }
        }
      } catch (error) {
        errorMessage.value = '加载失败: ' + error.message;
        isLoading.value = false;
        return;
      }
    }
    
    isLoading.value = false
    isModelPlaced.value = true
    
  } catch (error) {
    errorMessage.value = '放置失败: ' + error.message;
    isLoading.value = false;
  }
}

// 重构 removeModel 函数
const removeModel = () => {
  if (!activeLayerInfo) return
  
  try {
    errorMessage.value = ''
    console.log('移除模型:', activeLayerInfo.type, activeLayerInfo.id)
    
    if (activeLayerInfo.type === 'obj' && modelHelperInstance) {
      modelHelperInstance.removeModel(activeLayerInfo.id)
      modelHelperInstance = null
    }
    else if (activeLayerInfo.type === '3dtiles') {
      remove3DTilesLayer(map, { id: activeLayerInfo.id })
    }

    activeLayerInfo = null
    isModelPlaced.value = false
    console.log('模型移除成功')
  } catch (error) {
    console.error('移除失败:', error)
    errorMessage.value = '移除失败: ' + error.message
  }
}

// --- 位置选择功能 ---
const isPickingLocation = ref(false)

const startLocationPicker = () => {
  if (!currentModelInfo.value || currentModelInfo.value.type !== 'obj') return
  
  isPickingLocation.value = true
  map.getCanvas().style.cursor = 'crosshair'
  
  const clickHandler = (e) => {
    const { lng, lat } = e.lngLat
    currentModelInfo.value.location = `${lng.toFixed(6)}, ${lat.toFixed(6)}`
    stopLocationPicker()
    
    map.flyTo({
      center: [lng, lat],
      zoom: Math.max(map.getZoom(), 16),
      pitch: 60
    })
  }
  
  map.once('click', clickHandler)
  
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      stopLocationPicker()
      document.removeEventListener('keydown', escHandler)
    }
  }
  document.addEventListener('keydown', escHandler)
}

const stopLocationPicker = () => {
  isPickingLocation.value = false
  map.getCanvas().style.cursor = ''
}

// 飞到模型位置
const flyToModel = (lng, lat, modelId) => {
  let zoomLevel = 18
  let pitchValue = 60
  
  // 根据不同模型设置不同的视角
  if (modelId === 'house') {
    zoomLevel = 19
  } else if (modelId === 'source') {
    zoomLevel = 17
    pitchValue = 45
  } else if (modelId === 'building-3dtiles') {
    zoomLevel = 16 // 调整视角
    pitchValue = 45
  }
  
  map.flyTo({
    center: [lng, lat],
    zoom: zoomLevel,
    pitch: pitchValue,
    bearing: currentModelInfo.value?.rotation || 0,
    duration: 2000
  })
}

// 组件卸载时清理
onBeforeUnmount(() => {
  if (isModelPlaced.value) {
    removeModel()
  }
})
</script>

<style scoped>
/* 样式保持不变 */
.obj-models-container {
  padding: 15px;
}

.models-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.models-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.models-content {
  margin-top: 15px;
}

.model-radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-radio-group .el-radio {
  margin-right: 0;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.model-radio-group .el-radio.is-checked {
  background-color: #ecf5ff;
}

.model-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.location-input-group {
  display: flex;
  gap: 10px;
}

.location-input-group .el-input {
  flex: 1;
}

.picking-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 5px 10px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #409eff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-top: 15px;
  color: #f56c6c;
  font-size: 14px;
  background-color: #fef0f0;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #f56c6c;
}

.popover-footer {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
  text-align: right;
}
</style>

<style>
.model-popover {
  pointer-events: auto !important;
}
</style>