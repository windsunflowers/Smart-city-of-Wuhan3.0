import { computed, inject, ref, onMounted } from 'vue' // 1. 引入 onMounted

export default () => {
  const { map } = inject('$scene_map')

  // 保持默认为 false。
  // 这样当 onMounted 自动调用 flyTo 时，它会由 false 变为 true，从而触发进入武汉视角的逻辑。
  const isCityView = ref(false)

  const flyMsg = computed(() => {
    return isCityView.value ? '俯视视角' : '全局视角'
  })

  function flyTo() {
    isCityView.value = !isCityView.value

    // 建议加上 map 是否存在的判断，防止地图未加载报错
    if (!map) return 

    if (isCityView.value) {
      // 俯视城市视角 (武汉)
      map.flyTo({
        center: [114.29, 30.54],
        zoom: 12,
        pitch: 0,
        bearing: 0,
        duration: 2000
      })
    } else {
      // 全局视角
      map.flyTo({
        center: [114.29, 30.54],
        zoom: 1,
        pitch: 0,
        bearing: 0,
        duration: 2000
      })
    }
  }

  // 2. 核心修改：一开始加载就自动触发
  onMounted(() => {
    // 设置一个短暂延迟，确保 Mapbox/Cesium 地图实例已经完全初始化
    setTimeout(() => {
      flyTo()
    },5000)
  })

  return {
    flyMsg,
    flyTo,
  }
}