# Smart City of Wuhan 3.0

基于 Vue 3 + Vite + Mapbox GL JS 开发的三维城市可视化系统。本项目主要用于展示武汉市地理空间数据，包含建筑白模、路网结构及城市运行数据的可视化分析。

## 预览

[系统主界面](./src/assets/images/system.png)


## 主要功能

1.  三维场景加载
    解析并渲染武汉市建筑、道路、水系等 GeoJSON 数据。
    基于 Mapbox 实现自定义地图样式与白模渲染。

2.  数据可视化
    集成 AntV G2 图表库，动态展示人口分布、电力负荷等模拟数据。
    支持热力图（Heatmap）图层叠加与切换。

3.  交互与漫游
    实现了第一/第三人称视角切换。
    内置“飞行定位”功能，可一键跳转至指定地标（如大学、医院）。

4.  WebGIS 工具
    包含空间测距、图层显隐控制、天气环境模拟等基础功能。

## 技术栈

框架: Vue 3 (Composition API)
构建: Vite
地图: Mapbox GL JS
图表: AntV G2
样式 CSS / SCSS

## 本地运行

bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 打包构建
pnpm build