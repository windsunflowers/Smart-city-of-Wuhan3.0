<!-- <template>
  <div class="welcome-container" :class="{ 'fade-out': isExiting }">
    <!-- 浩瀚宇宙风格背景 -->
    <div class="cyber-background">
      <div class="grid"></div>
      <div class="stars"></div>
      <div class="glow"></div>
      <!-- 流星效果 -->
      <div class="meteors">
        <div class="meteor meteor1"></div>
        <div class="meteor meteor2"></div>
        <div class="meteor meteor3"></div>
        <div class="meteor meteor4"></div>
        <div class="meteor meteor5"></div>
      </div>
      <!-- 行星效果 -->
      <div class="planet"></div>
    </div>
    
    <!-- 武汉标志性建筑全景剪影 -->
    <div class="wuhan-skyline">
      <div class="building huanghelou"></div>
      <div class="building yangtze-bridge"></div>
      <div class="building optical-valley"></div>
    </div>
    
    <!-- 内容容器 -->
    <div class="content">
      <!-- 标题区域 -->
      <div class="header-section">
        <h1 class="main-title">智慧武汉</h1>
        <h2 class="sub-title">SMART WUHAN</h2>
        
        <!-- 武汉特色标语 -->
        <div class="wuhan-taglines">
          <div class="tagline">九省通衢</div>
          <div class="tagline">大武汉</div>
          <div class="tagline">江城</div>
        </div>
      </div>
      
      <div class="description">
        探索城市数字孪生 · 感受科技改变生活
      </div>

      <!-- 城市数据统计 - 重新排版为赛博风格 -->
      <div class="city-stats">
        <div class="stat-item">
          <div class="stat-value">890<span class="unit">万+</span></div>
          <div class="stat-label">城市人口</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">8494<span class="unit">km²</span></div>
          <div class="stat-label">城市面积</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">13<span class="unit">区</span></div>
          <div class="stat-label">行政区划</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">1500<span class="unit">年+</span></div>
          <div class="stat-label">城市历史</div>
        </div>
      </div>
      
      <!-- 武汉特色介绍 -->
      <div class="wuhan-features">
        <div class="feature">
          <div class="feature-icon river"></div>
          <div class="feature-text">长江 · 汉江交汇</div>
        </div>
        <div class="feature">
          <div class="feature-icon university"></div>
          <div class="feature-text">中国教育名城</div>
        </div>
        <div class="feature">
          <div class="feature-icon tech"></div>
          <div class="feature-text">光谷科技创新中心</div>
        </div>
      </div>

      <button class="explore-btn" @click="startExplore">
        <div class="btn-glitch-effect"></div>
        <span class="btn-text">开始探索</span>
        <span class="btn-icon">→</span>
      </button>
    </div>

    <!-- 底部信息 -->
    <div class="footer-info">
      <p>Wind</p>
    </div>
    
    <!-- 装饰元素 -->
    <div class="corner-decoration top-left"></div>
    <div class="corner-decoration top-right"></div>
    <div class="corner-decoration bottom-left"></div>
    <div class="corner-decoration bottom-right"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 动画相关状态
const isExiting = ref(false);

// 处理开始探索按钮点击事件
const startExplore = () => {
  isExiting.value = true;
  
  // 延迟进入主页面，等待动画完成
  setTimeout(() => {
    // 通过事件通知父组件切换显示
    emit('enter');
  }, 1000);
};

// 发射事件
const emit = defineEmits(['enter']);
</script>

<style scoped>
.welcome-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 1000;
  transition: opacity 1s ease, transform 1s ease;
  color: #fff;
  font-family: 'Arial', sans-serif;
}

