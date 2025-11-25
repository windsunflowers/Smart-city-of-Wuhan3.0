/*
 * @Description: 3D Tiles 加载工具 (全局 Fetch 劫持方案 - 核弹级修复)
 * @Date: 2025-11-21
 */

// ==========================================
// 1. 全局 Fetch 拦截器逻辑
// ==========================================
const mockRegistry = new Map();
let isFetchPatched = false;

function setupGlobalFetchInterceptor() {
  if (isFetchPatched) return;

  const originalFetch = window.fetch;

  window.fetch = async (input, init) => {
    // 获取请求 URL
    let url;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.href;
    }

    // 检查是否命中 Mock 注册表
    if (url && mockRegistry.has(url)) {
      // console.log('⚡️ 全局 Fetch 拦截命中:', url);
      const blob = mockRegistry.get(url);
      
      // 构造一个假的 Response 对象返回给插件
      return new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 未命中，放行，执行原始请求
    return originalFetch(input, init);
  };

  isFetchPatched = true;
  console.log('✅ 全局 Fetch 拦截器已激活');
}

// ==========================================
// 2. JSON 修复逻辑
// ==========================================
function fixTilesetNode(node, baseUrl) {
  if (!node) return;

  // 修复 content
  if (node.content) {
    const originalPath = node.content.uri || node.content.url;
    if (originalPath) {
      try {
        // 强制转换为 HTTP 绝对路径 (包含中文转义)
        // 插件读取到这个绝对路径后，会直接请求服务器，不走 Mock
        const absoluteUrl = new URL(originalPath, baseUrl).href;
        // 必须解码为中文，否则部分插件可能正则匹配失败
        const rawUrl = decodeURIComponent(absoluteUrl);
        
        node.content.uri = rawUrl;
        node.content.url = rawUrl;
      } catch (e) { }
    } else {
      delete node.content; // 删除空节点
    }
  }

  // 修复外部引用
  if (node.uri || node.url) {
      const nodePath = node.uri || node.url;
      try {
         const absPath = decodeURIComponent(new URL(nodePath, baseUrl).href);
         node.uri = absPath;
         node.url = absPath;
      } catch(e) {}
  }

  // 递归
  if (node.children) {
    node.children.forEach(child => fixTilesetNode(child, baseUrl));
  }
}

// ==========================================
// 3. 主加载函数
// ==========================================
export async function add3DTilesLayer(map, options) {
  const { id, url, maximumScreenSpaceError = 16 } = options;
  const sourceId = `${id}-source`;
  const layerId = `${id}-layer`;

  // 激活核弹级拦截器
  setupGlobalFetchInterceptor();

  console.log('=== 启动 3D Tiles (全局Fetch劫持方案) ===');

  try {
    // 1. 下载原始 JSON
    const response = await fetch(url); // 这个请求会走网络，因为还没注册 Mock
    if (!response.ok) throw new Error(`JSON下载失败: ${response.status}`);
    const tilesetJson = await response.json();
    
    // 2. 补全 asset
    if (!tilesetJson.asset) tilesetJson.asset = { version: '1.0' };

    // 3. 计算真实 Base URL
    const realBasePath = url.substring(0, url.lastIndexOf('/') + 1);

    // 4. 修复内部路径 (全部指向真实服务器)
    if (tilesetJson.root) fixTilesetNode(tilesetJson.root, realBasePath);

    // 5. 生成 Blob
    const blob = new Blob([JSON.stringify(tilesetJson)], { type: 'application/json' });

    // 6. 定义 Mock URL (构造一个完美的 HTTP 地址给插件看)
    // 使用 127.0.0.1 是为了符合 URL 规范，路径中包含 id 避免冲突
    const mockUrl = `http://127.0.0.1/mock/${id}/tileset.json`;

    // 7. 注册到全局拦截器
    mockRegistry.set(mockUrl, blob);
    console.log(`注册拦截: ${mockUrl}`);

    // 8. 清理旧层
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    // 9. 添加源
    map.addSource(sourceId, {
      type: 'batched-model',
      url: mockUrl, // <--- 给插件喂假地址
      maximumScreenSpaceError: maximumScreenSpaceError
    });

    // 10. 添加图层
    map.addLayer({
      id: layerId,
      type: 'model',
      source: sourceId,
      paint: { 'model-opacity': 1.0 }
    });

    return { sourceId, layerId };

  } catch (error) {
    console.error('❌ 加载失败:', error);
    try {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    } catch (e) {}
    throw error;
  }
}

export function remove3DTilesLayer(map, options) {
  const { id } = options;
  const sourceId = `${id}-source`;
  const layerId = `${id}-layer`;
  
  // 清理 Mock 注册表
  const mockUrl = `http://127.0.0.1/mock/${id}/tileset.json`;
  if (mockRegistry.has(mockUrl)) {
    mockRegistry.delete(mockUrl);
  }

  try {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  } catch (error) {
    console.error('移除失败:', error);
  }
}

export default { add3DTilesLayer, remove3DTilesLayer };