import { getUndergroundPipes } from '@/api/smart_city.js';
import { LineLayer } from '@antv/l7';

export default async () => {
  const underground_pipes_data = await getUndergroundPipes();
  console.log('地下水管道数据:', underground_pipes_data); // 打印数据，检查格式

  const underground_pipes_layer = new LineLayer({
    name: '武汉市地下水管道',
    zIndex: 996,
    depth: true,
  });

  // 配置图层
  underground_pipes_layer
    .source(underground_pipes_data)
    .size(1)
    .shape('line')
    .color('#fbff00ff')
    .animate({
      trailLength: 2,
      duration: 2,
      interval: 1,
    });

  return underground_pipes_layer;
};