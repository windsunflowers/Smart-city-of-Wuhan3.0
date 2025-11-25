import { getPowerGrid } from '@/api/smart_city.js';
import { LineLayer } from '@antv/l7';

export default async () => {
  const power_grid_data = await getPowerGrid();
  console.log('电网数据:', power_grid_data); // 打印数据，检查格式

  const power_grid_layer = new LineLayer({
    name: '武汉市电网',
    zIndex: 995,
    depth: true,
  });

  // 配置图层
  power_grid_layer
    .source(power_grid_data)
    .size(1)
    .shape('line')
    .color('#4dd2f7ff')
    .animate({
      trailLength: 2,
      duration: 2,
      interval: 1,
    });

  return power_grid_layer;
};