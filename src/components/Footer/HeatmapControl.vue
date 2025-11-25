<!-- <template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div id="map-container" ref="mapContainer" style="width: 100%; height: 600px;"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel" style="position: absolute; top: 20px; right: 20px; z-index: 10;">
      <el-card shadow="hover" style="width: 240px;">
        <template #header>
          <div class="panel-header">
            <i class="el-icon-data-analysis"></i>
            <span>热力图控制</span>
          </div>
        </template>
        <el-form label-width="80px">
          <!-- 透明度控制 -->
          <el-form-item label="透明度">
            <el-slider v-model="opacity" :min="0" :max="1" :step="0.1" @change="updateHeatmap"></el-slider>
          </el-form-item>
          
          <!-- 半径控制 -->
          <el-form-item label="半径">
            <el-slider v-model="radius" :min="10" :max="50" @change="updateHeatmap"></el-slider>
          </el-form-item>
          
          <!-- 颜色控制 -->
          <el-form-item label="渐变颜色">
            <el-color-picker 
              v-model="colorPickerValue" 
              show-alpha 
              :predefine="predefineColors"
              @change="updateColorGradient">
            </el-color-picker>
          </el-form-item>
          
          <!-- 操作按钮 -->
          <el-button type="primary" @click="loadMockData">加载模拟数据</el-button>
          <el-button @click="clearHeatmap">清除热力图</el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watchEffect } from 'vue';
import { ElCard, ElForm, ElFormItem, ElSlider, ElColorPicker, ElButton } from 'element-plus';

export default {
  name: 'HeatmapTest',
  components: { ElCard, ElForm, ElFormItem, ElSlider, ElColorPicker, ElButton },
  setup() {
    // 核心变量
    const mapContainer = ref(null);
    let map = null;          // 高德地图实例
    let heatmap = null;      // 热力图实例
    
    // 热力图配置
    const opacity = ref(0.7);          // 透明度
    const radius = ref(30);            // 热力点半径
    const colorPickerValue = ref('rgba(255, 0, 0, 0.8)'); // 基础颜色
    const predefineColors = ref([      // 预设颜色
      'rgba(255, 0, 0, 0.8)',
      'rgba(255, 165, 0, 0.8)',
      'rgba(0, 255, 0, 0.8)'
    ]);
    
    // 简化版渐变配置（必现关键）
    const gradientColors = ref({
      0.1: 'blue',    // 最低密度
      0.5: 'yellow',  // 中等密度
      0.9: 'red'      // 最高密度
    });

    // 1. 初始化地图（最简版）
    const initMap = () => {
      return new Promise((resolve) => {
        // 直接创建地图（假设API已全局加载）
        map = new AMap.Map(mapContainer.value, {
          viewMode: '2D',
          zoom: 12,          // 武汉区域合适层级
          center: [114.30, 30.50] // 武汉市中心
        });
        
        // 地图加载完成后 resolve
        map.on('complete', () => {
          console.log('地图初始化完成');
          resolve(map);
        });
      });
    };

    // 2. 初始化热力图（强制创建）
    const initHeatmap = () => {
      if (!map) {
        console.error('地图未初始化，无法创建热力图');
        return;
      }

      // 销毁旧实例（如果有）
      if (heatmap) {
        heatmap.setMap(null);
        heatmap = null;
      }

      // 必现关键：严格按照API要求创建实例
      heatmap = new AMap.Heatmap(map, {
        radius: radius.value,
        opacity: [opacity.value],
        gradient: gradientColors.value
      });
      console.log('热力图实例创建成功', heatmap);
    };

    // 3. 更新热力图配置
    const updateHeatmap = () => {
      if (!heatmap) {
        console.warn('热力图未初始化，跳过更新');
        return;
      }

      // 关键：使用 setOptions 而非直接赋值
      heatmap.setOptions({
        radius: radius.value,
        opacity: [opacity.value],
        gradient: gradientColors.value
      });
      console.log('热力图配置已更新');
    };

    // 4. 更新渐变颜色
    const updateColorGradient = (newColor) => {
      // 重构渐变配置
      gradientColors.value = {
        0.1: 'blue',
        0.5: newColor.replace('0.8', '0.5'), // 调整透明度
        0.9: newColor
      };
      updateHeatmap(); // 触发更新
    };

    // 5. 加载模拟数据（必现核心）
    const loadMockData = () => {
      // 无API依赖的纯模拟数据
      const mockData = {
        data: [
          // 武汉核心区域高密度点
          { lng: 114.30, lat: 30.50, count: 500 }, // 江汉路（高密度）
          { lng: 114.31, lat: 30.51, count: 450 }, // 武商商圈
          { lng: 114.29, lat: 30.52, count: 480 }, // 汉口江滩
          
          // 次核心区域中密度点
          { lng: 114.35, lat: 30.55, count: 200 }, // 光谷广场
          { lng: 114.25, lat: 30.45, count: 220 }, // 汉阳钟家村
          
          // 边缘区域低密度点
          { lng: 114.40, lat: 30.60, count: 50 },  // 江夏区
          { lng: 114.20, lat: 30.40, count: 30 }   // 东西湖区
        ],
        max: 500 // 与最大count匹配
      };

      // 强制初始化兜底
      if (!heatmap) {
        initHeatmap();
      }

      // 关键：使用 setDataSet 加载数据
      heatmap.setDataSet(mockData);
      console.log('模拟数据加载完成，共', mockData.data.length, '个点');
      
      // 调整视野到数据中心
      map.setZoom(11);
      map.panTo([114.30, 30.50]);
    };

    // 6. 清除热力图
    const clearHeatmap = () => {
      if (heatmap) {
        heatmap.setDataSet({ data: [], max: 0 });
        console.log('热力图已清除');
      }
    };

    // 初始化流程
    onMounted(async () => {
      // 加载高德地图API（本地测试可直接在index.html引入）
      await loadAMapScript();
      
      // 初始化地图和热力图
      await initMap();
      initHeatmap();
    });

    // 监听配置变化
    watchEffect(() => {
      if (heatmap) {
        updateHeatmap();
      }
    });

    // 辅助函数：加载高德地图API（可直接在index.html引入）
    const loadAMapScript = () => {
      return new Promise((resolve) => {
        if (window.AMap) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=00f2e4d20900d6bd637c9aba1499c536&plugin=AMap.Heatmap`;
        script.onload = () => {
          console.log('高德地图API加载完成');
          resolve();
        };
        document.head.appendChild(script);
      });
    };

    return {
      mapContainer,
      opacity,
      radius,
      colorPickerValue,
      predefineColors,
      updateHeatmap,
      loadMockData,
      clearHeatmap,
      updateColorGradient
    };
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
}
</style> -->