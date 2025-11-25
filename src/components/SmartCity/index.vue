<template></template>
<script setup>
import { inject, onMounted, ref, provide } from 'vue'
// 保留所有图层的导入
import useBuildings from './hooks/useBuildings'
import useRoads from './hooks/useRoads'
import useBridges from './hooks/useBridges'
import useUndergroundPipes from './hooks/useUndergroundPipes'
import usePowerGrid from './hooks/usePowerGrid'
import useHospital from './hooks/useHospital'
import useUniversity from './hooks/useUniversity'
// 导入正确的人口热力图钩子
import usePeopleHeatmap from './hooks/usePeopleheat' 

const { scene } = inject('$scene_map')
// 创建一个引用存储热力图图层，以便其他组件可以访问
const peopleHeatmapLayerRef = ref(null)
// 提供热力图图层引用给其他组件
provide('peopleHeatmapLayer', peopleHeatmapLayerRef)

onMounted(async () => {
  if (!scene) {
    console.error('场景实例未找到，无法加载图层')
    return
  }

  try {
    // 恢复所有图层的添加
    const building_layer = await useBuildings()
    if (building_layer) scene.addLayer(building_layer)
    
    const roads_layer = await useRoads()
    if (roads_layer) scene.addLayer(roads_layer)
    
    const bridges_layer = await useBridges()
    if (bridges_layer) scene.addLayer(bridges_layer)
    
    const undergroundPipeLayer = await useUndergroundPipes()
    if (undergroundPipeLayer) {
      scene.addLayer(undergroundPipeLayer)
      undergroundPipeLayer.hide()
    }
    
    const powerGridLayer = await usePowerGrid()
    if (powerGridLayer) {
      scene.addLayer(powerGridLayer)
      powerGridLayer.hide()
    }
    
    // 加载医院图层
    const hospitalLayer = await useHospital(scene)
    if (hospitalLayer) {
      // 检查场景中是否已存在同名图层
      const existingLayers = scene.getLayers().filter(layer => 
        layer.name === '武汉医院点位'
      )
      
      // 如果不存在同名图层，则添加到场景
      if (existingLayers.length === 0) {
        scene.addLayer(hospitalLayer)
        // 默认隐藏医院图层，通过图层控制面板显示
        hospitalLayer.hide()
      }
    }
    
    const universityLayer = await useUniversity(scene)
    if (universityLayer) scene.addLayer(universityLayer)
    
    // 修正人口热力图的调用
    const peopleHeatmapLayer = await usePeopleHeatmap(scene)
    if (peopleHeatmapLayer) {
      // 存储引用以便其他组件可以访问
      peopleHeatmapLayerRef.value = peopleHeatmapLayer
      
      // 确保图层已添加到场景
      if (!scene.getLayers().includes(peopleHeatmapLayer)) {
        try {
          scene.addLayer(peopleHeatmapLayer)
        } catch (err) {
          console.warn('添加热力图到场景失败:', err.message)
        }
      }
      
      // 默认隐藏热力图，通过图层切换控制显示
      try {
        peopleHeatmapLayer.hide()
      } catch (err) {
        console.warn('隐藏热力图失败:', err.message)
      }
    } else {
      console.error('热力图图层创建失败')
    }
  } catch (error) {
    console.error('加载图层时出错:', error)
  }
})
</script>
<style scoped></style>