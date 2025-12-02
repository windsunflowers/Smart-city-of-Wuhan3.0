<template>
  <el-popover 
    placement="top" 
    :width="350" 
    trigger="click"
    :hide-after="0"
    popper-class="glass-popover"
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
          
          <!-- <el-form-item 
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
          </el-form-item> -->

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
    defaultScale: 10}
  // ,
  // {
  //   id: 'building-3dtiles',
  //   name: '建筑模型 (3D Tiles)',
  //   type: '3dtiles',
  //   // 【重要修改】直接使用中文路径，不要手动编码
  //   tilesetUrl: 'http://192.168.3.111:8088/gaeaExplorerServer/model/webqxsy/武汉未来科技城/tileset.json',
  //   location: '114.297068, 30.547058'
  // }
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
/* ==========================================================================
   1. 根容器配置：强制覆盖 Element 变量，杜绝白框
   ========================================================================== */
.obj-models-container {
  /* --- 核心修复：把所有涉及背景白的变量设为透明 --- */
  --el-fill-color-blank: transparent !important;
  --el-bg-color: transparent !important;
  --el-bg-color-overlay: transparent !important;
  --el-border-color: transparent !important;
  --el-border-color-light: transparent !important;
  
  /* --- 文字颜色适配深色模式 --- */
  --el-text-color-primary: #ffffff !important;
  --el-text-color-regular: #a0cfff !important;
  --el-text-color-placeholder: #5a7d9f !important;
  --el-disabled-text-color: #4a5d73 !important;

  /* --- 自身的玻璃面板样式 --- */
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", sans-serif;
  
  /* 深蓝磨砂背景 */
  background: linear-gradient(145deg, rgba(4, 15, 30, 0.9) 0%, rgba(12, 35, 68, 0.85) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* 容器边框发光 */
  border: 1px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 20px;
}

/* ==========================================================================
   2. 深度穿透修复 (彻底清除 Input/Radio 白框)
   ========================================================================== */

/* 修复输入框 (Input) 的白底白框 */
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.3) inset !important;
  background-color: rgba(0, 0, 0, 0.25) !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF inset !important;
}
:deep(.el-input__inner) {
  color: #fff !important;
}

/* 修复单选框 (Radio) */
:deep(.el-radio) {
  color: #a0cfff !important;
  margin-right: 0;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

/* 单选框未选中时的圆圈颜色 */
:deep(.el-radio__inner) {
  background-color: transparent !important;
  border-color: rgba(64, 158, 255, 0.5) !important;
}

/* 单选框选中样式：深色高亮背景 */
:deep(.el-radio.is-checked) {
  background-color: rgba(64, 158, 255, 0.15) !important;
  border: 1px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.1) inset;
}
:deep(.el-radio.is-checked .el-radio__label) {
  color: #fff !important;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(64, 158, 255, 0.4);
}
:deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #409EFF !important;
  border-color: #409EFF !important;
}

/* 修复按钮 (Button) */
:deep(.el-button) {
  background: rgba(64, 158, 255, 0.15) !important;
  border: 1px solid rgba(64, 158, 255, 0.3) !important;
  color: #fff !important;
}
:deep(.el-button:hover) {
  background: rgba(64, 158, 255, 0.3) !important;
  border-color: #409EFF !important;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}
:deep(.el-button.is-disabled) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #666 !important;
}

/* ==========================================================================
   3. 内部布局样式优化
   ========================================================================== */

.models-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.2); /* 蓝光分割线 */
}

.models-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.4); /* 文字发光 */
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 单选组容器 */
.model-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 底部操作区 */
.model-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 15px;
  border-top: 1px solid rgba(64, 158, 255, 0.15);
}

.location-input-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.location-input-group .el-input {
  flex: 1;
}

/* 提示框：蓝光玻璃 */
.picking-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #a0cfff;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-left: 3px solid #409eff;
}

/* 错误提示：红光玻璃 */
.error-message {
  margin-top: 15px;
  color: #ff9b9b;
  font-size: 13px;
  background-color: rgba(245, 108, 108, 0.15);
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid rgba(245, 108, 108, 0.3);
  display: flex;
  align-items: center;
}

/* 加载动画 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  color: #a0cfff;
  font-size: 14px;
}

.spinner {
  border: 3px solid rgba(64, 158, 255, 0.1);
  border-left-color: #409eff; /* 亮蓝旋转 */
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.popover-footer {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid rgba(64, 158, 255, 0.2);
  text-align: right;
}
</style>
<style>
/* 注意：这里没有 scoped，必须是全局样式才能穿透到 body 下的 popover */

/* 1. 针对我们定义的 glass-popover 类，去掉所有默认白底 */
.el-popover.glass-popover {
  /* 背景全透明 */
  background: transparent !important;
  background-color: transparent !important;
  
  /* 去掉默认的灰色边框和阴影（因为你的内部容器已经自己写了好看的边框和阴影） */
  border: none !important;
  box-shadow: none !important;
  
  /* 去掉默认的内边距，让你内部的容器贴边 */
  padding: 0 !important;
  
  /* 强制覆盖 Element 变量 (双重保险) */
  --el-popover-bg-color: transparent !important;
  --el-popover-border-color: transparent !important;
  --el-popover-padding: 0 !important;
}

/* 2. 处理那个由于变透明而露出来的“小三角”箭头 */
/* 方案A：直接隐藏箭头（推荐，看起来更悬浮） */
.el-popover.glass-popover .el-popper__arrow {
  display: none !important;
}

/* 方案B：如果你非要保留箭头，就得把它也变色（比较麻烦，容易有色差，不建议） */
/* .el-popover.glass-popover .el-popper__arrow::before {
  background: rgba(4, 15, 30, 0.9) !important;
  border: 1px solid rgba(64, 158, 255, 0.3) !important;
} 
*/
</style>