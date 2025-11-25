import { ref, inject, watch } from 'vue'
import { LineLayer, PointLayer, PolygonLayer } from '@antv/l7'

// Gaode API Key
const AMAP_KEY = 'f4e4d20c830fd99f6e5e80904742395a'

// --- 坐标系转换工具 (GCJ-02 -> WGS-84) ---
const pi = 3.14159265358979324;
const a = 6378245.0;
const ee = 0.00669342162296594323;

const outOfChina = (lng, lat) => {
  if (lng < 72.004 || lng > 137.8347) return true;
  if (lat < 0.8293 || lat > 55.8271) return true;
  return false;
};

const transformLat = (lng, lat) => {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 
            0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * pi) + 40.0 * Math.sin(lat / 3.0 * pi)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * pi) + 320 * Math.sin(lat * pi / 30.0)) * 2.0 / 3.0;
  return ret;
};

const transformLng = (lng, lat) => {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 
            0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * pi) + 40.0 * Math.sin(lng / 3.0 * pi)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * pi) + 300.0 * Math.sin(lng / 30.0 * pi)) * 2.0 / 3.0;
  return ret;
};

const gcj02ToWgs84 = (lng, lat) => {
  if (outOfChina(lng, lat)) return [lng, lat];
  let dlat = transformLat(lng - 105.0, lat - 35.0);
  let dlng = transformLng(lng - 105.0, lat - 35.0);
  const radlat = lat / 180.0 * pi;
  let magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi);
  dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * pi);
  const mglat = lat + dlat;
  const mglng = lng + dlng;
  return [lng * 2 - mglng, lat * 2 - mglat];
};

const convertCoordinates = (coords) => {
  return coords.map(coord => gcj02ToWgs84(coord[0], coord[1]));
};

// --- 主逻辑 ---

