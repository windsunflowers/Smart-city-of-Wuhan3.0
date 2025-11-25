// usetools.js
import { weatherIcons, weatherColors } from './useweather.js'

class CityTools {
  constructor() {
    this.container = null;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.startX = 0;
    this.startY = 0;
    this.init();
  }

  init() {
    // Create container element
    this.container = document.createElement('div');
    this.container.className = 'city-tools-container';
    
    // Set inner HTML
    this.container.innerHTML = `
      <div class="tools-header">
        <h3>城市工具箱</h3>
        <span class="toggle-btn">▼</span>
      </div>
      <div class="tools-content" style="display: none">
        <div class="tool-item" id="news-tool">
          <div class="tool-icon">📰</div>
          <div class="tool-info">
            <span class="tool-name">实时新闻</span>
            <span class="tool-data" id="news-count">加载中...</span>
          </div>
        </div>
        <div class="tool-item" id="traffic-tool">
          <div class="tool-icon">🚗</div>
          <div class="tool-info">
            <span class="tool-name">交通流量</span>
            <span class="tool-data" id="traffic-status">加载中...</span>
          </div>
        </div>
        <div class="tool-item" id="scenic-tool">
          <div class="tool-icon">🏞️</div>
          <div class="tool-info">
            <span class="tool-name">景点人数</span>
            <span class="tool-data" id="scenic-count">加载中...</span>
          </div>
        </div>
        <div class="tool-item" id="population-tool">
          <div class="tool-icon">👥</div>
          <div class="tool-info">
            <span class="tool-name">出行人口统计</span>
            <span class="tool-data">查看图表</span>
          </div>
        </div>
        <div class="tool-item" id="bus-tool">
          <div class="tool-icon">🚌</div>
          <div class="tool-info">
            <span class="tool-name">实时公交在线</span>
            <span class="tool-data">查看图表</span>
          </div>
        </div>
        <div class="tool-item" id="city-population-tool">
          <div class="tool-icon">🏙️</div>
          <div class="tool-info">
            <span class="tool-name">武汉市人口统计</span>
            <span class="tool-data">查看图表</span>
          </div>
        </div>
        <div class="tool-item" id="hospital-tool">
          <div class="tool-icon">🏥</div>
          <div class="tool-info">
            <span class="tool-name">武汉市三甲医院</span>
            <span class="tool-data">查看数据</span>
          </div>
        </div>
        <div class="tool-item" id="school-tool">
          <div class="tool-icon">🎓</div>
          <div class="tool-info">
            <span class="tool-name">高校学生统计</span>
            <span class="tool-data">查看数据</span>
          </div>
        </div>
        <div class="tool-item" id="weather-tool">
          <div class="tool-icon">⛅</div>
          <div class="tool-info">
            <span class="tool-name">武汉实时天气</span>
            <span class="tool-data" id="weather-data">查看详情</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    this.bindEvents();
    this.loadAllData();
  }

  bindEvents() {
    // 展开/收起功能
    const toggleBtn = this.container.querySelector('.toggle-btn');
    const content = this.container.querySelector('.tools-content');
    const header = this.container.querySelector('.tools-header');
    
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? '▼' : '▲';
    });

    // 点击工具项跳转到详情页
    this.container.querySelectorAll('.tool-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (this.isDragging) return;
        const toolType = e.currentTarget.id.split('-')[0];
        this.openDetailPage(toolType);
      });
    });

    // 拖拽相关事件 - 使用更安全的绑定方式
    const dragStart = this.startDrag.bind(this);
    const dragMove = this.onDrag.bind(this);
    const dragEnd = this.stopDrag.bind(this);
    
    // 只有标题栏可以拖动
    header.addEventListener('mousedown', dragStart);
    
    // 在document上监听移动和松开，这样即使鼠标移出元素也能捕获
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    
    // 额外处理鼠标离开窗口的情况
    document.addEventListener('mouseleave', dragEnd);
    
    // 存储移除事件的函数，以便需要时清理
    this._cleanupEvents = () => {
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('mouseleave', dragEnd);
    };
  }

  startDrag(e) {
    if (e.target.classList.contains('toggle-btn')) return;
    
    this.isDragging = false;
    this.startX = e.clientX;
    this.startY = e.clientY;
    const rect = this.container.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    
    this.container.style.cursor = 'grabbing';
    this.container.style.transition = 'none';
    this.container.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.4)';
  }

  onDrag(e) {
    // 如果没有开始拖拽（startX为0）或者移动距离太小，直接返回
    if (!this.startX || (Math.abs(e.clientX - this.startX) < 5 && Math.abs(e.clientY - this.startY) < 5)) {
      return;
    }
    
    // 确保鼠标按下状态才进行拖动
    if (!e.buttons) {
      this.stopDrag();
      return;
    }
    
    if (!this.isDragging) {
      this.isDragging = true;
    }
    
    e.preventDefault();
    
    const x = e.clientX - this.offsetX;
    const y = e.clientY - this.offsetY;
    
    this.container.style.left = `${x}px`;
    this.container.style.top = `${y}px`;
  }

  stopDrag() {
    // 重置所有拖拽相关状态
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.container.style.cursor = '';
    this.container.style.transition = 'all 0.3s ease';
    this.container.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
  }

  async loadAllData() {
    try {
      await Promise.all([
        this.loadNewsData(),
        this.loadTrafficData(),
        this.loadScenicData(),
        this.loadWeatherData() // 添加天气数据加载
      ]);
    } catch (error) {
      console.error('数据加载失败:', error);
    }
  }

  async loadNewsData() {
    try {
      // 示例API可能无法访问，直接使用模拟数据
      const mockNews = Math.floor(Math.random() * 50) + 10;
      const newsCount = document.getElementById('news-count');
      if (newsCount) {
        newsCount.textContent = `${mockNews} 条新消息`;
      }
    } catch (error) {
      console.warn('加载新闻数据失败:', error);
    }
  }

  async loadTrafficData() {
    try {
      // 示例API可能无法访问，直接使用模拟数据
      const statuses = ['畅通', '缓慢', '拥堵'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const trafficStatus = document.getElementById('traffic-status');
      if (trafficStatus) {
        trafficStatus.textContent = `当前${randomStatus}`;
      }
    } catch (error) {
      console.warn('加载交通数据失败:', error);
    }
  }

  async loadScenicData() {
    try {
      // 示例API可能无法访问，直接使用模拟数据
      const mockCount = Math.floor(Math.random() * 5000) + 1000;
      const scenicCount = document.getElementById('scenic-count');
      if (scenicCount) {
        scenicCount.textContent = `${mockCount} 人`;
      }
    } catch (error) {
      console.warn('加载景点数据失败:', error);
    }
  }

  async loadWeatherData() {
    try {
      // 通过高德地图天气API获取真实数据
      const AMAP_KEY = '0f97806556d11f61231563d11f346ae2'; // 使用高德地图API密钥
      const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=420100&extensions=base`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === '1' && data.lives && data.lives.length > 0) {
        const weather = data.lives[0];
        document.getElementById('weather-data').textContent = `${weather.weather} ${weather.temperature}°C`;
        
        // 同时更新全局状态，以便在模态框中使用
        this.weatherData = {
          city: weather.city,
          weather: weather.weather,
          temperature: weather.temperature,
          humidity: weather.humidity,
          winddirection: weather.winddirection,
          windpower: weather.windpower,
          reporttime: weather.reporttime
        };
      } else {
        throw new Error('Weather API error');
      }
    } catch (error) {
      console.error('天气数据加载失败:', error);
      // 使用备用数据
      const weatherConditions = ['晴', '多云', '阴', '小雨'];
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const temperature = Math.floor(Math.random() * 10) + 20;
      document.getElementById('weather-data').textContent = `${randomWeather} ${temperature}°C`;
      
      this.weatherData = {
        city: '武汉',
        weather: randomWeather,
        temperature: temperature.toString(),
        humidity: '65%',
        winddirection: '东南风',
        windpower: '3级',
        reporttime: new Date().toLocaleString()
      };
    }
  }

  openDetailPage(type) {
    new DetailModal(type);
  }
}

