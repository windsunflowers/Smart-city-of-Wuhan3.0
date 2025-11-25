<template>
  <Welcome v-if="!hasEntered" @enter="enterApplication" />
  <template v-else>
    <Header />
    <SmartCity />
    <MapControls />
    <!-- 添加 Camera 组件到左上角 -->
    <Camera />
    <G2Charts v-if="showCharts" />
    <Footer @toggleCharts="handleToggle" />
  </template>
</template>

<script setup>
import { ref } from 'vue'

import Welcome from './components/Welcome.vue'
import Header from './components/Header.vue'
import SmartCity from './components/SmartCity/index.vue'
import MapControls from './components/MapControls.vue'
import Camera from './components/camera.vue'  // 导入 Camera 组件
import G2Charts from './components/G2Charts/index.vue'
import Footer from './components/Footer/index.vue'

// 控制是否已进入应用
const hasEntered = ref(false)

// 控制图表显示
const showCharts = ref(false)

// 处理进入应用
const enterApplication = () => {
  hasEntered.value = true
}

// 处理图表显示切换
const handleToggle = (value) => {
  showCharts.value = value
}
</script>

<style scoped></style>