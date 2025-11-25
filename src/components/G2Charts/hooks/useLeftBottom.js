import { ref, onMounted } from 'vue'

export const useLeftBottom = () => {
  // 使用ref创建响应式数据
  const data = ref([
    { type: '汉阳区', value: 27 },
    { type: '武昌区', value: 25 },
    { type: '硚口区', value: 18 },
    { type: '江夏区', value: 15 },
    { type: '洪山区', value: 10 },
    { type: '其他', value: 10 },
  ]);
  
  // 图表配置
  const config = {
    appendPadding: 10,
    xField: 'type',
    yField: 'value',
    seriesField: 'type',
    radius: 0.9,
    label: {
      offset: -15,
    },
    interactions: [{ type: 'element-active' }],
    height: 150,
    animation: true,
  };
  
  // 高德地图 API Key
  const AMAP_KEY = '0f97806556d11f61231563d11f346ae2';
  
  // 获取实时公交数据
  const fetchBusData = async () => {
    try {
      // 武汉市区域码
      const cityCode = '420100';
      
      // 使用高德地图API获取公交线路数据
      const response = await fetch(`https://restapi.amap.com/v3/bus/linename?keywords=&city=${cityCode}&offset=20&page=1&extensions=all&key=${AMAP_KEY}`);
      const result = await response.json();
      
      if (result.status === '1' && result.buslines) {
        // 获取各区域公交线路分布
        const districtStats = computeDistrictStats(result.buslines);
        data.value = districtStats;
      }
    } catch (error) {
      console.error('获取公交数据失败:', error);
      // 如果API调用失败，使用模拟数据
      simulateBusData();
    }
  };
  
  // 计算各区域公交线路分布
  const computeDistrictStats = (buslines) => {
    // 统计各区域的公交线路数量
    const districtCounts = {
      '汉阳区': 0,
      '武昌区': 0,
      '硚口区': 0,
      '江夏区': 0,
      '洪山区': 0,
      '其他': 0
    };
    
    // 这里解析公交线路信息，提取区域信息
    buslines.forEach(line => {
      // 从线路名称或站点信息中识别区域
      // 实际情况可能需要更复杂的逻辑来识别公交线路所属区域
      const busInfo = line.name + (line.front_name || '') + (line.terminal_name || '');
      
      if (busInfo.includes('汉阳')) {
        districtCounts['汉阳区']++;
      } else if (busInfo.includes('武昌')) {
        districtCounts['武昌区']++;
      } else if (busInfo.includes('硚口')) {
        districtCounts['硚口区']++;
      } else if (busInfo.includes('江夏')) {
        districtCounts['江夏区']++;
      } else if (busInfo.includes('洪山')) {
        districtCounts['洪山区']++;
      } else {
        districtCounts['其他']++;
      }
    });
    
    // 转换为图表需要的格式
    return Object.keys(districtCounts).map(district => ({
      type: district,
      value: districtCounts[district] || 0
    }));
  };
  
  // 模拟公交数据（当API调用失败时使用）
  const simulateBusData = () => {
    // 随机生成公交数据，但保持总体分布比例相似
    const baseValues = {
      '汉阳区': 20 + Math.floor(Math.random() * 15),
      '武昌区': 20 + Math.floor(Math.random() * 10),
      '硚口区': 15 + Math.floor(Math.random() * 8),
      '江夏区': 10 + Math.floor(Math.random() * 10),
      '洪山区': 8 + Math.floor(Math.random() * 5),
      '其他': 8 + Math.floor(Math.random() * 5),
    };
    
    data.value = Object.keys(baseValues).map(district => ({
      type: district,
      value: baseValues[district]
    }));
  };
  
  // 定时更新数据
  const startAutoUpdate = () => {
    // 立即获取一次数据
    fetchBusData();
    
    // 每5分钟更新一次
    return setInterval(() => {
      fetchBusData();
    }, 5 * 60 * 1000);
  };
  
  // 在组件挂载时启动自动更新
  let intervalId;
  onMounted(() => {
    intervalId = startAutoUpdate();
    
    // 模拟实时数据变化（仅用于演示效果）
    const demoInterval = setInterval(() => {
      simulateBusData();
    }, 10000); // 每10秒更新一次数据，仅用于演示
    
    // 返回清理函数
    return () => {
      clearInterval(intervalId);
      clearInterval(demoInterval);
    };
  });
  
  return {
    data,
    config,
    fetchBusData, // 暴露方法，方便手动刷新
    simulateBusData
  };
}
