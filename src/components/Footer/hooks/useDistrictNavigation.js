import { ref, inject } from 'vue'
import { wuhanDistrictsData } from './wuhanDistrictsData.js'
import { PolygonLayer } from '@antv/l7'

export default () => {
  const { map, scene } = inject('$scene_map')
  const districts = ref([])
  const loading = ref(false)
  const selectedDistrict = ref(null) // 当前选中的区域
  let highlightLayer = null // 高亮图层

  // 获取武汉市行政区数据
  const fetchDistricts = async () => {
    loading.value = true
    try {
      // 尝试获取武汉市的完整边界数据
      const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/420100_full.json')
      const data = await response.json()
      
      console.log('武汉市区县数据:', data) // 调试日志
      
      if (data.features && data.features.length > 0) {
        // 直接使用武汉市的区县数据
        districts.value = data.features.map(feature => ({
          name: feature.properties.name,
          adcode: feature.properties.adcode,
          geometry: feature.geometry
        }))
        console.log('成功获取到', districts.value.length, '个区县')
      } else {
        // 如果直接获取武汉市数据失败，尝试从湖北省数据中过滤
        console.log('尝试从湖北省数据中过滤武汉区县')
        const hubeiResponse = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/420000_full.json')
        const hubeiData = await hubeiResponse.json()
        
        const wuhanDistricts = hubeiData.features.filter(feature => {
          const adcode = feature.properties.adcode
          // 武汉市各区县的行政区代码
          const wuhanDistrictCodes = [
            '420102', // 江岸区
            '420103', // 江汉区
            '420104', // 硚口区
            '420105', // 汉阳区
            '420106', // 武昌区
            '420107', // 青山区
            '420111', // 洪山区
            '420112', // 东西湖区
            '420113', // 汉南区
            '420114', // 蔡甸区
            '420115', // 江夏区
            '420116', // 黄陂区
            '420117'  // 新洲区
          ]
          return wuhanDistrictCodes.includes(adcode.toString())
        })
        
        if (wuhanDistricts.length > 0) {
          districts.value = wuhanDistricts.map(feature => ({
            name: feature.properties.name,
            adcode: feature.properties.adcode,
            geometry: feature.geometry
          }))
          console.log('从湖北省数据中过滤出', districts.value.length, '个武汉区县')
        } else {
          // 如果API数据为空，使用备用数据
          console.log('API数据为空，使用备用数据')
          districts.value = wuhanDistrictsData.features.map(feature => ({
            name: feature.properties.name,
            adcode: feature.properties.adcode,
            geometry: feature.geometry
          }))
        }
      }
    } catch (error) {
      console.error('获取行政区数据失败，使用备用数据:', error)
      // 使用备用数据
      districts.value = wuhanDistrictsData.features.map(feature => ({
        name: feature.properties.name,
        adcode: feature.properties.adcode,
        geometry: feature.geometry
      }))
    } finally {
      loading.value = false
    }
  }

  // 创建高亮图层
  const createHighlightLayer = () => {
    // 移除之前的高亮图层
    if (highlightLayer) {
      scene.removeLayer(highlightLayer)
    }
    
    // 创建新的高亮图层
    highlightLayer = new PolygonLayer({
      name: 'district-highlight'
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
    
    // 确保高亮图层存在
    if (!highlightLayer) {
      createHighlightLayer()
    }
    
    // 更新高亮图层数据
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
    
    // 更新选中的区域
    selectedDistrict.value = district
    
    // 高亮该区域
    highlightDistrict(district)
    
    // 计算区域的边界框
    let coordinates = district.geometry.coordinates
    
    // 处理不同的几何类型
    if (district.geometry.type === 'Polygon') {
      coordinates = coordinates[0] // 取外环坐标
    } else if (district.geometry.type === 'MultiPolygon') {
      coordinates = coordinates[0][0] // 取第一个多边形的外环坐标
    }
    
    let minLng = Infinity, maxLng = -Infinity
    let minLat = Infinity, maxLat = -Infinity
    
    coordinates.forEach(coord => {
      minLng = Math.min(minLng, coord[0])
      maxLng = Math.max(maxLng, coord[0])
      minLat = Math.min(minLat, coord[1])
      maxLat = Math.max(maxLat, coord[1])
    })
    
    // 计算中心点和边界
    const center = [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
    const bounds = [[minLng, minLat], [maxLng, maxLat]]
    
    // 飞行到指定区域
    map.fitBounds(bounds, {
      padding: 50,
      duration: 2000,
      easing: (n) => n
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