.welcome-container.fade-out {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

/* 浩瀚宇宙风格背景 */
.cyber-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -3;
  background: linear-gradient(135deg, #000000 0%, #050a18 75%, #000000 100%);
  overflow: hidden;
}

/* 网格效果 */
.grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  background-image: 
    linear-gradient(rgba(64, 224, 208, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 224, 208, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(500px) rotateX(60deg);
  transform-origin: top;
  animation: grid-move 20s linear infinite;
  z-index: -2;
}

/* 星空效果 */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(1px 1px at 20px 30px, #eef, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 160px 120px, #ddf, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.5;
  z-index: -1;
  animation: stars-move 100s linear infinite;
}

/* 流星效果 */
.meteors {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.meteor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 2px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%, rgba(70, 180, 255, 1));
  transform: rotate(-45deg);
  opacity: 0;
  animation: meteor-move 10s linear infinite;
  box-shadow: 0 0 5px #fff;
}

.meteor1 {
  top: 10%;
  left: 20%;
  animation-delay: 0s;
}

.meteor2 {
  top: 15%;
  left: 60%;
  animation-delay: 2s;
}

.meteor3 {
  top: 35%;
  left: 30%;
  animation-delay: 5s;
}

.meteor4 {
  top: 45%;
  left: 70%;
  animation-delay: 7s;
}

.meteor5 {
  top: 55%;
  left: 40%;
  animation-delay: 9s;
}

/* 行星效果 */
.planet {
  position: absolute;
  top: 80px;
  right: 100px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #3060a0, #102040);
  box-shadow: 0 0 40px rgba(50, 100, 200, 0.5);
  opacity: 0.5;
  z-index: -2;
}

.planet::before {
  content: "";
  position: absolute;
  width: 180px;
  height: 30px;
  background: rgba(70, 130, 220, 0.2);
  top: 60px;
  left: -15px;
  border-radius: 50%;
  transform: rotate(-15deg);
}

/* 发光效果 */
.glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(10, 30, 70, 0.2) 0%, rgba(0, 0, 10, 0.3) 70%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
  z-index: -1;
}

/* 内容区域 */
.content {
  position: relative;
  width: 85%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  z-index: 2;
  background: rgba(0, 10, 30, 0.5);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 10px;
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.15),
              inset 0 0 30px rgba(0, 200, 255, 0.05);
  backdrop-filter: blur(10px);
}

/* 标题区域 */
.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 4.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(90deg, #00f2fe, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 242, 254, 0.5);
  letter-spacing: 5px;
  position: relative;
}

.sub-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0.5rem 0;
  color: #80e5ff;
  letter-spacing: 8px;
}

/* 武汉特色标语 */
.wuhan-taglines {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 15px;
}

.tagline {
  font-size: 1.2rem;
  font-weight: 600;
  color: #00f2fe;
  text-shadow: 0 0 10px rgba(0, 242, 254, 0.7);
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 5px 15px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.tagline::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 242, 254, 0.2), transparent);
  animation: tagline-shine 3s infinite;
  animation-delay: calc(var(--i) * 1s);
}

.tagline:nth-child(1) { --i: 0; }
.tagline:nth-child(2) { --i: 1; }
.tagline:nth-child(3) { --i: 2; }

.description {
  font-size: 1.2rem;
  margin: 1.5rem 0;
  color: #b0e0e6;
  text-align: center;
  max-width: 600px;
  letter-spacing: 1px;
}

/* 城市数据统计 - 赛博风格 */
.city-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 800px;
  margin: 2rem 0;
  padding: 20px;
  background: rgba(0, 20, 50, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 5px;
  position: relative;
}

.city-stats::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00f2fe, transparent, #00f2fe, transparent);
  background-size: 400% 400%;
  animation: border-light 6s ease infinite;
  z-index: -1;
  border-radius: 7px;
}

.stat-item {
  text-align: center;
  padding: 0 10px;
  position: relative;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #00f2fe;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.unit {
  font-size: 1.2rem;
  font-weight: 400;
}

.stat-label {
  font-size: 1rem;
  color: #b0e0e6;
}

/* 武汉特色介绍 */
.wuhan-features {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin: 1.5rem 0;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 15px;
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 10px;
  background-color: rgba(0, 200, 255, 0.2);
  border: 1px solid rgba(0, 242, 254, 0.5);
  position: relative;
  overflow: hidden;
}

.feature-icon::before {
  content: '';
  position: absolute;
  width: 150%;
  height: 150%;
  background: conic-gradient(
    rgba(0, 242, 254, 0.5),
    transparent,
    transparent,
    transparent
  );
  animation: rotate 4s linear infinite;
}

.river::after {
  content: '江';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00f2fe;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.8);
}

.university::after {
  content: '学';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00f2fe;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.8);
}

.tech::after {
  content: '谷';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00f2fe;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.8);
}

.feature-text {
  font-size: 1rem;
  color: #b0e0e6;
  text-align: center;
}

/* 探索按钮 - 赛博风格 */
.explore-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 3rem;
  margin: 2rem 0 1rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(90deg, #0a1029, #001845);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.5), 
              inset 0 0 10px rgba(0, 242, 254, 0.2);
}

.explore-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, 
    transparent, 
    rgba(0, 242, 254, 0.1), 
    transparent
  );
  transform: translateX(-100%);
  transition: 0.5s;
}

