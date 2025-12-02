<template>
  <div class="mapbox-theme-control" :class="{ collapsed: isCollapsed }">
    <!-- 标题栏 - 可拖动和展开/收起 -->
    <div class="control-header" @mousedown="startDrag">
      <div class="header-content">
        <span class="title">地图主题</span>
        <div class="header-actions">
          <button class="action-btn" @click.stop="toggleCollapse" :title="isCollapsed ? '展开' : '收起'">
            <span class="icon">{{ isCollapsed ? '↗' : '↙' }}</span>
          </button>
          <button class="action-btn" @click.stop="togglePin" :title="isPinned ? '取消置顶' : '置顶'">
            <span class="icon">{{ isPinned ? '📌' : '📍' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 主题选择区域 -->
    <div class="theme-content" v-show="!isCollapsed">
      <div class="theme-search" v-if="themeOptions.length > 6">
        <input 
          v-model="searchText"
          type="text" 
          placeholder="搜索主题..." 
          class="search-input"
        >
      </div>
      
      <div class="theme-buttons">
        <button 
          v-for="theme in filteredThemes" 
          :key="theme.value"
          @click="switchTheme(theme.value)"
          :class="{ active: currentTheme === theme.value }"
          :title="theme.description"
          class="theme-btn"
        >
          <span class="theme-icon">{{ getThemeIcon(theme.value) }}</span>
          <span class="theme-text">{{ theme.text }}</span>
          <span class="theme-check" v-if="currentTheme === theme.value">✓</span>
        </button>
      </div>
      
      <div class="theme-info" v-if="currentThemeInfo">
        <p class="info-text">{{ currentThemeInfo.description }}</p>
      </div>
    </div>

    <!-- 折叠状态显示当前主题 -->
    <div class="collapsed-info" v-if="isCollapsed" @click="toggleCollapse">
      <span class="current-theme-icon">{{ getThemeIcon(currentTheme) }}</span>
      <span class="current-theme-text">{{ currentThemeText }}</span>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref, computed } from 'vue'
import { Logo, Zoom, Fullscreen, MouseLocation, RasterLayer } from '@antv/l7'

const { scene } = inject('$scene_map')
const sceneReady = ref(false)
const currentTheme = ref('streets')
const isCollapsed = ref(true)
const isPinned = ref(false)
const searchText = ref('')
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 天地图密钥 - 请替换为您的实际密钥
// const tiandituToken = 

// 地图主题配置
const themeOptions = [
  {
    value: 'streets',
    text: '街道图',
    style: 'mapbox://styles/mapbox/streets-v12',
    description: '详细的街道地图，包含完整的道路网络和地名信息'
  },
  {
    value: 'outdoors',
    text: '户外图',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description: '适合户外活动的地图，突出显示地形和自然特征'
  },
  {
    value: 'light',
    text: '浅色主题',
    style: 'mapbox://styles/mapbox/light-v11',
    description: '简洁的浅色主题，减少视觉干扰'
  },
  {
    value: 'dark',
    text: '深色主题',
    style: 'mapbox://styles/mapbox/dark-v11',
    description: '夜间模式的深色主题，保护眼睛'
  },
  {
    value: 'satellite',
    text: '卫星图',
    style: 'mapbox://styles/mapbox/satellite-v9',
    description: '高分辨率卫星影像，真实的地球表面'
  },
  {
    value: 'satellite-streets',
    text: '卫星混合',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    description: '卫星影像叠加街道信息，兼具美观和实用'
  },
  {
    value: 'osm-terrain',
    text: '地形图',
    style: {
      version: 8,
      name: 'OSM Terrain',
      sources: {
        'osm': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    },
    description: 'OpenStreetMap地图，全球覆盖，开源免费（2D平面）'
  },
  {
    value: 'terrain-rgb',
    text: 'Mapbox 3D地形',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    has3DTerrain: true,
    description: '真正的3D地形效果，需要Mapbox Token（如已配置）'
  }
]

// 计算属性
const filteredThemes = computed(() => {
  if (!searchText.value) return themeOptions
  return themeOptions.filter(theme => 
    theme.text.toLowerCase().includes(searchText.value.toLowerCase()) ||
    theme.description.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const currentThemeInfo = computed(() => {
  return themeOptions.find(theme => theme.value === currentTheme.value)
})

const currentThemeText = computed(() => {
  const theme = themeOptions.find(t => t.value === currentTheme.value)
  return theme ? theme.text : '未知主题'
})

// 主题图标映射
const getThemeIcon = (themeValue) => {
  const icons = {
    'streets': '🗺️',
    'outdoors': '⛰️',
    'light': '☀️',
    'dark': '🌙',
    'satellite': '🛰️',
    'satellite-streets': '🌍',
    'osm-terrain': '🏔️',
    'terrain-rgb': '🏞️'
  }
  return icons[themeValue] || '📍'
}

// 天地图地形图层
let terrainLayer = null

// 设置真正的3D地形效果
const setup3DTerrain = () => {
  if (!scene) {
    console.error('❌ Scene对象不存在')
    return false
  }
  
  console.log('🔍 开始检测3D地形支持情况...')
  console.log('Scene对象可用的方法:', Object.keys(scene).filter(key => typeof scene[key] === 'function'))
  
  try {
    // 方法1: 尝试Mapbox风格的setTerrain
    if (typeof scene.setTerrain === 'function') {
      console.log('✅ 检测到 scene.setTerrain 方法')
      
      // 尝试添加源
      if (typeof scene.addSource === 'function') {
        console.log('✅ 检测到 scene.addSource 方法')
        
        scene.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        })
        
        console.log('✅ DEM数据源已添加')
      }
      
      // 启用地形
      scene.setTerrain({ 
        source: 'mapbox-dem', 
        exaggeration: 1.5 
      })
      
      console.log('✅ setTerrain 调用成功')
      
      // 调整视角
      scene.setPitch(0)
      scene.setZoom(1)
      
      console.log('✅ 3D地形已完全启用')
      return true
    } 
    
    // 方法2: 检查L7是否有自己的地形API
    else if (typeof scene.enableTerrain === 'function') {
      console.log('✅ 检测到 scene.enableTerrain 方法（L7自有API）')
      scene.enableTerrain()
      return true
    }
    
    // 方法3: 检查是否有地形配置
    else if (typeof scene.setTerrainExaggeration === 'function') {
      console.log('✅ 检测到 scene.setTerrainExaggeration 方法')
      scene.setTerrainExaggeration(1.5)
      return true
    }
    
    else {
      console.warn('❌ 未找到任何地形相关方法')
      console.log('📋 Scene可用方法列表:')
      console.log(Object.keys(scene).filter(key => typeof scene[key] === 'function').sort())
      console.log('')
      console.log('💡 结论：L7的Earth地球模式不支持DEM地形渲染')
      console.log('💡 说明：')
      console.log('   • 当前地图只是在球体上贴纹理（2D贴图）')
      console.log('   • 无法实现山峰凸起的真3D效果')
      console.log('   • 这是L7 Earth模式的设计限制')
      console.log('')
      console.log('🎯 如需真正3D地形，建议：')
      console.log('   1. 使用 Cesium.js（最专业的3D地球引擎）')
      console.log('   2. 使用 Mapbox GL JS 2D模式 + Terrain')
      console.log('   3. 使用 Deck.gl + TerrainLayer')
      return false
    }
  } catch (error) {
    console.error('❌ 设置3D地形时发生错误:', error)
    console.log('错误详情:', error.message)
    console.log('错误堆栈:', error.stack)
    return false
  }
}

// 移除3D地形
const remove3DTerrain = () => {
  if (!scene) return
  
  try {
    if (typeof scene.setTerrain === 'function') {
      scene.setTerrain(null)
    }
    
    if (typeof scene.removeSource === 'function' && scene.getSource('mapbox-dem')) {
      scene.removeSource('mapbox-dem')
    }
    
    scene.setPitch(0)
    console.log('3D地形已移除')
  } catch (error) {
    console.warn('移除3D地形失败:', error)
  }
}

// 设置地形视角
const setupTerrainEffect = () => {
  if (!scene) return
  
  try {
    // 调整视角以更好地查看地形图
    scene.setPitch(0)   // 适当倾斜角度
    scene.setZoom(1)     // 全球视角
    
    console.log('地形图视角已调整')
  } catch (error) {
    console.warn('调整视角失败:', error)
  }
}

// 重置视角
const removeTerrainEffect = () => {
  if (!scene) return
  
  try {
    // 重置视角
    scene.setPitch(0)
    
    console.log('视角已重置')
  } catch (error) {
    console.warn('重置视角失败:', error)
  }
}

// 拖动功能
const startDrag = (e) => {
  if (e.target.closest('.action-btn')) return
  
  isDragging.value = true
  const control = e.target.closest('.mapbox-theme-control')
  const rect = control.getBoundingClientRect()
  
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  control.style.cursor = 'grabbing'
}

const onDrag = (e) => {
  if (!isDragging.value) return
  
  const control = document.querySelector('.mapbox-theme-control')
  control.style.left = (e.clientX - dragOffset.value.x) + 'px'
  control.style.top = (e.clientY - dragOffset.value.y) + 'px'
  control.style.right = 'auto'
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  const control = document.querySelector('.mapbox-theme-control')
  if (control) {
    control.style.cursor = 'grab'
  }
}

// 展开/收起功能
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const togglePin = () => {
  isPinned.value = !isPinned.value
}

const switchTheme = (themeValue) => {
  if (!scene) return
  
  const theme = themeOptions.find(t => t.value === themeValue)
  if (!theme) return
  
  console.log('========================================')
  console.log('🔄 开始切换地图样式:', theme.text)
  console.log('========================================')
  currentTheme.value = themeValue
  
  try {
    // 先移除可能存在的3D地形
    remove3DTerrain()
    
    if (themeValue === 'terrain-rgb') {
      console.log('📍 目标：启用3D地形')
      console.log('步骤1: 切换底图样式...')
      
      // 先切换样式
      scene.setMapStyle(theme.style)
      console.log('✅ 底图样式已切换')
      
      console.log('步骤2: 等待样式加载完成...')
      
      // 等待样式加载完成后尝试启用3D地形
      setTimeout(() => {
        console.log('步骤3: 尝试启用3D地形...')
        const success = setup3DTerrain()
        
        if (!success) {
          console.log('')
          console.log('⚠️⚠️⚠️ 重要结论 ⚠️⚠️⚠️')
          console.log('3D地形不可用 - 这是正常的！')
          console.log('')
          console.log('📖 原因说明：')
          console.log('你正在使用 L7 的 Earth（地球）模式')
          console.log('这个模式的设计目的是：')
          console.log('  ✓ 展示地球的球形外观')
          console.log('  ✓ 在球面上贴2D地图纹理')
          console.log('  ✗ 不支持DEM高程渲染（山峰凸起）')
          console.log('')
          console.log('🎯 如何实现真正的3D地形？')
          console.log('方案1: Cesium.js - 最专业的3D地球引擎')
          console.log('  • 完整支持全球DEM数据')
          console.log('  • 真实的山峰凸起效果')
          console.log('  • 开源免费')
          console.log('')
          console.log('方案2: Mapbox GL JS + Terrain')
          console.log('  • 2D地图 + 3D地形')
          console.log('  • 需要Mapbox Token')
          console.log('')
          console.log('========================================')
        }
      }, 1000)
      
    } else if (typeof theme.style === 'object') {
      console.log('📍 加载自定义样式（OSM等）')
      scene.setMapStyle(theme.style)
      
      setTimeout(() => {
        if (themeValue === 'osm-terrain') {
          setupTerrainEffect()
        }
        console.log('✅ 切换完成')
      }, 500)
    } else {
      console.log('📍 加载Mapbox样式')
      scene.setMapStyle(theme.style)
      
      setTimeout(() => {
        removeTerrainEffect()
        console.log('✅ 切换完成')
      }, 200)
    }
    
  } catch (error) {
    console.error('❌ 切换地图样式失败:', error)
    console.error('错误详情:', error.message)
  }
}

// 添加此计算属性
const hasValidToken = computed(() => {
  return !!tiandituToken && tiandituToken.trim() !== ''
})

// 初始化地图控件
const initMapControls = () => {
  if (!scene) return

  const logo = new Logo({
    img: 'https://www.hzau.edu.cn/images/LOGO.png',
    href: 'https://www.hzau.edu.cn/',
    style: 'width: 120px; height: auto;'
  })
  scene.addControl(logo)

  const zoom = new Zoom({
    zoomInTitle: '放大',
    zoomOutTitle: '缩小',
    position: 'bottomright',
  })
  scene.addControl(zoom)

  const fullscreen = new Fullscreen({
    btnText: '全屏',
    exitBtnText: '退出全屏',
  })
  scene.addControl(fullscreen)

  const mouseLocation = new MouseLocation({
    position: 'bottomleft',
    style: 'opacity:0.5',
  })
  scene.addControl(mouseLocation)


  
}

onMounted(() => {
  if (!scene) {
    console.error('Scene not found')
    return
  }
  
  scene.on('loaded', () => {
    console.log('地图加载完成')
    initMapControls()
    sceneReady.value = true
    switchTheme('streets')
  })
  
  if (scene.loaded) {
    initMapControls()
    sceneReady.value = true
    switchTheme('streets')
  }
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  removeTiandituTerrainLayer()
  removeTerrainEffect()
})


</script>

<style scoped>
.mapbox-theme-control {
  position: absolute;
  top: 110px;
  right: 20px;
  z-index: 1000;
  /* 统一风格：深色背景 */
  background: rgba(20, 30, 48, 0.9);
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 280px;
  max-width: 320px;
  cursor: grab;
  user-select: none;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.mapbox-theme-control:active {
  cursor: grabbing;
}

.mapbox-theme-control.collapsed {
  min-width: 200px;
  max-width: 240px;
}

/* 头部样式 */
.control-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  /* 统一风格：蓝色渐变 */
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  cursor: move;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 600;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* 内容区域 */
.theme-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.theme-search {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  /* 统一风格：深色输入框 */
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #00d4ff;
  background: rgba(0, 0, 0, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.theme-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-btn {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  /* 统一风格：透明按钮 */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.theme-btn:hover {
  border-color: #00d4ff;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.theme-btn.active {
  /* 统一风格：激活状态蓝色渐变 */
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-color: #00d4ff;
  box-shadow: 0 4px 12px rgba(35, 70, 224, 0.3);
}

.theme-icon {
  font-size: 16px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.theme-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.theme-check {
  font-weight: bold;
  margin-left: 8px;
  color: #00d4ff;
}

/* 主题信息 */
.theme-info {
  margin-top: 16px;
  padding: 12px;
  /* 统一风格：深色信息框 */
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid #00d4ff;
}

.info-text {
  margin: 0;
  font-size: 12px;
  color: #ccc;
  line-height: 1.4;
}

/* 折叠状态 */
.collapsed-info {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.collapsed-info:hover {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.current-theme-icon {
  font-size: 18px;
}

.current-theme-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

/* 滚动条样式 */
.theme-content::-webkit-scrollbar {
  width: 6px;
}

.theme-content::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
}

.theme-content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}

.theme-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mapbox-theme-control {
    top: 10px; right: 10px;
    min-width: 260px; max-width: 280px;
  }
  .mapbox-theme-control.collapsed {
    min-width: 180px; max-width: 200px;
  }
}
</style>