import { computed, inject, ref } from 'vue'

export default () => {
  const moving = ref(true)
  const { map } = inject('$scene_map') // map是一个mapbox的实例

  // 定义动画函数(循环)
  function rotation() {
    const zoom = map.getZoom()
    if (zoom < 5) {
      // 在地球视角下, 才开始旋转
      let center = map.getCenter()
      center.lng += 10
      map.easeTo({ center: center, duration: 1000, easing: (n) => n })
    }
  }

  rotation() // 调用动画函数
  map.on('moveend', () => {
    if (moving.value) {
      rotation() // 地图移动结束后, 调用动画函数
    }
  })

  function handleRotation() {
    moving.value = !moving.value
    if (!moving.value) {
      map.stop() // 停止动画
    } else {
      rotation() // 开始动画
    }
  }

  const mark = computed(() => {
    return moving.value ? '停止自转' : '开启自转'
  })

  return {
    mark,
    handleRotation,
  }
}
