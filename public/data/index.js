// 导入mockjs(加载模拟数据)
const mockjs = require('mockjs')

// 加载数据
// 1. 武汉城市数据
const wuhan_buildings = require('./Wuhan_Buildings.json')
// 2. 武汉道路数据
const wuhan_roads = require('./Wuhan_roads.json')
// 3. 武汉交通事件数据
const wuhan_events = require('./Wuhan_events.json')

// 4. 武汉桥梁数据 (假设有桥梁数据文件)
const wuhan_bridges = require('./Wuhan_bridges.json') // 替换为实际的桥梁数据文件路径

const underground_pipes = require('./underground_pipes.json') // 假设有地下水管道数据文件

const power_grid = require('./power_grid.json') // 假设有电网数据文件

const hospital = require('./hospital.json') // 假设有医院数据文件

const university= require('./university.json') // 假设有学校数据文件

const people_heatmap = require('./people_heatmap.json') // 假设有热力图数据文件



// 导出函数
module.exports = () => {
  return mockjs.mock({
    wuhan_buildings,
    wuhan_roads,
    wuhan_events,
    wuhan_bridges, // 添加桥梁数据
    underground_pipes, // 添加地下水管道数据
    power_grid, // 添加电网数据
    hospital, // 添加医院数据
    university, // 添加学校数据
    people_heatmap,
    
  })
}
