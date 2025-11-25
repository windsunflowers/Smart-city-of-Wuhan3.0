<template>
  <div class="camera-control" :class="{ collapsed: isCollapsed }">
    <!-- 标题栏 -->
    <div class="control-header" @mousedown="startDrag">
      <div class="header-content">
        <span class="title">视角控制</span>
        <div class="header-actions">
          <button class="action-btn" @click.stop="toggleCollapse" :title="isCollapsed ? '展开' : '收起'">
            <span class="icon">{{ isCollapsed ? '↗' : '↙' }}</span>
          </button>
          <button class="action-btn" @click.stop="resetCamera" title="重置视角">
            <span class="icon">🔄</span>
          </button>
          <button class="action-btn" @click.stop="toggleViewMode" :title="isGlobalView ? '切换到平面模式' : '切换到全球模式'">
            <span class="icon">{{ isGlobalView ? '🌍' : '🗺️' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 球形控制器 -->
    <div class="camera-content" v-show="!isCollapsed">
      <!-- 模式切换提示 -->
      <div class="mode-indicator">
        <span class="mode-tag" :class="{ global: isGlobalView, flat: !isGlobalView }">
          {{ isGlobalView ? '全球模式' : '平面模式' }}
        </span>
        <span class="location-info" v-if="!isGlobalView">📍 当前位置</span>
      </div>

      <!-- 球形控制区域 - 全球模式 -->
      <div class="sphere-container" v-if="isGlobalView">
        <div class="sphere" @mousedown="startSphereDrag" ref="sphereRef">
          <div class="sphere-inner">
            <!-- 控制点 -->
            <div 
              class="control-point" 
              :style="controlPointStyle"
              @mousedown="startPointDrag"
            ></div>
            
            <!-- 参考线 -->
            <div class="reference-lines">
              <div class="horizontal-line"></div>
              <div class="vertical-line"></div>
              <div class="center-dot"></div>
            </div>
          </div>
        </div>
        
        <!-- 方向指示 -->
        <div class="direction-indicators">
          <div class="direction north" title="北">N</div>
          <div class="direction east" title="东">E</div>
          <div class="direction south" title="南">S</div>
          <div class="direction west" title="西">W</div>
        </div>
      </div>

      <!-- 平面模式控制区域 -->
      <div class="flat-controls" v-else>
        <div class="flat-sphere-container">
          <div class="flat-sphere" @mousedown="startFlatSphereDrag" ref="flatSphereRef">
            <div class="flat-sphere-inner">
              <!-- 控制点 -->
              <div 
                class="flat-control-point" 
                :style="flatControlPointStyle"
                @mousedown="startFlatPointDrag"
              ></div>
              
              <!-- 参考线 -->
              <div class="flat-reference-lines">
                <div class="flat-horizontal-line"></div>
                <div class="flat-vertical-line"></div>
                <div class="flat-center-dot"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="flat-tips">
          <p>💡 拖动控制点调节俯仰和旋转</p>
        </div>
      </div>

      <!-- 数值控制 -->
      <div class="numeric-controls">
        <div class="control-group">
          <label class="control-label">俯仰角</label>
          <div class="slider-control">
            <input 
              type="range" 
              min="0" 
              max="90" 
              step="1"
              v-model.number="pitch"
              @input="updateFromSliders"
              class="slider"
            >
            <span class="value">{{ pitch }}°</span>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">旋转角</label>
          <div class="slider-control">
            <input 
              type="range" 
              min="0" 
              max="360" 
              step="1"
              v-model.number="bearing"
              @input="updateFromSliders"
              class="slider"
            >
            <span class="value">{{ bearing }}°</span>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">缩放</label>
          <div class="slider-control">
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="0.5"
              v-model.number="zoom"
              @input="updateFromSliders"
              class="slider"
            >
            <span class="value">{{ zoom }}</span>
          </div>
        </div>
      </div>

      <!-- 预设视角 -->
      <div class="preset-views">
        <h4>预设视角</h4>
        <div class="preset-buttons">
          <button 
            v-for="preset in currentPresets" 
            :key="preset.name"
            @click="applyPreset(preset)"
            class="preset-btn"
            :title="preset.description"
          >
            <span class="preset-icon">{{ preset.icon }}</span>
            <span class="preset-text">{{ preset.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 折叠状态显示 -->
    <div class="collapsed-info" v-if="isCollapsed" @click="toggleCollapse">
      <span class="current-icon">{{ isGlobalView ? '🌍' : '🗺️' }}</span>
      <span class="current-text">{{ currentViewText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'

const { map, scene } = inject('$scene_map')

// 状态管理
const isCollapsed = ref(true)
// const isGlobalView = ref(false) // 移除：这将根据 zoom 自动计算
const sphereRef = ref(null)
const flatSphereRef = ref(null)
const isDragging = ref(false)
const isPointDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 标记位，防止"地图"和"组件"更新时产生无限循环
const isUpdatingFromComponent = ref(false)

// 视角参数 (按照您的要求修改了 zoom 的初始值)
const pitch = ref(0)
const bearing = ref(0)
const zoom = ref(1) // ★ 您的要求：初始 zoom 为 1

// 控制点位置（球面坐标）
const controlPoint = ref({ x: 0, y: 0 })
const flatControlPoint = ref({ x: 0, y: 0 })

// 预设视角 (保持不变)
const presetViews = {
  global: [
    { name: '北极俯视', icon: '🧊', pitch: 0, bearing: 180, zoom: 2, description: '从北极点俯视', available: true },
    { name: '正面视角', icon: '🌐', pitch: 0, bearing: 0, zoom: 2, description: '地球正面视图', available: true },
    { name: '南极俯视', icon: '❄️', pitch: 90, bearing: 0, zoom: 2, description: '从南极点俯视', available: true },
  ],
  flat: [
    { name: '垂直俯视', icon: '⬇️', pitch: 0, bearing: 0, zoom: null, description: '垂直俯视当前区域', available: true },
    { name: '北方向', icon: '🧭', pitch: 45, bearing: 0, zoom: null, description: '45度面向北方', available: true },
    { name: '东方向', icon: '🧭', pitch: 45, bearing: 90, zoom: null, description: '45度面向东方', available: true },
    { name: '南方向', icon: '🧭', pitch: 45, bearing: 180, zoom: null, description: '45度面向南方', available: true },
    { name: '西方向', icon: '🧭', pitch: 45, bearing: 270, zoom: null, description: '45度面向西方', available: true },
    { name: '高空鸟瞰', icon: '🦅', pitch: 60, bearing: 0, zoom: null, description: '60度高空视角', available: true }
  ]
}

// === ★ 核心修改 1: isGlobalView 变为计算属性 ===
// 模式现在由 zoom 自动决定，不再是手动切换的状态。
// 当 zoom 小于 4.5 时，我们认为是“全球模式”。
const isGlobalView = computed(() => zoom.value < 4.5)

// 计算属性 (保持不变)
const controlPointStyle = computed(() => {
  const radius = 80
  const x = controlPoint.value.x * radius
  const y = controlPoint.value.y * radius
  return {
    transform: `translate(${x}px, ${y}px)`
  }
})

const flatControlPointStyle = computed(() => {
  const radius = 70
  const x = flatControlPoint.value.x * radius
  const y = flatControlPoint.value.y * radius
  return {
    transform: `translate(${x}px, ${y}px)`
  }
})

const currentPresets = computed(() => {
  return isGlobalView.value ? presetViews.global : presetViews.flat
})

const currentViewText = computed(() => {
  if (isGlobalView.value) {
    if (pitch.value === 0) return '全球俯视'
    if (pitch.value < 30) return '全球低角度'
    if (pitch.value < 60) return '全球中角度'
    return '全球高角度'
  } else {
    if (pitch.value === 0) return '垂直俯视'
    if (pitch.value < 30) return '低角度'
    if (pitch.value < 60) return '中角度'
    return '高角度'
  }
})

// === ★ 核心修改 2: 新增一个函数，用于从地图同步状态到组件 ===
const updateFromMap = () => {
  // 如果是组件自己触发的更新，则忽略此次地图事件，防止循环
  if (isUpdatingFromComponent.value) return
  
  const target = map || scene
  if (!target) return
  
  try {
    const newPitch = target.getPitch()
    const newBearing = target.getBearing()
    const newZoom = target.getZoom()
    
    // 更新组件内部的 ref
    pitch.value = Math.round(newPitch)
    bearing.value = Math.round(newBearing)
    zoom.value = parseFloat(newZoom.toFixed(2))
    
    // (isGlobalView 会根据 zoom 自动更新)
    
    // 同时更新球形控制器的UI
    if (isGlobalView.value) {
      controlPoint.value = anglesToSphere(bearing.value, pitch.value)
    } else {
      flatControlPoint.value = anglesToFlatSphere(bearing.value, pitch.value)
    }
  } catch (error) {
    // 地图可能还未加载完，忽略错误
  }
}

// 坐标/角度转换函数 (保持不变)
const sphereToAngles = (x, y) => {
  const distance = Math.min(Math.sqrt(x * x + y * y), 1)
  const angle = Math.atan2(y, x)
  const newBearing = (angle * 180 / Math.PI + 360) % 360
  const newPitch = distance * 90
  return { bearing: newBearing, pitch: newPitch }
}

const flatSphereToAngles = (x, y) => {
  const distance = Math.min(Math.sqrt(x * x + y * y), 1)
  const angle = Math.atan2(y, x)
  const newBearing = (angle * 180 / Math.PI + 360) % 360
  const newPitch = distance * 90
  return { bearing: newBearing, pitch: newPitch }
}

const anglesToSphere = (bearing, pitch) => {
  const angle = bearing * Math.PI / 180
  const distance = pitch / 90
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance
  }
}

const anglesToFlatSphere = (bearing, pitch) => {
  const angle = bearing * Math.PI / 180
  const distance = pitch / 90
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance
  }
}

// === ★ 核心修改 3: 更新地图视角，增加"锁"并使用 easeTo ===
const updateMapView = () => {
  if (!map && !scene) return
  
  isUpdatingFromComponent.value = true // ★ 设置"锁"
  
  try {
    const target = map || scene
    
    // 使用 easeTo 让视角变化更平滑
    if (target.easeTo) {
      target.easeTo({
        pitch: pitch.value,
        bearing: bearing.value,
        zoom: zoom.value,
        duration: 300 // 300ms 动画
      })
    } else if (target.setPitch) {
      // 降级处理
      target.setPitch(pitch.value)
      target.setBearing(bearing.value)
      target.setZoom(zoom.value)
    }
  } catch (error) {
    console.error('更新地图视角失败:', error)
  }
  
  // ★ 动画结束后(300ms)再释放"锁"，允许地图事件更新组件
  setTimeout(() => {
    isUpdatingFromComponent.value = false
  }, 350) // 留 50ms 缓冲
}

// 从球面控制更新 (保持不变)
const updateFromSphere = (x, y) => {
  const angles = sphereToAngles(x, y)
  bearing.value = Math.round(angles.bearing)
  pitch.value = Math.round(angles.pitch)
  updateMapView()
}

// 从球面控制更新 (保持不变)
const updateFromFlatSphere = (x, y) => {
  const angles = flatSphereToAngles(x, y)
  bearing.value = Math.round(angles.bearing)
  pitch.value = Math.round(angles.pitch)
  updateMapView()
}

// 从滑块更新 (保持不变)
const updateFromSliders = () => {
  if (isGlobalView.value) {
    const spherePos = anglesToSphere(bearing.value, pitch.value)
    controlPoint.value = spherePos
  } else {
    const flatSpherePos = anglesToFlatSphere(bearing.value, pitch.value)
    flatControlPoint.value = flatSpherePos
  }
  updateMapView()
}

// 拖动逻辑 (保持不变)
const startSphereDrag = (e) => {
  if (e.target.classList.contains('control-point')) return
  const sphere = sphereRef.value
  const rect = sphere.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const x = (e.clientX - rect.left - centerX) / centerX
  const y = (e.clientY - rect.top - centerY) / centerY
  updateFromSphere(x, y)
  const onSphereDrag = (moveEvent) => {
    const moveX = (moveEvent.clientX - rect.left - centerX) / centerX
    const moveY = (moveEvent.clientY - rect.top - centerY) / centerY
    updateFromSphere(moveX, moveY)
  }
  const stopSphereDrag = () => {
    document.removeEventListener('mousemove', onSphereDrag)
    document.removeEventListener('mouseup', stopSphereDrag)
  }
  document.addEventListener('mousemove', onSphereDrag)
  document.addEventListener('mouseup', stopSphereDrag)
}

const startFlatSphereDrag = (e) => {
  if (e.target.classList.contains('flat-control-point')) return
  const sphere = flatSphereRef.value
  const rect = sphere.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const x = (e.clientX - rect.left - centerX) / centerX
  const y = (e.clientY - rect.top - centerY) / centerY
  updateFromFlatSphere(x, y)
  const onSphereDrag = (moveEvent) => {
    const moveX = (moveEvent.clientX - rect.left - centerX) / centerX
    const moveY = (moveEvent.clientY - rect.top - centerY) / centerY
    updateFromFlatSphere(moveX, moveY)
  }
  const stopSphereDrag = () => {
    document.removeEventListener('mousemove', onSphereDrag)
    document.removeEventListener('mouseup', stopSphereDrag)
  }
  document.addEventListener('mousemove', onSphereDrag)
  document.addEventListener('mouseup', stopSphereDrag)
}

const startPointDrag = (e) => {
  e.stopPropagation()
  isPointDragging.value = true
  const sphere = sphereRef.value
  const rect = sphere.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const onPointDrag = (moveEvent) => {
    const x = (moveEvent.clientX - rect.left - centerX) / centerX
    const y = (moveEvent.clientY - rect.top - centerY) / centerY
    updateFromSphere(x, y)
  }
  const stopPointDrag = () => {
    isPointDragging.value = false
    document.removeEventListener('mousemove', onPointDrag)
    document.removeEventListener('mouseup', stopPointDrag)
  }
  document.addEventListener('mousemove', onPointDrag)
  document.addEventListener('mouseup', stopPointDrag)
}

const startFlatPointDrag = (e) => {
  e.stopPropagation()
  isPointDragging.value = true
  const sphere = flatSphereRef.value
  const rect = sphere.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const onPointDrag = (moveEvent) => {
    const x = (moveEvent.clientX - rect.left - centerX) / centerX
    const y = (moveEvent.clientY - rect.top - centerY) / centerY
    updateFromFlatSphere(x, y)
  }
  const stopPointDrag = () => {
    isPointDragging.value = false
    document.removeEventListener('mousemove', onPointDrag)
    document.removeEventListener('mouseup', stopPointDrag)
  }
  document.addEventListener('mousemove', onPointDrag)
  document.addEventListener('mouseup', stopPointDrag)
}

// 应用预设视角 (保持不变)
const applyPreset = (preset) => {
  if (!preset.available) return
  pitch.value = preset.pitch
  bearing.value = preset.bearing
  if (preset.zoom !== null && preset.zoom !== undefined) {
    zoom.value = preset.zoom
  }
  updateFromSliders()
}

// === ★ 核心修改 4: 切换/重置按钮的逻辑 ===
// 按钮不再切换内部状态，而是发送一个"命令"到地图
const toggleViewMode = () => {
  if (isGlobalView.value) {
    // 当前是全球，点击切换到平面 (设置一个默认的城市缩放和俯仰)
    pitch.value = 45
    bearing.value = 0
    zoom.value = 14 // 比如缩放到 14 级
  } else {
    // 当前是平面，点击切换到全球
    pitch.value = 0
    bearing.value = 0
    zoom.value = 1
  }
  updateFromSliders() // 触发更新
}

// 重置视角
const resetCamera = () => {
  if (isGlobalView.value) {
    // 重置全球视角
    pitch.value = 0
    bearing.value = 0
    zoom.value = 1
  } else {
    // 重置平面视角 (保持当前 zoom，只重置俯仰和旋转)
    pitch.value = 45
    bearing.value = 0
  }
  updateFromSliders() // 触发更新
}

// 窗口拖动 (保持不变)
const startDrag = (e) => {
  if (e.target.closest('.action-btn')) return
  isDragging.value = true
  const control = e.target.closest('.camera-control')
  const rect = control.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  const onDrag = (moveEvent) => {
    if (!isDragging.value) return
    control.style.left = (moveEvent.clientX - dragOffset.value.x) + 'px'
    control.style.top = (moveEvent.clientY - dragOffset.value.y) + 'px'
    control.style.right = 'auto'
  }
  const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 展开/收起 (保持不变)
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// === ★ 核心修改 5: onMounted 和 onUnmounted ===
onMounted(() => {
  // 1. 组件加载时，将初始值(pitch:45, bearing:0, zoom:1)设置到地图上
  updateFromSliders() 
  
  const target = map || scene
  if (target) {
    // 2. 开始监听地图的 'move' 事件
    target.on('move', updateFromMap)
    // 3. (可选) 有时地图加载完成后状态不一致，保险起见再同步一次
    target.on('load', updateFromMap)
  }
})

onUnmounted(() => {
  // 1. 组件销毁时，移除监听器，防止内存泄漏
  const target = map || scene
  if (target) {
    target.off('move', updateFromMap)
    target.off('load', updateFromMap)
  }
  
  // 2. 清理其他拖动事件 (您原来就有，保持)
  document.removeEventListener('mousemove', () => {})
  document.removeEventListener('mouseup', () => {})
})
</script>

<style scoped>
.camera-control {
  position: absolute;
  top: 110px;
  left: 20px;
  z-index: 1000;
  /* 深色玻璃拟态背景 */
  background: rgba(20, 30, 48, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 280px;
  max-width: 320px;
  cursor: grab;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.camera-control:active {
  cursor: grabbing;
}

.camera-control.collapsed {
  min-width: 200px;
  max-width: 240px;
}

/* 头部样式 */
.control-header {
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  /* 统一的深蓝渐变 */
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  cursor: move;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* 内容区域 */
.camera-content {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

/* 模式指示器 */
.mode-indicator {
  margin-bottom: 18px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.mode-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid transparent;
}

/* 统一色调，稍微区分文字颜色以示区别 */
.mode-tag.global {
  background: rgba(35, 70, 224, 0.2);
  color: #4dabf7;
  border-color: rgba(35, 70, 224, 0.4);
}

.mode-tag.flat {
  background: rgba(123, 31, 162, 0.2);
  color: #e0aaff;
  border-color: rgba(123, 31, 162, 0.4);
}

.location-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* --- 统一的球体与控制点样式 (全球 & 平面) --- */

/* 容器尺寸 */
.sphere-container {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 20px;
}

.flat-sphere-container {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 20px;
}

/* 球体背景 - 两者统一为深邃星空风格 */
.sphere,
.flat-sphere {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  /* 统一使用全球模式的渐变背景 */
  background: radial-gradient(circle at 30% 30%, #34495e, #0b0c10);
  position: relative;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6);
}

.sphere-inner,
.flat-sphere-inner {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 控制点 - 两者统一为科技蓝霓虹风格 */
.control-point,
.flat-control-point {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #00d4ff;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
  transition: all 0.2s ease;
  top: 50%;
  left: 50%;
  margin: -7px 0 0 -7px;
  z-index: 2;
}

.control-point:hover,
.flat-control-point:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(0, 212, 255, 1);
}

.control-point:active,
.flat-control-point:active {
  cursor: grabbing;
}

/* 参考线 - 两者统一为半透明白色 */
.reference-lines, .flat-reference-lines {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
}

.horizontal-line, .vertical-line,
.flat-horizontal-line, .flat-vertical-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
}

.horizontal-line, .flat-horizontal-line { top: 50%; left: 0; width: 100%; height: 1px; transform: translateY(-50%); }
.vertical-line, .flat-vertical-line { left: 50%; top: 0; width: 1px; height: 100%; transform: translateX(-50%); }

.center-dot, .flat-center-dot {
  position: absolute;
  top: 50%; left: 50%;
  width: 4px; height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

/* 方向指示 */
.direction-indicators {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
}

.direction {
  position: absolute;
  font-size: 10px;
  font-weight: bold;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.direction.north { top: 5px; left: 50%; transform: translateX(-50%); }
.direction.east { top: 50%; right: 5px; transform: translateY(-50%); }
.direction.south { bottom: 5px; left: 50%; transform: translateX(-50%); }
.direction.west { top: 50%; left: 5px; transform: translateY(-50%); }

/* 平面模式提示 - 颜色改为蓝色系以匹配整体 */
.flat-tips {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 10px;
}

.flat-tips p {
  margin: 0;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid #00d4ff; /* 改为蓝色 */
}

/* 数值控制 */
.numeric-controls {
  margin-bottom: 20px;
}

.control-group {
  margin-bottom: 15px;
}

.control-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.slider-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.15);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #00d4ff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.slider::-webkit-slider-thumb:hover {
  background: #fff;
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.8);
}

.value {
  min-width: 40px;
  text-align: right;
  font-weight: 600;
  color: #00d4ff;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

/* 预设视角 */
.preset-views {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
}

.preset-views h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.preset-btn:hover {
  border-color: #00d4ff;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preset-icon {
  font-size: 18px;
  margin-bottom: 6px;
}

.preset-text {
  font-weight: 500;
}

/* 折叠状态 */
.collapsed-info {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.collapsed-info:hover {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0 0 12px 12px;
}

.current-icon {
  font-size: 18px;
}

.current-text {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

/* 滚动条样式 */
.camera-content::-webkit-scrollbar {
  width: 5px;
}
.camera-content::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
}
.camera-content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}
.camera-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .camera-control {
    top: 10px; left: 10px;
    min-width: 260px; max-width: 280px;
  }
  .sphere-container { width: 160px; height: 160px; }
  .flat-sphere-container { width: 140px; height: 140px; }
  .preset-buttons { grid-template-columns: repeat(2, 1fr); }
  .mode-indicator { flex-direction: column; gap: 8px; }
}

/* 动画效果 */
.camera-control {
  animation: slideInFromLeft 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>