// 导入相关库
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Scene } from '@antv/l7'
import { Mapbox } from '@antv/l7-maps'

// vue的插件: 导出一个对象
// 1. 在该对象必须包含一个install方法
// 2. 当执行app.use(插件对象)时, 会自动执行
export default {
  install(app) {
    // 创建scene和map对象
    // 1. 实例化mapbox中的map对象
    const token = import.meta.env.VITE_TOKEN
    mapboxgl.accessToken = token

    // 创建地图容器 <div id="map" style="width: 100%; height:100%">
    const container = document.createElement('div')
    container.id = 'map'
    container.setAttribute('style', 'width: 100%; height: 100%')
    document.body.appendChild(container)

    const map = new mapboxgl.Map({
      container: 'map',
      
      center: [114.3, 30.5],
      zoom: 1,
      projection: 'globe',
    })
    map.on('style.load', () => {
      map.setFog({})
    })

    const scene = new Scene({
      id: 'map',
      map: new Mapbox({
        mapInstance: map,
      }),
      logoVisible: false,
    })
    // 在app中通过provide提供scene和map对象
    app.provide('$scene_map', { scene, map })
  },
  
}
