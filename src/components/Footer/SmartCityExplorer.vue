<template>
  <el-popover placement="top" trigger="click" :width="400">
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
.city-explorer {
  width: 100%;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

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
  gap: 8px;
}

.title-icon {
  font-size: 24px;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 6px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-content h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.header-badges {
  display: flex;
  gap: 8px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 15px;
}

.custom-tabs :deep(.el-tabs__nav-wrap) {
  padding-bottom: 0;
}

.custom-tabs :deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
}

.feature-content {
  padding: 5px 0 15px;
}

.feature-intro {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: #409EFF;
  font-size: 14px;
}

.feature-icon {
  font-size: 18px;
}

.explorer-form {
  margin-bottom: 15px;
  width: 100%;
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

.travel-mode {
  margin-bottom: 0;
  
  
}

.action-buttons {
  margin-bottom: 0;
  
}

.error-message {
  color: #f56c6c;
  margin: 12px 0;
  padding: 8px 12px;
  background-color: #fef0f0;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.route-info {
  background-color: #f0f9eb;
  border-radius: 4px;
  padding: 12px;
  margin-top: 15px;
}

.route-header {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #67c23a;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.route-details {
  font-size: 13px;
}

.detail-item {
  margin-bottom: 5px;
  display: flex;
  align-items: baseline;
}

.detail-label {
  color: #606266;
  font-weight: 500;
  margin-right: 5px;
  min-width: 70px;
}

.detail-value {
  color: #303133;
}

.analysis-result {
  margin-top: 15px;
}

.analysis-summary {
  background-color: #f4f4f5;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.summary-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.summary-header i {
  color: #909399;
}

.analysis-summary p {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.analysis-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 20px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 12px;
  color: #606266;
  margin-bottom: 3px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}


/* 容器样式 */
.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

/* 图标样式 */
.stat-icon {
  margin-right: 10px;
}

.stat-icon img {
  width: 19px; /* 图标大小 */
  height: 19px;
  object-fit: cover; /* 确保图片填充整个容器 */
}

/* 内容样式 */
.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 14px;
  color: #666;
}
</style>