class DetailModal {
  constructor(type) {
    this.type = type;
    this.modal = null;
    this.render();
  }

  generateData() {
    switch (this.type) {
      case 'news':
        return Array.from({ length: 18 }, (_, i) => ({
          title: `武汉热点新闻 ${i + 1}`,
          time: new Date(Date.now() - i * 3600000).toLocaleString(),
          source: ['长江日报', '楚天都市报', '武汉发布'][i % 3]
        }));
      case 'traffic':
        return {
          districts: [
            '江岸区', '江汉区', '硚口区', '汉阳区', '武昌区',
            '青山区', '洪山区', '东西湖区', '汉南区', '蔡甸区',
            '江夏区', '黄陂区', '新洲区'
          ],
          levels: ['畅通', '缓行', '拥堵'],
          current: {
            '江岸区': '缓行',
            '江汉区': '拥堵',
            '硚口区': '缓行',
            '汉阳区': '畅通',
            '武昌区': '拥堵',
            '青山区': '畅通',
            '洪山区': '缓行',
            '东西湖区': '畅通',
            '汉南区': '畅通',
            '蔡甸区': '畅通',
            '江夏区': '缓行',
            '黄陂区': '畅通',
            '新洲区': '畅通'
          },
          imageUrl: `https://restapi.amap.com/v3/staticmap?zoom=11&size=600 * 400&traffic=1&key=9e7a5d877eb8b1489f8a0cb47226f75f&polygon=114.0,30.6;114.4,30.6;114.4,30.5;114.0,30.5`
        };
      case 'scenic':
        return [
          { name: '黄鹤楼', count: 1200 + Math.floor(Math.random() * 500) },
          { name: '东湖', count: 200 + Math.floor(Math.random() * 800) },
          { name: '汉口江滩', count: 90 + Math.floor(Math.random() * 300) },
          { name: '户部巷', count: 70 + Math.floor(Math.random() * 200) },
          { name: '长江大桥', count: 100 + Math.floor(Math.random() * 600) },
          { name: '湖北省博物馆', count: 600 + Math.floor(Math.random() * 400) },
          { name: '江汉路', count: 2500 + Math.floor(Math.random() * 1000) },
          { name: '武汉园博园', count: 100 + Math.floor(Math.random() * 500) },
          { name: '武汉科技馆', count: 100 + Math.floor(Math.random() * 300) },
          { name: '华中农业大学', count: 200 + Math.floor(Math.random() * 1000) }
        ];
      case 'population':
        return {
          config: {
            xField: 'type',
            yField: 'value',
            seriesField: 'value',
            label: {
              position: 'top',
              style: {
                fill: '#FFFFFF',
                opacity: 0.6,
              },
            },
            color: ({ value }) => {
              if (value > 40000) return '#dc3545';
              else if (value > 20000 && value < 40000) return '#fd7e14';
              else return '#00B96B';
            },
            legend: false,
            height: 300,
          },
          data: [
            { type: '汉阳区', value: 10000 },
            { type: '武昌区', value: 20000 },
            { type: '洪山区', value: 50000 },
            { type: '江夏区', value: 30000 },
            { type: '江岸区', value: 35000 },
          ],
          interval: setInterval(() => {
            const container = document.getElementById(`chart-container-${this.type}`);
            if (container && container.__chart__) {
              const newData = container.__chart__.options.data.map((item) => {
                const value = item.value + Math.floor(Math.random() * 100);
                return { ...item, value };
              });
              container.__chart__.changeData(newData);
            }
          }, 1200)
        };
      case 'bus':
        return {
          config: {
            appendPadding: 10,
            xField: 'type',
            yField: 'value',
            seriesField: 'type',
            radius: 0.9,
            label: { offset: -15 },
            interactions: [{ type: 'element-active' }],
            height: 300,
          },
          data: [
            { type: '汉阳区', value: 27 },
            { type: '武昌区', value: 25 },
            { type: '硚口区', value: 18 },
            { type: '江夏区', value: 15 },
            { type: '洪山区', value: 10 },
            { type: '其他', value: 10 },
          ]
        };
      case 'city-population':
        const pieData = [
          { type: '武昌', value: 27 },
          { type: '汉口', value: 25 }, 
          { type: '汉阳', value: 18 },
          { type: '其他', value: 18 },
        ];
        return {
          config: {
            appendPadding: 10,
            angleField: 'value',
            colorField: 'type',
            radius: 0.9,
            label: {
              type: 'outer',
              offset: 8,
              formatter: (datum) => {
                const total = pieData.reduce((s, d) => s + d.value, 0);
                const percent = ((datum.value / total) * 100).toFixed(1);
                return `${datum.type} ${percent}%`;
              },
              style: { fill: '#fff', fontSize: 12 }
            },
            interactions: [{ type: 'element-active' }],
            height: 300,
            legend: {
              position: 'top',
              itemName: { style: { fill: '#fff' } },
            },
          },
          data: pieData
        };
      case 'hospital':
        return {
          type: 'hospital',
          data: [
            { name: '医院', count: '30家', icon: '🏥', img: 'hospital.png' },
            { name: '门诊部', count: '300个', icon: '🏢', img: 'building.png' },
            { name: '病床', count: '3000张', icon: '🛏️', img: 'bed.png' }
          ]
        };
      case 'school':
        return {
          type: 'school',
          data: [
            { name: '高校', count: '130所', icon: '🏫', img: 'school.png' },
            { name: '在校大学生', count: '100万', icon: '🎓', img: 'student.png' }
          ]
        };
      case 'weather':
        // 使用工具箱中已经获取的真实天气数据
        const cityTools = document.querySelector('.city-tools-container').__cityTools__;
        if (cityTools && cityTools.weatherData) {
          return {
            type: 'weather',
            data: {
              city: cityTools.weatherData.city,
              temperature: cityTools.weatherData.temperature,
              weather: cityTools.weatherData.weather,
              humidity: cityTools.weatherData.humidity,
              windSpeed: cityTools.weatherData.windpower,
              windDirection: cityTools.weatherData.winddirection,
              pressure: '1013hPa', // 默认值
              visibility: '10km', // 默认值
              updateTime: cityTools.weatherData.reporttime,
              icon: this.getWeatherIcon(cityTools.weatherData.weather),
              background: this.getWeatherBackground(cityTools.weatherData.weather),
              sites: {
                cnWeather: 'https://www.weather.com.cn/weather1d/101200101.shtml',
                qqWeather: 'https://tianqi.qq.com/weather.htm?city=420100',
                baiduWeather: 'https://tianqi.baidu.com/wuhan',
                mojiWeather: 'https://tianqi.moji.com/weather/china/hubei/wuhan'
              }
            },
            interval: setInterval(() => {
              // 每30分钟自动刷新
              if (this.modal && this.type === 'weather') {
                this.refreshWeather();
              }
            }, 30 * 60 * 1000)
          };
        } else {
          // 备用数据
          const weatherConditions = ['晴', '多云', '阴', '小雨'];
          const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
          const currentHour = new Date().getHours();
          const baseTemp = 25;
          const tempVariation = Math.floor(Math.random() * 10) - 5;
          const temperature = baseTemp + tempVariation;
        
          return {
            type: 'weather',
            data: {
              city: '武汉',
              temperature: temperature.toString(),
              weather: randomWeather,
              humidity: (60 + Math.floor(Math.random() * 20)).toString() + '%',
              windSpeed: (1 + Math.floor(Math.random() * 5)).toString() + '级',
              windDirection: ['东风', '南风', '西风', '北风', '东南风', '西南风'][Math.floor(Math.random() * 6)],
              pressure: (1010 + Math.floor(Math.random() * 20)).toString() + 'hPa',
              visibility: (8 + Math.floor(Math.random() * 5)).toString() + 'km',
              updateTime: new Date().toLocaleString(),
              icon: this.getWeatherIcon(randomWeather),
              background: this.getWeatherBackground(randomWeather),
              sites: {
                cnWeather: 'https://www.weather.com.cn/weather1d/101200101.shtml',
                qqWeather: 'https://tianqi.qq.com/weather.htm?city=420100',
                baiduWeather: 'https://tianqi.baidu.com/wuhan',
                mojiWeather: 'https://tianqi.moji.com/weather/china/hubei/wuhan'
              }
            },
            interval: setInterval(() => {
              if (this.modal && this.type === 'weather') {
                this.refreshWeather();
              }
            }, 30 * 60 * 1000)
          };
        }

      default:
        return {};
    }
  }

