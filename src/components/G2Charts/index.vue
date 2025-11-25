<template>
  <div>
    <div class="left-container">
      <div class="g2-chart">
        <div class="title">出行人口统计</div>
        <!-- 柱状图 -->
        <ColumnChart v-bind="lt_config" :data="lt_data" />
      </div>
      <div class="g2-chart">
        <div class="title">实时公交在线表</div>
        <!-- 玫瑰图 -->
        <RoseChart v-bind="lb_config" :data="lb_data" />
      </div>
      
      <!-- 新增天气组件 -->
      <div class="g2-chart weather-chart" 
           :style="{ background: weatherBackground }"
           @click="goToWeatherSite('cnWeather')"
           title="点击查看详细天气信息">
        <div class="title">
          武汉实时天气
          <span class="click-hint">点击查看详情</span>
        </div>
        <div class="weather-content">
          <div class="weather-loading" v-if="loading">
            <div class="spinner"></div>
            <span>加载中...</span>
          </div>
          <div class="weather-error" v-else-if="error">
            <span>{{ error }}</span>
            <button @click.stop="refreshWeather" class="refresh-btn">重试</button>
          </div>
          <div class="weather-info" v-else>
            <div class="weather-main">
              <div class="temperature">
                <span class="temp-value">{{ weatherData.temperature }}°C</span>
                <span class="weather-icon">{{ weatherIcon }}</span>
              </div>
              <div class="weather-desc">{{ weatherData.weather }}</div>
            </div>
            <div class="weather-details">
              <div class="detail-item">
                <span class="label">湿度</span>
                <span class="value">{{ weatherData.humidity }}%</span>
              </div>
              <div class="detail-item">
                <span class="label">风速</span>
                <span class="value">{{ weatherData.windSpeed }}级</span>
              </div>
              <div class="detail-item">
                <span class="label">风向</span>
                <span class="value">{{ weatherData.windDirection }}</span>
              </div>
              <div class="detail-item">
                <span class="label">气压</span>
                <span class="value">{{ weatherData.pressure }}hPa</span>
              </div>
            </div>
            <div class="weather-footer">
              <span class="update-time">更新时间: {{ weatherData.updateTime }}</span>
              <div class="weather-actions">
                <button @click.stop="refreshWeather" class="refresh-btn" title="刷新">🔄</button>
                <div class="dropdown">
                  <button @click.stop="toggleDropdown" class="dropdown-btn" title="选择天气网站">🌐</button>
                  <div class="dropdown-content" v-show="showDropdown">
                    <a @click.stop="goToWeatherSite('cnWeather')">中国天气网</a>
                    <a @click.stop="goToWeatherSite('qqWeather')">腾讯天气</a>
                    <a @click.stop="goToWeatherSite('baiduWeather')">百度天气</a>
                    <a @click.stop="goToWeatherSite('mojiWeather')">墨迹天气</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="right-container">
      <div class="g2-chart">
        <div class="title">武汉市人口统计</div>
        <!-- 饼状图 -->
        <PieChart v-bind="rt_config" />
      </div>
      <div class="g2-chart">
        <div class="title">武汉市三甲医院</div>
        <div class="list">
          <div>
            <h4>医院 <span>30家</span></h4>
            <img src="../../assets/icons/hospital.png" />
          </div>
          <div>
            <h4>门诊部 <span>300个</span></h4>
            <img src="../../assets/icons/building.png" />
          </div>
          <div>
            <h4>病床 <span>3000张</span></h4>
            <img src="../../assets/icons/bed.png" />
          </div>
        </div>
      </div>
      <div class="g2-chart">
        <div class="title">高校学生统计</div>
        <div class="list">
          <div>
            <h4>高校 <span>130所</span></h4>
            <img src="../../assets/icons/school.png" alt="" />
          </div>
          <div>
            <h4>在校大学生<span>100万</span></h4>
            <img src="../../assets/icons/student.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ColumnChart, RoseChart, PieChart } from '@opd/g2plot-vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useLeftTop } from './hooks/useLeftTop.js'
