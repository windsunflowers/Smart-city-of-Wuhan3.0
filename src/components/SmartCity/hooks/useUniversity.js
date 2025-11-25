import { getUniversityData } from '@/api/smart_city';
import { PolygonLayer, Popup } from '@antv/l7';
import axios from 'axios';

export default async (scene) => {
  // 获取大学数据
  const university_data = await getUniversityData();
  
  // 创建大学详情缓存
  const universityDetailsCache = new Map();

  // 创建一个增强的弹出窗口
  const popup = new Popup({
    offsets: [0, 20],
    closeButton: true,
    closeOnClick: false, // 防止点击内容时关闭
    anchor: 'bottom',
    className: 'university-detail-popup',
    stopPropagation: true
  });

  // 异步获取大学额外信息
  const fetchUniversityDetails = async (name) => {
    // 如果已缓存，直接返回
    if (universityDetailsCache.has(name)) {
      return universityDetailsCache.get(name);
    }

    try {
      // 这里模拟从API获取数据，实际项目中可以替换为真实API
      // 或者预先准备好信息嵌入到应用中
      const basicInfo = {
        description: `${name}是中国知名高等教育机构，位于湖北省武汉市。`,
        founded: '获取中...',
        students: '获取中...',
        faculties: '获取中...',
        ranking: '获取中...',
        image: '' // 可以添加学校图片URL
      };
      
      universityDetailsCache.set(name, basicInfo);
      
      // 异步获取更多信息（模拟API请求）
      // 实际项目中可以替换为真实API调用
      setTimeout(() => {
        // 这里只是模拟数据，实际项目中应该使用真实API
        const detailedInfo = {
          ...basicInfo,
          founded: 1898,
          faculties: 17,
        };
        
        universityDetailsCache.set(name, detailedInfo);
        
        // 如果当前弹窗显示的是这所大学，则更新内容
        const currentPopup = document.querySelector('.university-detail-popup');
        if (currentPopup && currentPopup.querySelector('h3') && currentPopup.querySelector('h3').textContent === name) {
          updatePopupContent(name, popup.getLngLat());
        }
      }, 1000);
      
      return basicInfo;
    } catch (error) {
      console.error('获取大学详情失败:', error);
      return null;
    }
  };
  
  // 生成随机创建年份（仅用于演示）
  const getRandomFoundedYear = () => {
    const years = [1898];
    return years[Math.floor(Math.random() * years.length)];
  };

  // 更新弹窗内容函数
  const updatePopupContent = async (name, lngLat) => {
    // 检查场景是否可用
    if (!scene) {
      console.error('更新弹窗失败: 场景实例不存在');
      return;
    }
    
    // 查找对应的原始数据
    const universityFeature = university_data.features.find(f => f.properties.name === name);
    if (!universityFeature) return;
    
    const props = universityFeature.properties;
    
    // 获取基础信息
    const address = `${props['addr:province'] || ''}${props['addr:city'] || ''}${props['addr:street'] || ''} ${props['addr:housenumber'] || ''}`.trim();
    const postcode = props['addr:postcode'] || '';
    const website = props.website || '';
    const wikidata = props.wikidata || '';
    const wikipedia = props.wikipedia || '';
    const shortName = props.short_name || '';
    const enName = props['name:en'] || '';
    
    // 获取或创建详情信息
    const details = await fetchUniversityDetails(name);
    
    // 创建弹窗HTML内容
    let popupContent = `
      <div class="university-popup-content">
        <h3>${name}</h3>
        ${shortName ? `<div class="uni-alias">${shortName}${enName ? ` / ${enName}` : ''}</div>` : ''}
        
        <div class="uni-info-section">
          ${details.description ? `<p class="uni-description">${details.description}</p>` : ''}
          
          <div class="uni-details-grid">
            ${details.founded !== '获取中...' ? `
              <div class="uni-detail-item">
                <span class="uni-detail-label">建校时间</span>
                <span class="uni-detail-value">${details.founded}</span>
              </div>` : ''
            }
            ${details.faculties !== '获取中...' ? `
              <div class="uni-detail-item">
                <span class="uni-detail-label">院系数量</span>
                <span class="uni-detail-value">${details.faculties}</span>
              </div>` : ''
            }
          </div>
        </div>
        
        <div class="uni-info-section">
          <h4>基本信息</h4>
          ${address ? `<p><strong>地址:</strong> ${address}</p>` : ''}
          ${postcode ? `<p><strong>邮编:</strong> ${postcode}</p>` : ''}
          
          <div class="uni-links">
            ${website ? `<a href="${website}" target="_blank" class="uni-link website-link">官方网站</a>` : ''}
            ${wikidata ? `<a href="https://www.wikidata.org/wiki/${wikidata}" target="_blank" class="uni-link wikidata-link">维基数据</a>` : ''}
            ${wikipedia ? `<a href="https://zh.wikipedia.org/wiki/${wikipedia.replace('zh:', '')}" target="_blank" class="uni-link wiki-link">维基百科</a>` : ''}
          </div>
        </div>
        
        <div class="uni-loading-indicator ${details.founded === '获取中...' ? 'active' : ''}">
          <span class="uni-loading-spinner"></span>
          <span class="uni-loading-text">加载更多信息...</span>
        </div>
      </div>
    `;
    
    // 更新弹窗内容
    popup.setLngLat(lngLat).setHTML(popupContent);
    
    // 安全地添加弹窗
    try {
      // 先尝试移除可能存在的弹窗
      try {
        if (scene.hasPopup && scene.hasPopup(popup)) {
          scene.removePopup(popup);
        }
      } catch (err) {
        console.warn('移除弹窗失败:', err);
      }
      
      // 添加弹窗
      scene.addPopup(popup);
    } catch (err) {
      console.error('添加弹窗失败:', err);
    }
  };

  // 使用PolygonLayer创建大学图层
  const university_layer = new PolygonLayer({
    name: '武汉市大学分布',
    autoFit: false,
    enablePicking: true,
    enableHighlight: true,
    highlightColor: [255, 215, 0, 100]
  })
    .source(university_data)
    .shape('fill')
    .color('#236ef0ff')
    .style({
      opacity: 0.32,
      stroke: '#FFF',
      strokeWidth: 1
    });

  // 添加点击事件处理
  let lastClickTime = 0;
  university_layer.on('click', (e) => {
    const now = Date.now();
    if (now - lastClickTime < 300) return;
    lastClickTime = now;

    try {
      if (!scene) {
        console.error('处理点击事件失败: 场景实例不存在');
        return;
      }
      
      const feature = e.feature;
      if (!feature || !feature.properties || !feature.properties.name) return;
      
      // 更新弹窗内容
      updatePopupContent(feature.properties.name, e.lngLat);
    } catch (error) {
      console.error('处理大学点击事件出错:', error);
    }
  });

  // 添加CSS样式
  const addStyle = () => {
    // 检查是否已存在样式
    if (document.getElementById('university-popup-style')) return;
    
    const style = document.createElement('style');
    style.id = 'university-popup-style';
    style.textContent = `
      .university-popup-content {
        padding: 12px;
        max-width: 320px;
        max-height: 400px;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      
      .university-popup-content h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #333;
        border-bottom: 2px solid #34bc16;
        padding-bottom: 6px;
      }
      
      .uni-alias {
        color: #666;
        font-size: 13px;
        margin-bottom: 12px;
      }
      
      .uni-info-section {
        margin-bottom: 16px;
      }
      
      .uni-info-section h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #444;
      }
      
      .uni-description {
        margin: 8px 0 12px 0;
        font-size: 13px;
        line-height: 1.5;
        color: #333;
      }
      
      .uni-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
      }
      
      .uni-detail-item {
        background: #f5f5f5;
        padding: 8px;
        border-radius: 4px;
      }
      
      .uni-detail-label {
        display: block;
        font-size: 11px;
        color: #666;
      }
      
      .uni-detail-value {
        display: block;
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
      
      .uni-info-section p {
        margin: 4px 0;
        font-size: 13px;
        color: #555;
      }
      
      .uni-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      
      .uni-link {
        display: inline-block;
        padding: 6px 12px;
        background: #eee;
        color: #333;
        text-decoration: none;
        border-radius: 4px;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .uni-link:hover {
        background: #ddd;
      }
      
      .website-link {
        background: #e6f7e6;
        color: #34bc16;
      }
      
      .website-link:hover {
        background: #d0f0d0;
      }
      
      .uni-loading-indicator {
        display: flex;
        align-items: center;
        padding: 8px;
        background: #f9f9f9;
        border-radius: 4px;
        margin-top: 12px;
        display: none;
      }
      
      .uni-loading-indicator.active {
        display: flex;
      }
      
      .uni-loading-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 8px;
        border: 2px solid #ddd;
        border-top-color: #34bc16;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .uni-loading-text {
        font-size: 12px;
        color: #666;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  };

  // 添加样式
  addStyle();

  return university_layer;
};