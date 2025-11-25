import { getCityBuildings } from '@/api/smart_city.js'

import { CityBuildingLayer } from '@antv/l7'

// 导出hooks函数
export default async () => {
  const building_data = await getCityBuildings()

  const building_layer = new CityBuildingLayer({
    name: '武汉市',
  })

  // 配置图层
  building_layer
    .source(building_data)
    .size('Elevation', (h) => h)
    .animate(true)
    .active({
  
      color: '#0ff',
      mix: 0.5,
    })
    .style({
      opacity: 0.7,
      baseColor: 'rgb(16, 16, 16)',
      windowColor: 'rgb(30, 60, 89)',
      brightColor: 'rgb(255, 176, 38)',
      sweep: {
        enable: true,
        sweepRadius: 2,
        sweepColor: '#6400deff',
        sweepSpeed: 0.3,
        sweepCenter: [114.3, 30.5],
      },
    })
    .filter('Elevation', (h) => h > 40)

  return building_layer
}