.explore-btn:hover::before {
  transform: translateX(100%);
}

.explore-btn::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  z-index: -1;
  background: linear-gradient(45deg, #00f2fe, #0072ff, #00f2fe);
  background-size: 400%;
  border-radius: 7px;
  animation: border-light 6s ease infinite;
}

.btn-glitch-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    rgba(0, 242, 254, 0.1) 0px,
    rgba(0, 242, 254, 0.1) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.explore-btn:hover .btn-glitch-effect {
  opacity: 1;
  animation: glitch 0.3s infinite;
}

.btn-text {
  position: relative;
  z-index: 2;
  transition: letter-spacing 0.3s;
}

.explore-btn:hover .btn-text {
  letter-spacing: 2px;
}

.btn-icon {
  margin-left: 10px;
  position: relative;
  z-index: 2;
  transition: transform 0.3s;
}

.explore-btn:hover .btn-icon {
  transform: translateX(5px);
}

/* 武汉天际线 */
.wuhan-skyline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  z-index: 1;
}

.building {
  position: absolute;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
  border-top: 1px solid rgba(0, 242, 254, 0.5);
}

.huanghelou {
  left: 20%;
  width: 40px;
  height: 120px;
  clip-path: polygon(
    0 100%, 100% 100%, 100% 40%, 
    80% 40%, 80% 20%, 100% 20%, 
    100% 10%, 50% 0, 0 10%, 
    0 20%, 20% 20%, 20% 40%, 0 40%
  );
}

.yangtze-bridge {
  left: 35%;
  width: 30%;
  height: 60px;
  clip-path: polygon(
    0 60%, 10% 60%, 10% 20%, 20% 0, 
    30% 20%, 70% 20%, 80% 0, 90% 20%, 
    90% 60%, 100% 60%, 100% 100%, 0 100%
  );
}

.optical-valley {
  right: 20%;
  width: 120px;
  height: 100px;
  clip-path: polygon(
    0 100%, 20% 100%, 20% 50%, 
    40% 50%, 40% 30%, 60% 30%, 
    60% 10%, 80% 10%, 80% 60%, 
    100% 60%, 100% 100%
  );
}

/* 装饰元素 */
.corner-decoration {
  position: absolute;
  width: 50px;
  height: 50px;
  border-style: solid;
  border-color: rgba(0, 242, 254, 0.5);
  z-index: 3;
}

.top-left {
  top: 20px;
  left: 20px;
  border-width: 3px 0 0 3px;
  border-radius: 10px 0 0 0;
}

.top-right {
  top: 20px;
  right: 20px;
  border-width: 3px 3px 0 0;
  border-radius: 0 10px 0 0;
}

.bottom-left {
  bottom: 20px;
  left: 20px;
  border-width: 0 0 3px 3px;
  border-radius: 0 0 0 10px;
}

.bottom-right {
  bottom: 20px;
  right: 20px;
  border-width: 0 3px 3px 0;
  border-radius: 0 0 10px 0;
}

/* 底部信息 */
.footer-info {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
  color: #b0e0e6;
  opacity: 0.7;
  z-index: 3;
}

/* 动画定义 */
@keyframes grid-move {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(40px);
  }
}

@keyframes stars-move {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 200px 200px;
  }
}

@keyframes border-light {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes tagline-shine {
  0% { left: -100%; }
  40% { left: 100%; }
  100% { left: 100%; }
}

@keyframes glitch {
  0% { opacity: 0.3; }
  50% { opacity: 0.1; }
  100% { opacity: 0.3; }
}

@keyframes meteor-move {
  0% {
    transform: translateX(-100px) translateY(0) rotate(-45deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  20% {
    transform: translateX(calc(100vw + 100px)) translateY(calc(100vh)) rotate(-45deg);
    opacity: 0;
  }
  100% {
    transform: translateX(calc(100vw + 100px)) translateY(calc(100vh)) rotate(-45deg);
    opacity: 0;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.8rem;
    letter-spacing: 3px;
  }
  
  .sub-title {
    font-size: 1rem;
    letter-spacing: 5px;
  }
  
  .wuhan-taglines {
    flex-direction: column;
    gap: 10px;
  }
  
  .description {
    font-size: 1rem;
  }
  
  .city-stats {
    flex-wrap: wrap;
    padding: 10px;
  }
  
  .stat-item {
    width: 50%;
    margin-bottom: 1rem;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
  
  .wuhan-features {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
}
</style>  -->