import { useLeftBottom } from './hooks/useLeftBottom.js'
import { useRightTop } from './hooks/useRightTop.js'
import { useWeather, weatherIcons, weatherColors } from './hooks/useweather.js'
import './hooks/usetools.js' // ✅ 相对路径引入

const { config: lt_config, data: lt_data } = useLeftTop()
const { config: lb_config, data: lb_data } = useLeftBottom()
const { config: rt_config } = useRightTop()

// 天气相关
const { weatherData, loading, error, startAutoUpdate, refreshWeather, goToWeatherSite } = useWeather()

// 下拉菜单控制
const showDropdown = ref(false)
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 点击其他地方关闭下拉菜单
const closeDropdown = () => {
  showDropdown.value = false
}

// 组件挂载时开始自动更新天气
onMounted(() => {
  document.addEventListener('click', closeDropdown)
  // 开始自动更新天气，并保存清理函数
  const cleanupWeatherUpdate = startAutoUpdate()
  
  // 在组件卸载时清理
  onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
    // 清理天气更新定时器
    if (cleanupWeatherUpdate) cleanupWeatherUpdate()
  })
})

// 计算天气图标
const weatherIcon = computed(() => {
  return weatherIcons[weatherData.value.weather] || '🌤️'
})

// 计算天气背景
const weatherBackground = computed(() => {
  return weatherColors[weatherData.value.weather] || 'linear-gradient(to bottom, #292e49, #536976)'
})

const showCharts = ref(false) // 初始状态设为false，表示隐藏

// 监听父组件传过来的事件
defineProps({
  toggleCharts: {
    type: Boolean,
    default: false
  }
})
</script>

<style>
.left-container {
  position: fixed;
  top: 100px;
  left: 20px;
  z-index: 1;
}

.right-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1;
}

.g2-chart {
  position: relative;
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(to bottom, #292e49, #536976);
  border-radius: 20px;
}

.g2-chart::before {
  display: block;
  content: '';
  position: absolute;
  top: -5px;
  left: -2px;
  width: 111px;
  height: 35px;
  background-image: url('../../assets/images/border.png');
  transform: rotate(180deg);
}

.g2-chart::after {
  display: block;
  content: '';
  position: absolute;
  bottom: -5px;
  right: -2px;
  width: 111px;
  height: 35px;
  background-image: url('../../assets/images/border.png');
}

.g2-chart .title {
  padding-left: 64px;
  margin-bottom: 20px;
  color: #fff;
  line-height: 46px;
  background: url('../../assets/images/chart-item.png') no-repeat;
}

.g2-chart .list {
  display: flex;
  justify-content: space-evenly;
  font-size: 12px;
  color: #fff;
  text-align: center;
}

.g2-chart .list img {
  width: 40px;
}

/* 天气组件样式 */
.weather-chart {
  min-height: 200px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: visible;
}

.weather-chart:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.weather-chart .title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.click-hint {
  font-size: 10px;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 10px;
}

.weather-content {
  color: #fff;
  font-size: 14px;
}

.weather-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff33;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.weather-error {
  text-align: center;
  padding: 20px;
  color: #ff7675;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.temperature {
  display: flex;
  align-items: center;
  gap: 10px;
}

.temp-value {
  font-size: 24px;
  font-weight: bold;
}

.weather-icon {
  font-size: 20px;
}

.weather-desc {
  font-size: 16px;
  opacity: 0.9;
}

.weather-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 5px 0;
}

.detail-item .label {
  opacity: 0.8;
}

.detail-item .value {
  font-weight: bold;
}

.weather-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  opacity: 0.7;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 10px;
}

.weather-actions {
  display: flex;
  gap: 5px;
  align-items: center;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: background 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.update-time {
  flex: 1;
}

/* 下拉菜单样式 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: background 0.3s ease;
}

.dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dropdown-content {
  position: absolute;
  right: 0;
  bottom: 100%;
  margin-bottom: 5px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 120px;
  backdrop-filter: blur(10px);
}

.dropdown-content a {
  color: #004781;
  padding: 8px 12px;
  text-decoration: none;
  display: block;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.dropdown-content a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-content a:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-content a:last-child {
  border-radius: 0 0 4px 4px;
}
</style>