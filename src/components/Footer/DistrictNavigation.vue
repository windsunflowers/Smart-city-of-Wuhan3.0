<template>
  <el-popover
    placement="top"
    trigger="click"
    popper-style="background-color:#53697670;color:#fff;border:1px solid #fff"
    :width="300"
  >
    <template #reference>
      <slot></slot>
    </template>
    <div class="district-navigation">
      <div class="navigation-header">
        <h3>区域导航</h3>
        <div class="header-buttons">
          <el-button 
            type="text" 
            size="small" 
            @click="clearHighlight"
            style="color: #fff; margin-right: 8px;"
          >
            清除高亮
          </el-button>
          <el-button 
            type="text" 
            size="small" 
            @click="refreshDistricts"
            :loading="loading"
            style="color: #fff;"
          >
            刷新
          </el-button>
        </div>
      </div>
      
      <div class="tip-text">
        <small>点击区域跳转并高亮，再次点击取消高亮</small>
      </div>
      
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="districts.length === 0" class="empty-container">
        <span>暂无区域数据</span>
        <el-button type="text" size="small" @click="fetchDistricts" style="color: #fff;">
          重新获取
        </el-button>
      </div>
      
      <div v-else class="districts-list">
        <div
          v-for="district in districts"
          :key="district.adcode"
          class="district-item"
          :class="{ 'selected': selectedDistrict && selectedDistrict.adcode === district.adcode }"
          @click="handleDistrictClick(district)"
        >
          <span class="district-name">{{ district.name }}</span>
          <el-icon class="district-icon"><Location /></el-icon>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { Loading, Location } from '@element-plus/icons-vue'
import useDistrictNavigation from './hooks/useDistrictNavigation.js'

const { districts, loading, selectedDistrict, fetchDistricts, flyToDistrict, clearHighlight } = useDistrictNavigation()

// 刷新区域数据
const refreshDistricts = () => {
  fetchDistricts()
}

// 处理区域点击
const handleDistrictClick = (district) => {
  // 如果点击的是已选中的区域，则清除高亮
  if (selectedDistrict.value && selectedDistrict.value.adcode === district.adcode) {
    clearHighlight()
  } else {
    // 否则跳转到新区域
    flyToDistrict(district)
  }
}

// 组件挂载时获取区域数据
onMounted(() => {
  fetchDistricts()
})

// 组件卸载时清除高亮
onBeforeUnmount(() => {
  clearHighlight()
})
</script>

<style scoped>
.district-navigation {
  padding: 10px;
}

.navigation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 10px;
}

.header-buttons {
  display: flex;
  align-items: center;
}

.tip-text {
  text-align: center;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.navigation-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #fff;
  gap: 10px;
}

.districts-list {
  max-height: 300px;
  overflow-y: auto;
}

.district-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.district-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.district-item.selected {
  background-color: rgba(255, 107, 53, 0.3);
  border: 1px solid #ff6b35;
  transform: translateX(5px);
}

.district-item.selected .district-name {
  color: #ff6b35;
  font-weight: bold;
}

.district-item.selected .district-icon {
  color: #ff6b35;
}

.district-name {
  color: #fff;
  font-size: 14px;
}

.district-icon {
  color: #fff;
  font-size: 16px;
}

/* 滚动条样式 */
.districts-list::-webkit-scrollbar {
  width: 4px;
}

.districts-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.districts-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.districts-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style> 