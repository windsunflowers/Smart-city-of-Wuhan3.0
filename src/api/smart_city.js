// 导入request实例
import request from './request'

// 编写接口
export const getCityBuildings = () => {
  return request({
    url: '/data/Wuhan_Buildings.json',
    method: 'GET',
  })
}
export const getRoads = () => {
  return request({
    url: '/data/Wuhan_roads.json',
    method: 'GET',
  })
}
export const getEvents = () => {
  return request({
    url: '/data/Wuhan_events.json', // 替换为实际的交通事件数据接口地址
    method: 'GET',
  })
}
// 添加获取桥梁数据的接口
export const getBridges = () => {
  return request({
    url: '/data/Wuhan_bridges.json', // 替换为实际的桥梁数据接口地址
    method: 'GET',
  })
}

  // 添加获取地下水管道数据的接口
export const getUndergroundPipes = () => {
  return request({
    url: '/data/underground_pipes.json', // 替换为实际的地下水管道数据接口地址
    method: 'GET',
  })
}

// 添加获取电网数据的接口
export const getPowerGrid = () => {
  return request({
    url: '/data/power_grid.json', // 替换为实际的电网数据接口地址
    method: 'GET',
  })
}
  // 添加获取医院数据的接口
export const getHospitalBuildings = () => {
  return request({
    url: '/data/WUHAN_hospital.geojson', // 替换为实际的医院数据接口地址
    method: 'GET',
  })
}

// 添加获取大学数据的接口
export const getUniversityData = () => {
  return request({
    url: '/data/university.json', // 替换为实际的大学数据接口地址
    method: 'GET',
  })
}
export const getPeopleHeatmapData = () => {
    return request({
      url: '/data/people_heatmap.json', // 替换为实际的热力图数据接口地址
      method: 'GET',
    })
  }



