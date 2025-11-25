// 导入request实例
import request from './request'

// 编写接口
export const getCityBuildings = () => {
  return request({
    url: 'wuhan_buildings',
    method: 'GET',
  })
}
export const getRoads = () => {
  return request({
    url: 'wuhan_roads',
    method: 'GET',
  })
}
export const getEvents = () => {
  return request({
    url: 'wuhan_events',
    method: 'GET',
  })
}
// 添加获取桥梁数据的接口
export const getBridges = () => {
  return request({
    url: 'wuhan_bridges', // 替换为实际的桥梁数据接口地址
    method: 'GET',
  })
}

  // 添加获取地下水管道数据的接口
export const getUndergroundPipes = () => {
  return request({
    url: 'underground_pipes', // 替换为实际的地下水管道数据接口地址
    method: 'GET',
  })
}

// 添加获取电网数据的接口
export const getPowerGrid = () => {
  return request({
    url: 'power_grid', // 替换为实际的电网数据接口地址
    method: 'GET',
  })
}
  // 添加获取医院数据的接口
export const getHospitalBuildings = () => {
  return request({
    url: 'hospital', // 替换为实际的医院数据接口地址
    method: 'GET',
  })
}

// 添加获取大学数据的接口
export const getUniversityData = () => {
  return request({
    url: 'university', // 替换为实际的大学数据接口地址
    method: 'GET',
  })
}
export const getPeopleHeatmapData = () => {
    return request({
      url: 'people_heatmap', // 替换为实际的热力图数据接口地址
      method: 'GET',
    })
  }

// export const getUniversityHeatmapData = () => {
//     return request({
//       url: 'university_heatmap', // 替换为实际的热力图数据接口地址
//       method: 'GET',
//     })
//   }


