// weather.js - 武汉天气数据处理和配置
import { ref, reactive, onMounted } from 'vue'

// 高德地图API密钥（从 Vite 环境变量注入）
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY

export function useWeather() {
  const weatherData = ref({
    city: '武汉',
    temperature: '--',
    weather: '--',
    humidity: '--',
    windSpeed: '--',
    windDirection: '--',
    pressure: '--',
    visibility: '--',
    updateTime: '--'
  })

  const loading = ref(false)
  const error = ref(null)

  // 天气网站链接配置
  const weatherSites = {
    // 中国天气网武汉
    cnWeather: 'https://www.weather.com.cn/weather1d/101200101.shtml',
    // 新浪天气武汉
    sinaWeather: 'https://weather.sina.com.cn/wuhan',
    // 腾讯天气武汉
    qqWeather: 'https://tianqi.qq.com/weather.htm?city=420100',
    // 百度天气武汉
    baiduWeather: 'https://tianqi.baidu.com/wuhan',
    // 墨迹天气武汉
    mojiWeather: 'https://tianqi.moji.com/weather/china/hubei/wuhan'
  }

  // 跳转到天气网站
  const goToWeatherSite = (site = 'cnWeather') => {
    const url = weatherSites[site]
    if (url) {
      window.open(url, '_blank')
    }
  }

  // 备用天气数据（仅在API失败时使用）
  const fallbackWeatherData = {
    city: '武汉',
    temperature: '28',
    weather: '晴',
    humidity: '65',
    windSpeed: '3',
    windDirection: '东南风',
    pressure: '1013',
    visibility: '10',
    updateTime: new Date().toLocaleString()
  }

  // 获取天气数据
  const fetchWeather = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 使用高德地图天气API获取武汉市天气
      const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=420100&extensions=base`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.lives && data.lives.length > 0) {
        const live = data.lives[0]
        
        weatherData.value = {
          city: live.city,
          temperature: live.temperature,
          weather: live.weather,
          humidity: live.humidity,
          windSpeed: live.windpower,
          windDirection: live.winddirection,
          pressure: '1013', // 高德API没有提供气压信息，使用默认值
          visibility: '10', // 高德API没有提供能见度信息，使用默认值
          updateTime: live.reporttime
        }
        
        console.log('天气数据更新成功:', weatherData.value)
      } else {
        throw new Error('天气API返回异常数据')
      }
    } catch (err) {
      error.value = '获取天气数据失败'
      console.error('Weather fetch error:', err)
      
      // 使用备用数据
      weatherData.value = {
        ...fallbackWeatherData,
        updateTime: new Date().toLocaleString()
      }
    } finally {
      loading.value = false
    }
  }

  // 定时更新天气数据
  const startAutoUpdate = () => {
    // 立即获取一次数据
    fetchWeather()
    
    // 每30分钟更新一次
    const intervalId = setInterval(() => {
      fetchWeather()
    }, 30 * 60 * 1000)
    
    // 返回清除定时器的函数
    return () => {
      clearInterval(intervalId)
    }
  }

  // 手动刷新
  const refreshWeather = () => {
    fetchWeather()
  }

  return {
    weatherData,
    loading,
    error,
    fetchWeather,
    startAutoUpdate,
    refreshWeather,
    goToWeatherSite,
    weatherSites
  }
}

// 天气图标映射
export const weatherIcons = {
  '晴': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '小雨': '🌦️',
  '中雨': '🌧️',
  '大雨': '⛈️',
  '雪': '❄️',
  '雾': '🌫️',
  '霾': '😷'
}

// 天气背景颜色映射
export const weatherColors = {
  '晴': 'linear-gradient(135deg, #74b9ff, #0984e3)',
  '多云': 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
  '阴': 'linear-gradient(135deg, #636e72, #2d3436)',
  '小雨': 'linear-gradient(135deg, #81ecec, #00b894)',
  '中雨': 'linear-gradient(135deg, #74b9ff, #0984e3)',
  '大雨': 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
  '雪': 'linear-gradient(135deg, #ddd6fe, #8b5cf6)',
  '雾': 'linear-gradient(135deg, #b2bec3, #636e72)',
  '霾': 'linear-gradient(135deg, #ffeaa7, #fdcb6e)'
}