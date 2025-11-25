import { getBridges } from '@/api/smart_city.js';
import { LineLayer } from '@antv/l7';

export default async () => {
  const bridges_data = await getBridges();
  console.log('桥梁数据:', bridges_data); // 打印数据，检查格式

  const bridges_layer = new LineLayer({
    name: '武汉市桥梁',
    zIndex: 999,
    depth: true,
  });

  // 配置图层
  bridges_layer
    .source(bridges_data)
    .size(2)
    .shape('line')
    .color('#f3b763ff')
    .animate({
      trailLength: 2,
      duration: 2,
      interval: 1,
    })
    //  .filter('coordinates', (evt) => evt.length > 10);

  return bridges_layer;
};