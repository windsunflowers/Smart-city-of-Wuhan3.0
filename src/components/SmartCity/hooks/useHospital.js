import { getHospitalBuildings } from '@/api/smart_city'
import { PointLayer } from '@antv/l7'

export default async (scene) => {
  try {
    const hospital_data = await getHospitalBuildings()
    
    // 增强数据验证
    if (!hospital_data || !hospital_data.features || !Array.isArray(hospital_data.features)) {
      console.error('无效的医院数据', hospital_data)
      return null
    }

    // 预处理数据 - 添加必要的属性
    const processedData = {
      ...hospital_data,
      features: hospital_data.features.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          // 添加缺失的字段或设置默认值
          level: feature.properties.name?.includes('社区') ? '一级' : '三级', // 简单分类
          type: feature.properties.amenity || 'hospital',
          beds: feature.properties.name?.includes('社区') ? 50 : 200 // 简单估算床位数
        }
      }))
    }

    // 创建点图层
    const layer = new PointLayer({
      name: '武汉医院点位',
      zIndex: 5
    })

    // 配置点样式 (主要修改了size部分)
    layer
      .source(processedData)
      .shape('circle') 
      .size('beds', beds => Math.min(25, Math.max(8, beds / 10))) // 放大2-3倍
      .color('level', level => level === '三级' ? '#DC143C' : '#1E90FF')
      .style({
        opacity: 0.8,
        stroke: '#fff',
        strokeWidth: 2,  // 加粗描边
        strokeOpacity: 0.9
      })
      .active({
        color: '#FF8C00',
        stroke: '#fff',
        strokeWidth: 3  // 激活状态描边更粗
      })
      .animate({
        enable: true,
        speed: 1.5,
        rings: 3
      })
      .label('name', {
        textAllowOverlap: false,
        style: {
          fill: '#000',
          fontSize: 12,
          stroke: '#fff',
          strokeWidth: 2,
          textOffset: [0, 25]  // 标签下移避免重叠
        }
      })

    // 在这里我们不直接添加图层到场景，而是返回图层对象
    // 由调用者决定如何处理图层
    if (!scene) {
      console.error('缺少场景实例')
    }

    return layer
  } catch (error) {
    console.error('加载医院图层失败:', error)
    return null
  }
}