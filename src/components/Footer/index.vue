<template>
  <footer class="footer">
    <div class="btn-groups">
      <div class="item">
        <button class="toogle-btn" @click="handleRotation">
          <i class="iconfont icon-fuwudiqiu"></i>
        </button>
        <p>{{ mark }}</p>
      </div>
      <div class="item">
        <button class="toogle-btn" @click="toggleCharts">
          <i class="iconfont icon-supervision-full"></i>
        </button>
        <p>控制中心</p>
      </div>
      <div class="item">
        <button class="toogle-btn" @click="flyTo">
          <i class="iconfont icon-icon-test"></i>
        </button>
        <p>{{ flyMsg }}</p>
      </div>
      <div class="item">
        <DrawTools>
          <button class="toggle-btn">
            <i class="iconfont icon-paint"></i>
          </button>
        </DrawTools>
        <p>事故查询</p>
      </div>
      <div class="item">
        <MeasureTools>
          <button class="toggle-btn">
            <i class="iconfont icon-ruler"></i>
          </button>
        </MeasureTools>
        <p>测量工具</p>
      </div>
      <div class="item">
        <button class="toogle-btn" @click="openLayerDialog">
          <img src="@/assets/images/图层切换.png" alt="切换图层图标" />
        </button>
        <p>切换图层</p>
      </div>
      <div class="item">
        <SmartCityExplorer>
          <button class="toggle-btn">
            <i class="iconfont icon-zhihuichengshi"></i>
          </button>
        </SmartCityExplorer>
        <p>智慧城市</p>
      </div>
      <div class="item">
        <DistrictNavigation>
          <button class="toggle-btn">
            <i class="iconfont icon-daohang"></i>
          </button>
        </DistrictNavigation>
        <p>区域导航</p>
      </div>
      <div class="item">
        <ObjModels>
          <button class="toggle-btn">
            <i class="iconfont icon-feiji_qifei"></i>
          </button>
        </ObjModels>
        <p>3D模型</p>
      </div>
    </div>
    
    <LayerSwitcher ref="layerSwitcherRef" />

    </footer>
  </template>

<script setup>
// 注意：ref 从 vue 中引入是必需的
import { ref } from 'vue' 
// 移除了 ElDialog, ElCheckbox, ElButton, ElSlider, ElCheckboxGroup, inject, watch, nextTick, onMounted
// 它们现在在 LayerSwitcher.vue 中

import DrawTools from './DrawTools.vue'
import MeasureTools from './MeasureTools.vue'
import SmartCityExplorer from './SmartCityExplorer.vue'
import DistrictNavigation from './DistrictNavigation.vue'
import ObjModels from './ObjModels.vue'
import LayerSwitcher from './LayerSwitcher.vue' // <-- 1. 导入新组件
import useRotation from './hooks/useRotation.js'
import useFly from './hooks/useFly.js'

const { mark, handleRotation } = useRotation()
const { flyMsg, flyTo } = useFly()

// 控制中心相关
let isShow = false
const emit = defineEmits(['toggleCharts'])
function toggleCharts() {
  isShow = !isShow
  emit('toggleCharts', isShow)
}



// 2. 创建一个 ref 来持有 LayerSwitcher 组件实例
const layerSwitcherRef = ref(null)

// 3. 创建一个新的方法，用于调用子组件中暴露的方法
const openLayerDialog = () => {
  if (layerSwitcherRef.value) {
    layerSwitcherRef.value.showLayerDialog() // 调用子组件的 showLayerDialog 方法
  }
}
</script>

<style scoped>
/* 引入iconfont字体图标 */
@import 'https://at.alicdn.com/t/c/font_4072822_j5r3vfaxh8h.css';
@import 'https://at.alicdn.com/t/c/font_4979069_3nn1pwr9dgh.css?spm=a313x.manage_type_myprojects.i1.9.4c9e3a81cPXKeb&file=font_4979069_3nn1pwr9dgh.css';

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 110px;
  z-index: 9;
  background: url('../../assets/images/footer.png') center no-repeat;
  background-size: cover;
}

.btn-groups {
  display: flex;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  padding-top: 30px;
  position: relative;
  top: 5px;
}

.btn-groups .item {
  text-align: center;
  margin: 0 10px;
}

.btn-groups button {
  margin-bottom: 4px;
  width: 40px;
  height: 40px;
  border: none;
  outline: none;
  color: #fff;
  background: linear-gradient(
    to bottom,
    rgba(0, 128, 255, 0.377),
    rgba(0, 128, 255, 0.281)
  );
  border-radius: 50%;
  box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.3);
}

.btn-groups button:hover {
  background: linear-gradient(
    to bottom,
    rgba(0, 128, 255, 1),
    rgba(0, 128, 255, 0.4)
  );
  cursor: pointer;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.btn-groups button img {
  width: 16px;
  height: 16px;
}

</style>