<template>
  <header class="header">智慧城市系统-武汉</header>
</template>

<script setup></script>

<style>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  box-sizing: border-box;
  line-height: 0.85;
  padding-top: 20px;
  font-size: 48px;               /* 再大一点 */
  font-family: 'Orbitron', 'Rajdhani', sans-serif; /* 免费赛博字体 */
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: url('../assets/images/header.png') center/cover no-repeat;
  color: #fff;
  text-align: center;
  z-index: 999;

  /* 核心酷炫效果 */
  text-shadow:
    0 0 5px #fff,
    0 0 10px #fff,
    0 0 20px #0ff,
    0 0 40px #0ff,
    0 0 80px #0ff;

  animation: glow 2s ease-in-out infinite alternate;
}

/* 呼吸灯 */
@keyframes glow {
  from {
    text-shadow:
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px #0ff,
      0 0 40px #0ff;
  }
  to {
    text-shadow:
      0 0 10px #fff,
      0 0 20px #0ff,
      0 0 30px #0ff,
      0 0 50px #0ff,
      0 0 90px #0ff;
  }
}
</style>
