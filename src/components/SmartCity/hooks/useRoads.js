import { getRoads } from '@/api/smart_city.js'

import { LineLayer } from '@antv/l7'

export default async () => {
  const roads_data = await getRoads()

  const roads_layer = new LineLayer({
    name: '武汉市道路',
    zIndex: 0,
    depth: true,
  })
  // 配置图层
  roads_layer
    .source(roads_data)
    .size(1)
    .shape('line')
    .color('#ffffffff')
    .animate({
      trailLength: 2, // 流线长度
      duration: 2, // 持续时间
      interval: 1, // 间隔周期
    })
    .filter('coordinates', (evt) => evt.length > 20)

  return roads_layer
}