  getWeatherIcon(weather) {
    return weatherIcons[weather] || '🌤️';
  }

  getWeatherBackground(weather) {
    return weatherColors[weather] || 'linear-gradient(to bottom, #292e49, #536976)';
  }

  render() {
    const data = this.generateData();
    this.modal = document.createElement('div');
    this.modal.className = 'city-detail-modal';
    this.modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${this.getTitle()}</h3>
            <button class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            ${this.renderBody(data)}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);
    
    if (data.interval) {
      this.modal.__interval__ = data.interval;
    }
    
    if (['population', 'bus', 'city-population'].includes(this.type)) {
      this.initChart(data);
    }
    
    this.bindEvents();
  }

  getTitle() {
    const titles = {
      'news': '实时新闻',
      'traffic': '交通流量',
      'scenic': '景点人数',
      'population': '出行人口统计',
      'bus': '实时公交在线表',
      'city-population': '武汉市人口统计',
      'hospital': '武汉市三甲医院',
      'school': '高校学生统计',
      'weather': '武汉实时天气'
    };
    return titles[this.type] || '详情';
  }

  renderBody(data) {
    switch (this.type) {
      case 'news':
        return `
          <div class="news-website-btn" onclick="window.open('https://www.wuhan.gov.cn/', '_blank')">
            📰 访问武汉新闻官网
          </div>
          <ul class="news-list">
            ${data.map(n => `
              <li>
                <div class="title">${n.title}</div>
                <div class="meta">${n.source} · ${n.time}</div>
              </li>
            `).join('')}
          </ul>`;
      case 'traffic':
        return `
          <ul class="traffic-list">
            ${Object.entries(data.current).map(([k, v]) => `
              <li>
                <span class="district">${k}</span>
                <span class="status ${v}">${v}</span>
              </li>
            `).join('')}
          </ul>`;
      case 'scenic':
        return `
          <ul class="scenic-list">
            ${data.map(s => `
              <li>
                <span class="name">${s.name}</span>
                <span class="count">${s.count} 人</span>
              </li>
            `).join('')}
          </ul>`;
      case 'population':
      case 'bus':
      case 'city-population':
        return `<div id="chart-container-${this.type}" style="height: ${data.config.height}px;"></div>`;
      case 'hospital':
      case 'school':
        return `
          <div class="stats-container">
            ${data.data.map(item => `
              <div class="stat-item">
                <div class="stat-icon">${item.icon}</div>
                <div class="stat-info">
                  <div class="stat-name">${item.name}</div>
                  <div class="stat-value">${item.count}</div>
                </div>
              </div>
            `).join('')}
          </div>`;
      case 'weather':
        return `
          <div class="weather-modal-container" style="background: ${data.data.background}">
            <div class="weather-main">
              <div class="weather-icon">${data.data.icon}</div>
              <div class="weather-temp">${data.data.temperature}°C</div>
              <div class="weather-desc">${data.data.weather}</div>
            </div>
            <div class="weather-details">
              <div class="detail-item">
                <span>湿度</span>
                <span>${data.data.humidity}</span>
              </div>
              <div class="detail-item">
                <span>风速</span>
                <span>${data.data.windSpeed}</span>
              </div>
              <div class="detail-item">
                <span>风向</span>
                <span>${data.data.windDirection}</span>
              </div>
              <div class="detail-item">
                <span>气压</span>
                <span>${data.data.pressure}</span>
              </div>
              <div class="detail-item">
                <span>能见度</span>
                <span>${data.data.visibility}</span>
              </div>
            </div>
            <div class="weather-footer">
              <span>更新时间: ${data.data.updateTime}</span>
              <div class="weather-actions">
                <button class="refresh-btn" onclick="event.stopPropagation(); this.parentElement.__refreshWeather__()">🔄</button>
                <div class="dropdown">
                  <button class="dropdown-btn">🌐</button>
                  <div class="dropdown-content">
                    <a onclick="event.stopPropagation(); window.open('${data.data.sites.cnWeather}', '_blank')">中国天气网</a>
                    <a onclick="event.stopPropagation(); window.open('${data.data.sites.qqWeather}', '_blank')">腾讯天气</a>
                    <a onclick="event.stopPropagation(); window.open('${data.data.sites.baiduWeather}', '_blank')">百度天气</a>
                    <a onclick="event.stopPropagation(); window.open('${data.data.sites.mojiWeather}', '_blank')">墨迹天气</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script>
            document.querySelector('.weather-actions').__refreshWeather__ = function() {
              const modal = this.closest('.city-detail-modal');
              if (modal && modal.__instance) {
                modal.__instance.refreshWeather();
              }
            };
          </script>`;
      default:
        return '';
    }
  }

  initChart(data) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@antv/g2plot@latest/dist/g2plot.min.js';
    script.onload = () => {
      console.log('G2Plot loaded successfully');
      const container = document.getElementById(`chart-container-${this.type}`);
      
      if (!container) {
        console.error('Chart container not found');
        return;
      }
      
      console.log('Chart data:', data);
      
      try {
        let chart;
        switch (this.type) {
          case 'population':
            chart = new G2Plot.Column(container, {
              ...data.config,
              data: data.data,
            });
            break;
          case 'bus':
            chart = new G2Plot.Rose(container, {
              ...data.config,
              data: data.data,
            });
            break;
          case 'city-population':
            console.log('Creating Pie chart with data:', data);
            chart = new G2Plot.Pie(container, {
              ...data.config,
              data: data.data,
            });
            break;
        }
        
        if (chart) {
          chart.render();
          container.__chart__ = chart;
          console.log('Chart rendered successfully');
        }
      } catch (error) {
        console.error('Chart initialization error:', error);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load G2Plot library');
    };
    
    document.head.appendChild(script);
  }

  refreshWeather() {
    if (this.type === 'weather') {
      // 调用真实的天气API
      const AMAP_KEY = '0f97806556d11f61231563d11f346ae2';
      fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=420100&extensions=base`)
        .then(response => response.json())
        .then(data => {
          if (data.status === '1' && data.lives && data.lives.length > 0) {
            const weather = data.lives[0];
            const newData = {
              city: weather.city,
              temperature: weather.temperature,
              weather: weather.weather,
              humidity: weather.humidity + '%',
              windSpeed: weather.windpower + '级',
              windDirection: weather.winddirection,
              pressure: '1013hPa', // API中没有，使用默认值
              visibility: '10km', // API中没有，使用默认值
              updateTime: weather.reporttime,
              icon: this.getWeatherIcon(weather.weather),
              background: this.getWeatherBackground(weather.weather)
            };

            // 更新模态框中的天气信息
            const weatherContainer = this.modal.querySelector('.weather-modal-container');
            if (weatherContainer) {
              weatherContainer.style.background = newData.background;
              weatherContainer.querySelector('.weather-icon').textContent = newData.icon;
              weatherContainer.querySelector('.weather-temp').textContent = newData.temperature + '°C';
              weatherContainer.querySelector('.weather-desc').textContent = newData.weather;
              const details = weatherContainer.querySelectorAll('.detail-item span:nth-child(2)');
              details[0].textContent = newData.humidity;
              details[1].textContent = newData.windSpeed;
              details[2].textContent = newData.windDirection;
              details[3].textContent = newData.pressure;
              details[4].textContent = newData.visibility;
              weatherContainer.querySelector('.weather-footer span').textContent = `更新时间: ${newData.updateTime}`;

              // 更新工具箱状态
              const cityTools = document.querySelector('.city-tools-container').__cityTools__;
              if (cityTools) {
                cityTools.weatherData = {
                  city: weather.city,
                  weather: weather.weather,
                  temperature: weather.temperature,
                  humidity: weather.humidity + '%',
                  winddirection: weather.winddirection,
                  windpower: weather.windpower + '级',
                  reporttime: weather.reporttime
                };
                document.getElementById('weather-data').textContent = `${weather.weather} ${weather.temperature}°C`;
              }
            }
          }
        })
        .catch(error => {
          console.error('刷新天气数据失败:', error);
        });
    }
  }

  bindEvents() {
    this.modal.__instance = this;
    
    const close = () => {
      if (this.modal.__interval__) {
        clearInterval(this.modal.__interval__);
      }
      const chartContainer = this.modal.querySelector(`[id^="chart-container-"]`);
      if (chartContainer && chartContainer.__chart__) {
        chartContainer.__chart__.destroy();
      }
      document.body.removeChild(this.modal);
    };
    
    this.modal.querySelector('.close-btn').addEventListener('click', close);
    this.modal.querySelector('.modal-backdrop').addEventListener('click', e => {
      if (e.target === e.currentTarget) close();
    });
    
    const dropdownBtn = this.modal.querySelector('.dropdown-btn');
    if (dropdownBtn) {
      dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = e.currentTarget.nextElementSibling;
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
      });
    }
  }
}

// 自动注入样式
const injectStyles = () => {
  const styles = `
    <style>
      .city-tools-container {
        position: fixed;
        top: 150px;
        right: 320px;
        width: 280px;
        background: rgba(20, 30, 48, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transition: all 0.3s ease;
        user-select: none;
        align-items: center;
      }

      .tools-header {
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: grab;
        position: relative;
      }

      /* 增加拖动手柄指示 */
      .tools-header::before {
        content: '⋮⋮';
        position: absolute;
        left: 4px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        opacity: 0.5;
        pointer-events: none;
      }

      .tools-header:hover::before {
        opacity: 0.8;
      }

      .tools-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        padding-left: 18px; /* 为拖动手柄留出空间 */
      }

      .tools-header:active {
        cursor: grabbing;
      }

      .toggle-btn {
        font-size: 12px;
        transition: transform 0.3s;
        cursor: pointer;
      }

      .tools-content {
        padding: 8px;
      }

      .tool-item {
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .tool-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
      }

      .tool-icon {
        font-size: 24px;
        margin-right: 12px;
      }

      .tool-info {
        flex: 1;
      }

      .tool-name {
        display: block;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .tool-data {
        display: block;
        font-size: 12px;
        color: #00d4ff;
      }

      .city-detail-modal {
        position: fixed;
        inset: 0;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .modal-backdrop {
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.6);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal-content {
        width: 90%;
        max-width: 420px;
        background: linear-gradient(135deg,#1e3c72 0%, #2a5298 100%);
        border-radius: 12px;
        color: #fff;
        box-shadow: 0 8px 32px rgba(0,0,0,.4);
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255,255,255,.2);
      }
      .modal-header h3 { margin: 0; font-size: 16px; }
      .close-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
      }
      .modal-body { padding: 16px; max-height: 60vh; overflow-y: auto; }
      .modal-body ul { list-style: none; margin: 0; padding: 0; }
      .modal-body li {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255,255,255,.1);
        font-size: 14px;
      }
      .modal-body li:last-child { border-bottom: none; }
      .traffic-list .status.congestion { color: #ff6b6b; }
      .traffic-list .status.slow { color: #ffa726; }
      .traffic-list .status.smooth { color: #66bb6a; }
      .scenic-list .count { font-weight: bold; color: #00e5ff; }

      /* 新增按钮悬停效果 */
      .news-website-btn:hover {
        background: rgba(0, 212, 255, 0.3) !important;
      }

      /* 图表容器样式 */
      #chart-container-population,
      #chart-container-bus,
      #chart-container-city-population {
        width: 100%;
      }

      /* 统计数据样式 */
      .stats-container {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        justify-content: center;
      }

      .stat-item {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        min-width: 120px;
      }

      .stat-icon {
        font-size: 24px;
        margin-right: 12px;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-name {
        font-size: 12px;
        opacity: 0.8;
      }

      .stat-value {
        font-size: 16px;
        font-weight: bold;
      }

      /* 天气模态框样式 */
      .weather-modal-container {
        padding: 20px;
        border-radius: 8px;
        color: white;
      }

      .weather-main {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }

      .weather-icon {
        font-size: 48px;
        margin-right: 15px;
      }

      .weather-temp {
        font-size: 36px;
        font-weight: bold;
        margin-right: 15px;
      }

      .weather-desc {
        font-size: 18px;
      }

      .weather-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 15px;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
      }

      .weather-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        opacity: 0.8;
        padding-top: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
      }

      .weather-actions {
        display: flex;
        gap: 5px;
      }

      .refresh-btn, .dropdown-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .dropdown {
        position: relative;
      }

      .dropdown-content {
        position: absolute;
        right: 0;
        bottom: 100%;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        min-width: 120px;
        display: none;
      }

      .dropdown-content a {
        color: #fff;
        padding: 8px 12px;
        text-decoration: none;
        display: block;
        font-size: 12px;
      }

      .dropdown-content a:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      #chart-container-city-population {
        width: 100%;
        height: 300px;
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
      }
    </style>
  `;

  if (!document.querySelector('#city-tools-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'city-tools-styles';
    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);
  }
};

// 初始化
if (typeof window !== 'undefined') {
  injectStyles();
  const cityTools = new CityTools();
  
  // 将实例存储在DOM元素上，以便在DetailModal中访问
  document.querySelector('.city-tools-container').__cityTools__ = cityTools;
}