export default () => {
  const { scene, map } = inject('$scene_map')
  
  // 图层引用
  let routeLayer = null
  let startPointLayer = null
  let endPointLayer = null
  let analysisLayer = null
  let previewAnalysisLayer = null
  let centerPointLayer = null
  let centerLocation = null

  // 1. 地理编码
  const geocode = async (address) => {
    const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${AMAP_KEY}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const loc = data.geocodes[0].location.split(',')
      const gcjCoords = [parseFloat(loc[0]), parseFloat(loc[1])]
      const wgsCoords = gcj02ToWgs84(gcjCoords[0], gcjCoords[1])
      
      return {
        coordinates: wgsCoords,
        gcjCoordinates: gcjCoords,
        address: data.geocodes[0].formatted_address
      }
    }
    throw new Error('地理编码失败')
  }

  // 2. Polyline 解码 (字符串 -> WGS84坐标数组)
  const decodePolyline = (str) => {
    if (!str || typeof str !== 'string') return []
    const gcjCoords = str.split(';').map(pair => {
      const [lng, lat] = pair.split(',')
      return [parseFloat(lng), parseFloat(lat)]
    })
    return convertCoordinates(gcjCoords)
  }

  // 3. 核心修复：从 Steps 中提取完整路径
  // 驾车、步行、骑行 API 的路径通常散落在 steps 数组中
  const extractPathFromSteps = (steps) => {
    let fullPath = []
    if (Array.isArray(steps)) {
      steps.forEach(step => {
        if (step.polyline) {
          const coords = decodePolyline(step.polyline)
          fullPath = fullPath.concat(coords)
        }
      })
    }
    return fullPath
  }

  // 4. 样式配置
  const getRouteStyle = (mode) => {
    const styles = {
      driving: { color: '#FF3D00', width: 6, animate: { enable: true, interval: 0.6, duration: 4, trailLength: 0.6 } },
      walking: { color: '#4CAF50', width: 5, animate: { enable: true, interval: 0.5, duration: 3, trailLength: 0.5 } },
      riding:  { color: '#2196F3', width: 5, animate: { enable: true, interval: 0.5, duration: 3.5, trailLength: 0.5 } },
      transit: { color: '#9C27B0', width: 6, animate: { enable: true, interval: 0.7, duration: 4.5, trailLength: 0.6 } }
    };
    return styles[mode] || styles.driving;
  };

  // --- 功能：智慧出行 ---
  const travel = (from, to, mode) => {
    const loading = ref(false)
    const error = ref(null)
    const routeInfo = ref(null)

    // 清除图层辅助函数
    const clearLayers = () => {
      if (routeLayer) { scene?.removeLayer(routeLayer); routeLayer = null; }
      if (startPointLayer) { scene?.removeLayer(startPointLayer); startPointLayer = null; }
      if (endPointLayer) { scene?.removeLayer(endPointLayer); endPointLayer = null; }
    }

    const searchRoute = async () => {
      loading.value = true
      error.value = null
      routeInfo.value = null
      
      clearLayers() // 先清除

      try {
        const [fromLocation, toLocation] = await Promise.all([
          geocode(from.value),
          geocode(to.value)
        ])
        
        const fromCoord = fromLocation.gcjCoordinates
        const toCoord = toLocation.gcjCoordinates
        
        // 构建 API URL
        const apiMap = {
          driving: `https://restapi.amap.com/v3/direction/driving?origin=${fromCoord}&destination=${toCoord}&key=${AMAP_KEY}&extensions=base`,
          walking: `https://restapi.amap.com/v3/direction/walking?origin=${fromCoord}&destination=${toCoord}&key=${AMAP_KEY}`,
          riding:  `https://restapi.amap.com/v4/direction/bicycling?origin=${fromCoord}&destination=${toCoord}&key=${AMAP_KEY}`,
          transit: `https://restapi.amap.com/v3/direction/transit/integrated?origin=${fromCoord}&destination=${toCoord}&city=武汉&key=${AMAP_KEY}`
        }

        const url = apiMap[mode.value]
        if (!url) throw new Error('未知的出行方式')

        const res = await fetch(url)
        const data = await res.json()
        
        // 数据容器
        let pathCoords = []
        let summary = ''
        let distance = ''
        let duration = ''

        // --- 统一数据解析逻辑 ---
        
        // 1. 驾车 & 步行 (V3 API)
        if ((mode.value === 'driving' || mode.value === 'walking') && data.route?.paths?.[0]) {
          const path = data.route.paths[0]
          
          // 优先尝试直接读取 polyline (极少数情况)，否则遍历 steps
          if (path.polyline) {
            pathCoords = decodePolyline(path.polyline)
          } else {
            pathCoords = extractPathFromSteps(path.steps)
          }
          
          summary = mode.value === 'driving' ? (path.strategy || '推荐方案') : '步行方案'
          distance = (path.distance / 1000).toFixed(1) + '公里'
          duration = Math.round(path.duration / 60) + '分钟'

        // 2. 骑行 (V4 API - 结构不同)
        } else if (mode.value === 'riding' && data.data?.paths?.[0]) {
          const path = data.data.paths[0] // 注意这里是 data.data.paths
          
          if (path.polyline) {
            pathCoords = decodePolyline(path.polyline)
          } else {
            pathCoords = extractPathFromSteps(path.steps)
          }

          summary = '骑行方案'
          distance = (path.distance / 1000).toFixed(1) + '公里'
          duration = Math.round(path.duration / 60) + '分钟'

        // 3. 公交 (V3 API - 复杂结构)
        } else if (mode.value === 'transit' && data.route?.transits?.[0]) {
          const transit = data.route.transits[0]
          const segments = transit.segments || []
          
          segments.forEach(seg => {
            // 步行段
            if (seg.walking?.steps) {
              pathCoords = pathCoords.concat(extractPathFromSteps(seg.walking.steps))
            }
            // 公交段
            if (seg.bus?.buslines) {
              seg.bus.buslines.forEach(line => {
                if (line.polyline) {
                  pathCoords = pathCoords.concat(decodePolyline(line.polyline))
                }
              })
            }
            // 地铁/铁路段 (如果有)
            if (seg.railway?.polyline) {
               pathCoords = pathCoords.concat(decodePolyline(seg.railway.polyline))
            }
          })

          // 生成摘要
          const lines = segments
            .map(s => s.bus?.buslines?.[0]?.name?.replace(/\(.*?\)/g, '') || s.railway?.name)
            .filter(Boolean)
          summary = lines.join(' → ') || '公交方案'
          
          distance = (transit.distance / 1000).toFixed(1) + '公里'
          const dur = parseInt(transit.duration, 10)
          const min = Math.round(dur / 60)
          duration = min > 60 ? `${Math.floor(min/60)}小时${min%60}分钟` : `${min}分钟`

        } else {
          console.warn('API返回数据异常:', data)
          throw new Error('未查询到有效路线，请检查起终点距离是否过近或无法到达')
        }

        // --- 绘制逻辑 ---
        routeInfo.value = { summary, distance, duration }

        if (pathCoords.length > 1) {
          const style = getRouteStyle(mode.value)
          
          // 路线图层
          routeLayer = new LineLayer({ name: 'travel-route', zIndex: 5 })
            .source({
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: { mode: mode.value },
                geometry: { type: 'LineString', coordinates: pathCoords }
              }]
            })
            .size(style.width)
            .color(style.color)
            .animate(style.animate)
            .style({ opacity: 0.9, lineType: 'solid', lineCap: 'round', lineJoin: 'round' })
          
          scene.addLayer(routeLayer)

          // 起终点图层
          startPointLayer = new PointLayer({ name: 'start-point', zIndex: 6 })
            .source([{ coordinates: fromLocation.coordinates }], { parser: { type: 'json', coordinates: 'coordinates' } })
            .shape('circle').size(10).color('#4CAF50').style({ stroke: '#fff', strokeWidth: 2 })
          
          endPointLayer = new PointLayer({ name: 'end-point', zIndex: 6 })
            .source([{ coordinates: toLocation.coordinates }], { parser: { type: 'json', coordinates: 'coordinates' } })
            .shape('circle').size(10).color('#F44336').style({ stroke: '#fff', strokeWidth: 2 })

          scene.addLayer(startPointLayer)
          scene.addLayer(endPointLayer)

          // 自动缩放视角
          const lons = pathCoords.map(p => p[0])
          const lats = pathCoords.map(p => p[1])
          const center = [(Math.min(...lons) + Math.max(...lons)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2]
          
          // 简单的缩放级别估算
          const span = Math.max(Math.max(...lons) - Math.min(...lons), Math.max(...lats) - Math.min(...lats))
          const zoom = Math.max(9, Math.min(16, 13 - Math.log2(span * 10))) 

          map?.flyTo({ center, zoom, speed: 1.2 })
        } else {
          throw new Error('解析到的路线坐标点不足')
        }

      } catch (e) {
        console.error('路线查询出错:', e)
        error.value = e.message || '查询失败'
      } finally {
        loading.value = false
      }
    }

    const clearRoute = () => {
      clearLayers()
      routeInfo.value = null
      error.value = null
    }

    return { loading, error, routeInfo, searchRoute, clearRoute }
  }

  // --- 功能：智能分析 (保持原有逻辑) ---
  const createCircle = (center, radius) => {
    const points = []
    const sides = 60
    const earthRadius = 6378137
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides
      const lat = center[1] + (radius / earthRadius) * (180 / Math.PI) * Math.sin(angle)
      const lng = center[0] + (radius / earthRadius) * (180 / Math.PI) * Math.cos(angle) / Math.cos(center[1] * Math.PI / 180)
      points.push([lng, lat])
    }
    points.push(points[0])
    return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [points] } }
  }

  const analysis = (center, radius, loading, error, result) => {
    watch(center, async (val, old) => {
      if (val && val !== old) {
        try {
          centerLocation = await geocode(val)
          updatePreview()
        } catch(e) { clearPreview() }
      } else if (!val) clearPreview()
    })

    watch(radius, () => { if (centerLocation) updatePreview() })

    const updatePreview = () => {
      if (!scene || !centerLocation) return
      clearPreview()
      
      centerPointLayer = new PointLayer({ zIndex: 6 })
        .source([{ coordinates: centerLocation.coordinates }], { parser: { type: 'json', coordinates: 'coordinates' } })
        .shape('circle').size(8).color('#1990FF').style({ stroke: '#fff', strokeWidth: 2 })
      scene.addLayer(centerPointLayer)

      previewAnalysisLayer = new PolygonLayer({ zIndex: 3 })
        .source(createCircle(centerLocation.coordinates, radius.value))
        .shape('fill').color('#1990FF').style({ opacity: 0.15, stroke: '#1990FF', strokeWidth: 1 })
      scene.addLayer(previewAnalysisLayer)

      map?.flyTo({ center: centerLocation.coordinates, zoom: 13 })
    }

    const clearPreview = () => {
      if (previewAnalysisLayer) { scene?.removeLayer(previewAnalysisLayer); previewAnalysisLayer = null }
      if (centerPointLayer) { scene?.removeLayer(centerPointLayer); centerPointLayer = null }
    }

    const runAnalysis = async () => {
      loading.value = true; error.value = null; result.value = null
      if (analysisLayer) { scene.removeLayer(analysisLayer); analysisLayer = null }

      try {
        if (!centerLocation) centerLocation = await geocode(center.value)
        
        // POI 查询
        const codes = [
          { type: '060000', key: 'business' }, 
          { type: '140000', key: 'education' },
          { type: '090000', key: 'medical' },
          { type: '150000', key: 'transport' }
        ]
        const reqs = codes.map(c => 
          fetch(`https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${centerLocation.gcjCoordinates}&types=${c.type}&radius=${radius.value}`)
            .then(r => r.json())
            .then(d => ({ key: c.key, count: d.count || 0 }))
        )
        const counts = await Promise.all(reqs)
        const resObj = { summary: `范围: ${center.value} ${radius.value}米` }
        counts.forEach(c => resObj[c.key] = c.count)
        result.value = resObj

        // 绘制正式圆
        clearPreview()
        analysisLayer = new PolygonLayer({ zIndex: 3 })
          .source(createCircle(centerLocation.coordinates, radius.value))
          .shape('fill').color('#1990FF').style({ opacity: 0.2, stroke: '#1990FF', strokeWidth: 2 })
        scene.addLayer(analysisLayer)

        centerPointLayer = new PointLayer({ zIndex: 6 })
          .source([{ coordinates: centerLocation.coordinates }], { parser: { type: 'json', coordinates: 'coordinates' } })
          .shape('circle').size(30).color('#FF9800').style({ opacity: 0.2 })
        scene.addLayer(centerPointLayer)

        map?.flyTo({ center: centerLocation.coordinates, zoom: 13 })

      } catch (e) {
        error.value = e.message || '分析失败'
      } finally { loading.value = false }
    }

    const clearAnalysis = () => {
      if (analysisLayer) { scene?.removeLayer(analysisLayer); analysisLayer = null }
      clearPreview()
      centerLocation = null
      result.value = null
    }

    return { runAnalysis, clearAnalysis }
  }

  return { travel, analysis }
}