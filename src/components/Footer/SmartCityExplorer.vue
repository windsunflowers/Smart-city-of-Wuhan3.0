<template>
  <el-popover popper-class="city-explorer-popover" placement="top" trigger="click" :width="400">
    <template #reference>
      <slot></slot>
    </template>
    <div class="city-explorer">
      <div class="explorer-header">
        <div class="header-content">
          <div class="title-with-icon">
            <i class="title-icon el-icon-office-building"></i>
            <h3>城市智慧探索</h3>
          </div>
          <div class="header-badges">
            <el-badge value="NEW" type="success" />
          </div>
        </div>
        <el-tabs v-model="activeTab" type="card" class="custom-tabs">
          <el-tab-pane label="智慧出行" name="travel">
            <template #label>
              <div class="tab-label">
                <i class="el-icon-map-location"></i>
                <span>智慧出行</span>
              </div>
            </template>
            <div class="feature-content">
              <div class="feature-intro">
                <i class="feature-icon el-icon-map-location"></i>
                <span>快速规划最优出行路线</span>
              </div>
              <el-form :inline="true" size="small" class="explorer-form">
                <el-form-item label="起点">
                  <el-input v-model="from" placeholder="输入起点" prefix-icon="el-icon-location-outline" />
                </el-form-item>
                <el-form-item label="终点">
                  <el-input v-model="to" placeholder="输入终点" prefix-icon="el-icon-position" />
                </el-form-item>
                <div class="form-row">
                  <el-form-item label="方式" class="travel-mode">
                    <el-radio-group v-model="travelMode" size="small">
                      <el-radio-button label="driving">驾车</el-radio-button>
                      <el-radio-button label="walking">步行</el-radio-button>
                      <el-radio-button label="riding">骑行</el-radio-button>
                      <el-radio-button label="transit">公交</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item class="action-buttons">
                    <el-button type="primary" :loading="loading" @click="searchRoute">查询</el-button>
                    <el-button @click="clearRoute">清除</el-button>
                  </el-form-item>
                </div>
              </el-form>
              <div v-if="error" class="error-message">
                <i class="el-icon-warning"></i> {{ error }}
              </div>
              <div v-if="routeInfo" class="route-info">
                <div class="route-header">
                  <i class="el-icon-guide"></i>
                  <span>路线详情</span>
                </div>
                <div class="route-details">
                  <div class="detail-item">
                    <span class="detail-label">推荐方案:</span>
                    <span class="detail-value">{{ routeInfo.summary }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">距离:</span> 
                    <span class="detail-value">{{ routeInfo.distance }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">预计用时:</span> 
                    <span class="detail-value">{{ routeInfo.duration }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="智能分析" name="analysis">
            <template #label>
              <div class="tab-label">
                <i class="el-icon-data-analysis"></i>
                <span>智能分析</span>
              </div>
            </template>
            <div class="feature-content">
              <div class="feature-intro">
                <i class="feature-icon el-icon-data-analysis"></i>
                <span>区域智能设施分析</span>
              </div>
              <el-form :inline="true" size="small" class="explorer-form">
                <el-form-item label="中心点">
                  <el-input v-model="analysisCenter" placeholder="输入中心位置" prefix-icon="el-icon-aim" />
                </el-form-item>
                <div class="form-row">
                  <el-form-item label="半径">
                    <el-slider 
                      v-model="analysisRadius" 
                      :step="500" 
                      :min="500" 
                      :max="5000" 
                      :format-tooltip="formatRadius" 
                      show-stops>
                    </el-slider>
                  </el-form-item>
                </div>
                <div class="form-row center-buttons">
                  <el-button type="primary" :loading="analysisLoading" @click="runAnalysis">
                    <i class="el-icon-refresh-right"></i> 分析
                  </el-button>
                  <el-button @click="clearAnalysis">
                    <i class="el-icon-delete"></i> 清除
                  </el-button>
                </div>
              </el-form>
              <div v-if="analysisError" class="error-message">
                <i class="el-icon-warning"></i> {{ analysisError }}
              </div>
              <div v-if="analysisResult" class="analysis-result">
                <div class="analysis-summary">
                  <div class="summary-header">
                    <i class="el-icon-document"></i>
                    <h4>区域分析报告</h4>
                  </div>
                  <p>{{ analysisResult.summary }}</p>
                </div>
                <div class="analysis-stats">
                  <!-- 修复此处嵌套错误：将内部stat-item改为stat-content，与其他项保持一致 -->
                  <div class="stat-item">
                    <div class="stat-icon">
                      <img src="../../assets/images/商业设施.png" alt="商业设施" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-title">商业设施</div>
                      <div class="stat-value">{{ analysisResult.business }}</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">
                      <img src="../../assets/images/教育设施.png" alt="教育设施" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-title">教育设施</div>
                      <div class="stat-value">{{ analysisResult.education }}</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">
                      <img src="../../assets/images/医疗设施.png" alt="医疗设施" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-title">医疗设施</div>
                      <div class="stat-value">{{ analysisResult.medical }}</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">
                      <img src="../../assets/images/交通设施.png" alt="交通设施" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-title">交通设施</div>
                      <div class="stat-value">{{ analysisResult.transport }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { LineLayer, PointLayer } from '@antv/l7'
import useSmartCityExplorer from './hooks/useSmartCityExplorer'

// 活动标签页
const activeTab = ref('travel')

// 地图和场景实例
const { scene, map } = inject('$scene_map')

// 出行规划相关
const from = ref('')
const to = ref('')
const travelMode = ref('driving')
const { 
  loading, 
  error, 
  routeInfo, 
  searchRoute: doSearchRoute, 
  clearRoute 
} = useSmartCityExplorer().travel(from, to, travelMode)

function searchRoute() {
  if (from.value && to.value) {
    doSearchRoute()
  }
}

// 智能分析相关
const analysisCenter = ref('')
const analysisRadius = ref(1000)
const analysisLoading = ref(false)
const analysisError = ref(null)
const analysisResult = ref(null)

const { runAnalysis: doRunAnalysis, clearAnalysis: doClearAnalysis } = useSmartCityExplorer().analysis(
  analysisCenter,
  analysisRadius,
  analysisLoading,
  analysisError,
  analysisResult
)

function runAnalysis() {
  if (analysisCenter.value) {
    doRunAnalysis()
  }
}

function clearAnalysis() {
  doClearAnalysis()
}

// 格式化半径
function formatRadius(val) {
  return val < 1000 ? `${val}米` : `${val/1000}公里`;
}
</script>

<style scoped>
/* =========================================================
   1. 根容器配置：定义局部变量，强制覆盖 Element Plus 默认白色
   ========================================================= */
.city-explorer {
  /* --- 核心修复：把 Element Plus 的默认白底变量全部设为透明 --- */
  --el-bg-color: transparent !important;
  --el-bg-color-overlay: transparent !important;
  --el-fill-color-blank: transparent !important; /* 修复 Input/Select 白底 */
  --el-card-bg-color: transparent !important;    /* 修复 Card 白底 */
  --el-border-color-light: rgba(64, 158, 255, 0.2); /* 修复默认灰边框 */
  --el-text-color-primary: #ffffff; /* 默认文字变白 */
  --el-text-color-regular: #d1edff; /* 次要文字变蓝白 */

  /* --- 自身的玻璃面板样式 --- */
  width: 100%;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  
  /* 深蓝磨砂背景 */
  background: linear-gradient(145deg, rgba(12, 35, 68, 0.8) 0%, rgba(4, 15, 30, 0.9) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* 边框发光 */
  border: 1px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
}

/* =========================================================
   2. 穿透修复：暴力清除内部组件的白框/白底
   ========================================================= */

/* 如果外层误用了 el-card，强制去背景去边框 */
:deep(.el-card) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
:deep(.el-card__body) {
  padding: 0 !important;
}

/* 修复 Input 输入框白底 */
:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper),
:deep(.el-select__wrapper) {
  background-color: rgba(0, 0, 0, 0.25) !important; /* 深色半透明底 */
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.3) inset !important; /* 蓝光边框 */
}
:deep(.el-input__inner) {
  color: #fff !important;
}

/* 修复 Tabs 标签页底部的灰色线条 */
:deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(64, 158, 255, 0.1) !important;
}
:deep(.el-tabs__item) {
  color: #a0cfff !important;
}
:deep(.el-tabs__item.is-active) {
  color: #409EFF !important;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}

/* =========================================================
   3. 内部布局样式 (保持您原有的布局逻辑)
   ========================================================= */

.explorer-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 图标：发光蓝盒 */
.title-icon {
  font-size: 24px;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.15);
  padding: 8px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(64, 158, 255, 0.2);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.1);
}

/* 标题：发光白字 */
.header-content h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
}

.custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 15px;
}

.feature-intro {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: #a0cfff;
  font-size: 14px;
}

.form-row {
  display: flex;
  width: 100%;
  margin-top: 10px;
  justify-content: space-between;
  align-items: center;
}

.center-buttons {
  justify-content: center;
  margin-top: 15px;
}

/* 错误提示：红光玻璃 */
.error-message {
  color: #fab6b6;
  margin: 12px 0;
  padding: 8px 12px;
  background-color: rgba(245, 108, 108, 0.15);
  border: 1px solid rgba(245, 108, 108, 0.3);
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 路径信息：绿光玻璃 */
.route-info {
  background-color: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.3);
  border-radius: 4px;
  padding: 12px;
  margin-top: 15px;
}
.route-header {
  color: #95d475;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}
.detail-label {
  color: #a0cfff;
  min-width: 70px;
}
.detail-value {
  color: #fff;
}

/* 分析摘要：蓝光玻璃 */
.analysis-summary {
  background-color: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.2);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
}
.summary-header h4 {
  margin: 0;
  font-size: 14px;
  color: #d1edff;
}
.analysis-summary p {
  color: #cddfe6;
}

/* 统计卡片：深色半透明 */
.analysis-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(64, 158, 255, 0.15);
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin-bottom: 0; /* Grid布局下不需要 margin-bottom */
  transition: all 0.3s;
}

.stat-item:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.4);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.15);
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 12px;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.stat-icon img {
  width: 20px;
  height: 20px;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 12px;
  color: #a0cfff;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
}
</style>
<style>
/* =========================================================
   全局样式：专门处理“城市智慧探索”Popove的外壳
   注意：这里没有 scoped，必须是全局样式才能生效
   ========================================================= */

/* 1. 把最外层容器彻底变透明 */
.el-popover.city-explorer-popover {
  /* 背景透明 */
  background: transparent !important;
  background-color: transparent !important;
  
  /* 去掉默认的白边框和阴影 */
  border: none !important;
  box-shadow: none !important;
  
  /* 去掉内边距，让你内部的 .city-explorer 贴边显示 */
  padding: 0 !important;

  /* 覆盖 Element 变量 (双重保险) */
  --el-popover-bg-color: transparent !important;
  --el-popover-border-color: transparent !important;
  --el-popover-padding: 0 !important;
}

/* 2. 隐藏那个凸出来的白色小三角箭头 */
.el-popover.city-explorer-popover .el-popper__arrow {
  display: none !important;
}
</style>