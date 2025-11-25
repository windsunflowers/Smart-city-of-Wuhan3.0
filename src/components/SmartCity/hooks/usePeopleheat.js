import { HeatmapLayer } from '@antv/l7'
import { getPeopleHeatmapData } from '@/api/smart_city'

export default async (scene) => {
  try {
    // 1. 获取GeoJSON格式数据
    const geoJsonData = await getPeopleHeatmapData()
    
    // 2. 验证数据格式
    if (!geoJsonData || 
        geoJsonData.type !== 'FeatureCollection' || 
        !Array.isArray(geoJsonData.features)) {
      console.error('无效的GeoJSON数据格式:', geoJsonData)
      return null
    }

    // 3. 数据预处理（确保每个feature有population和coordinates）
    const validFeatures = geoJsonData.features.filter(feature => {
      return feature.geometry?.type === 'Point' && 
             feature.geometry?.coordinates?.length === 2 &&
             feature.properties?.population !== undefined
    })

    if (validFeatures.length === 0) {
      console.error('数据中没有有效的点要素', geoJsonData)
      return null
    }

    // 4. 创建热力图层
    const layer = new HeatmapLayer({
      name: '武汉人口热力图',
      zIndex: 5
    })
    .source({
      type: 'FeatureCollection',
      features: validFeatures.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          mag: feature.properties.population // 热力图必须使用mag字段
        }
      }))
    })
    .shape('heatmap')
    .size('mag', [0, 1.0]) // 标准化权重范围
    .style({
      intensity: 4,       // 热力强度
      radius: 20,         // 影响半径(像素)
      opacity: 0.8,       // 整体透明度
      rampColors: {
        colors: [
          '#000080', // 低密度
          '#0000FF',
          '#00FFFF',
          '#FFFF00',
          '#FF0000', // 高密度
        ],
        positions: [0, 0.25, 0.5, 0.75, 1.0]
      }
    })

    // 5. 仅当场景有效时才添加到场景
    // 注意：我们总是返回创建的图层，即使没有添加到场景
    if (scene && typeof scene.addLayer === 'function') {
      try {
        scene.addLayer(layer)
        
        // 自动调整视图范围
        if (typeof scene.setFitView === 'function') {
          scene.setFitView({
            padding: [50, 50, 50, 50],
            duration: 1500
          })
        }
      } catch (err) {
        console.warn('热力图添加到场景失败，但图层已创建:', err.message)
      }
    } else {
      console.warn('场景实例无效或不完整，热力图将在需要时手动添加')
    }
    
    return layer

  } catch (error) {
    console.error('热力图加载失败:', {
      error: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    })
    return null
  }
}