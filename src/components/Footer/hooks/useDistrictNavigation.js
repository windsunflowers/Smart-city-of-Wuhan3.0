import { ref, inject } from 'vue'
import { PolygonLayer } from '@antv/l7'
// 1. 直接导入本地 JSON 文件
// 请确保 wuhan_districts.json 文件位于当前目录，或者修改为正确的相对路径
import rawDistrictData from './wuhan_districts.json'

export default () => {
  const { map, scene } = inject('$scene_map')
  const districts = ref([])
  const loading = ref(false)
  const selectedDistrict = ref(null) 
  let highlightLayer = null 

  // 获取武汉市行政区数据 (改为同步加载本地数据)
  const fetchDistricts = async () => {
    loading.value = true
    try {
      console.log('开始加载本地武汉区划数据...')
      
      // 2. 解析数据
      // 注意：根据你提供的 json 内容，最外层是一个数组 [...]，里面包含 FeatureCollection
      // 所以我们需要取 rawDistrictData[0]
      const featureCollection = Array.isArray(rawDistrictData) ? rawDistrictData[0] : rawDistrictData

      if (featureCollection && featureCollection.features) {
        districts.value = featureCollection.features.map(feature => ({
          name: feature.properties.name,
          adcode: feature.properties.adcode,
          geometry: feature.geometry,
          // 保留中心点数据，如果 JSON 里有的话，这对视角跳转很有用
          center: feature.properties.center || feature.properties.centroid
        }))
        console.log(`成功加载 ${districts.value.length} 个区域数据`)
      } else {
        console.error('JSON 数据格式不符合预期')
      }
    } catch (error) {
      console.error('加载行政区数据出错:', error)
    } finally {
      // 模拟一点点延迟，让用户感觉到交互（可选，也可以直接设为 false）
      setTimeout(() => {
        loading.value = false
      }, 300)
    }
  }

  // 创建高亮图层
  const createHighlightLayer = () => {
    if (highlightLayer) {
      scene.removeLayer(highlightLayer)
    }
    
    highlightLayer = new PolygonLayer({
      name: 'district-highlight',
      zIndex: 10 // 确保图层在上方
    })
      .source({
        type: 'FeatureCollection',
        features: []
      })
      .shape('fill')
      .color('#ff6b35')
      .style({
        opacity: 0.3,
        stroke: '#ff6b35',
        strokeWidth: 2,
        strokeOpacity: 0.9,
        fillOpacity: 0.2
      })
      .animate({
        enable: true,
        duration: 3000,
        loop: true
      })
    
    scene.addLayer(highlightLayer)
  }

  // 高亮指定区域
  const highlightDistrict = (district) => {
    if (!district.geometry) return
    
    if (!highlightLayer) {
      createHighlightLayer()
    }
    
    const highlightData = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          name: district.name
        },
        geometry: district.geometry
      }]
    }
    
    highlightLayer.setData(highlightData)
  }

  // 清除高亮
  const clearHighlight = () => {
    selectedDistrict.value = null
    if (highlightLayer) {
      highlightLayer.setData({
        type: 'FeatureCollection',
        features: []
      })
    }
  }

  // 跳转到指定区域
  const flyToDistrict = (district) => {
    if (!district.geometry) return
    
    selectedDistrict.value = district
    highlightDistrict(district)
    
    // 优先使用数据中自带的 center 或 centroid (如果有)
    // 这样比计算 fitBounds 更平滑准确
    if (district.center) {
        map.flyTo({
            center: district.center,
            zoom: 11, // 针对区级视角设定合适的 zoom
            pitch: 45,
            duration: 2000
        })
        return
    }

    // 如果没有 center 属性，则回退到计算边界框逻辑
    let coordinates = district.geometry.coordinates
    if (district.geometry.type === 'Polygon') {
      coordinates = coordinates[0]
    } else if (district.geometry.type === 'MultiPolygon') {
      // 对于 MultiPolygon，这里简单取第一个多边形计算，或者你可以遍历所有
      coordinates = coordinates[0][0] 
    }
    
    let minLng = Infinity, maxLng = -Infinity
    let minLat = Infinity, maxLat = -Infinity
    
    coordinates.forEach(coord => {
      minLng = Math.min(minLng, coord[0])
      maxLng = Math.max(maxLng, coord[0])
      minLat = Math.min(minLat, coord[1])
      maxLat = Math.max(maxLat, coord[1])
    })
    
    const bounds = [[minLng, minLat], [maxLng, maxLat]]
    
    map.fitBounds(bounds, {
      padding: 50,
      duration: 2000
    })
  }

  return {
    districts,
    loading,
    selectedDistrict,
    fetchDistricts,
    flyToDistrict,
    highlightDistrict,
    clearHighlight
  }
}