import { computed, inject, ref } from 'vue'

export default () => {
  const { map } = inject('$scene_map')

  const isCityView = ref(false)

  const flyMsg = computed(() => {
    return isCityView.value ? '俯视视角' : '全局视角'
  })

  function flyTo() {
    isCityView.value = !isCityView.value

    if (isCityView.value) {
      // 俯视城市视角
      map.flyTo({
        center: [114.3, 30.5],
        zoom: 12,      // 较高的缩放级别
        pitch: 0,      // 完全俯视
        bearing: 0,    // 正北朝上
        duration: 2000 // 动画持续时间(毫秒)
      })
    } else {
      // 全局视角
      map.flyTo({
        center: [114.3, 30.5],
        zoom: 1,       // 较低的缩放级别
        pitch: 0,      // 保持俯视
        bearing: 0,    // 正北朝上
        duration: 2000
      })
    }
  }

  return {
    flyMsg,
    flyTo,
  }
}