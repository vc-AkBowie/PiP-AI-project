/**
 * rotation.js - 獨立 SVG 圖片旋轉與控制點計算模組
 */

// 1. 精準取得內嵌圖片的「世界旋轉中心」與「右上角控制點世界座標」
function getNextLayerWorldInfo(nextLayer, currentBaseSize, viewZoom) {
  const realSize = nextLayer.baseSize * nextLayer.scale;
  
  // 以真實尺寸算真正的中心
  const centerX = nextLayer.x + realSize / 2;
  const centerY = nextLayer.y + realSize / 2;
  
  const rad = (nextLayer.angle || 0) * Math.PI / 180;
  
  // 右上角相對於中心的偏移 ( +realSize/2, -realSize/2 )
  const localX = realSize / 2;
  const localY = -realSize / 2;
  
  const handleX = centerX + (localX * Math.cos(rad) - localY * Math.sin(rad));
  const handleY = centerY + (localX * Math.sin(rad) + localY * Math.cos(rad));

  // 根據目前視角 (zoom) 動態調整圓點大小，使其視覺永遠保持約 8px
  const visualRadius = (8 / viewZoom) * (currentBaseSize / 600);

  return { centerX, centerY, handleX, handleY, visualRadius };
}

// 2. 處理旋轉 MouseDown
function handleRotationStart(e, mousePos, nextLayer, currentBaseSize, viewZoom) {
  const info = getNextLayerWorldInfo(nextLayer, currentBaseSize, viewZoom);
  const dist = Math.hypot(mousePos.x - info.handleX, mousePos.y - info.handleY);

  // 判定是否點中控制點（容錯範圍 2.5 倍半徑）
  if (dist <= info.visualRadius * 2.5 || (e.target && e.target.id === 'rotateHandle')) {
    const mouseAngleDeg = Math.atan2(mousePos.y - info.centerY, mousePos.x - info.centerX) * (180 / Math.PI);
    const startAngleOffset = (nextLayer.angle || 0) - mouseAngleDeg;
    return { isRotating: true, startAngleOffset };
  }
  return { isRotating: false, startAngleOffset: 0 };
}

// 3. 處理旋轉 MouseMove
function handleRotationMove(mousePos, nextLayer, currentBaseSize, viewZoom, startAngleOffset) {
  const info = getNextLayerWorldInfo(nextLayer, currentBaseSize, viewZoom);
  const mouseAngleDeg = Math.atan2(mousePos.y - info.centerY, mousePos.x - info.centerX) * (180 / Math.PI);
  nextLayer.angle = mouseAngleDeg + startAngleOffset;
}