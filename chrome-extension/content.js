// content.js - 在YouTube页面上添加功能按钮

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否是YouTube视频页面
  if (isYouTubeVideoPage()) {
    // 添加转换按钮
    addConvertButton();
  }
});

// 监听页面变化，处理YouTube的SPA导航
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // 检查新页面是否是视频页面
    if (isYouTubeVideoPage()) {
      // 延迟添加按钮，确保YouTube UI已加载
      setTimeout(() => {
        addConvertButton();
      }, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });

// 检查是否是YouTube视频页面
function isYouTubeVideoPage() {
  return location.href.match(/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/);
}

// 添加转换按钮到YouTube界面
function addConvertButton() {
  // 检查按钮是否已存在
  if (document.getElementById('yt-to-mp3-btn')) {
    return;
  }
  
  // 查找YouTube的菜单区域
  const menuContainer = document.querySelector('#top-level-buttons-computed');
  
  if (!menuContainer) {
    console.error('无法找到YouTube菜单容器');
    return;
  }
  
  // 创建转换按钮
  const convertButton = document.createElement('button');
  convertButton.id = 'yt-to-mp3-btn';
  convertButton.className = 'yt-spec-button-shape-next';
  convertButton.innerHTML = `
    <div class="yt-spec-button-shape-next__icon">
      <svg height="24" viewBox="0 0 24 24" width="24">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path>
      </svg>
    </div>
    <div class="yt-spec-button-shape-next__button-text-content">
      <span>转换为MP3</span>
    </div>
  `;
  
  // 设置按钮样式
  convertButton.style.display = 'flex';
  convertButton.style.alignItems = 'center';
  convertButton.style.padding = '0 16px';
  convertButton.style.marginLeft = '8px';
  convertButton.style.backgroundColor = '#ff0000';
  convertButton.style.color = 'white';
  convertButton.style.border = 'none';
  convertButton.style.borderRadius = '18px';
  convertButton.style.cursor = 'pointer';
  convertButton.style.height = '36px';
  
  // 添加点击事件
  convertButton.addEventListener('click', handleConvertClick);
  
  // 添加按钮到菜单
  menuContainer.appendChild(convertButton);
}

// 处理转换按钮点击
function handleConvertClick() {
  // 获取当前视频URL
  const videoUrl = window.location.href;
  
  // 发送消息到background.js
  chrome.runtime.sendMessage(
    { action: 'convert', url: videoUrl },
    (response) => {
      if (response && response.success) {
        // 转换请求成功，显示通知
        showNotification('转换已开始', '请稍候，您可以在扩展弹窗中查看进度');
        
        // 开始轮询状态
        pollStatus(response.fileId);
      } else {
        // 转换请求失败，显示错误
        showNotification('转换失败', response?.error || '未知错误');
      }
    }
  );
}

// 轮询转换状态
function pollStatus(fileId) {
  const statusInterval = setInterval(() => {
    chrome.runtime.sendMessage(
      { action: 'checkStatus', fileId: fileId },
      (response) => {
        if (!response || !response.success) {
          clearInterval(statusInterval);
          showNotification('状态检查失败', response?.error || '未知错误');
          return;
        }
        
        if (response.status === 'completed') {
          clearInterval(statusInterval);
          showNotification(
            '转换完成', 
            `"${response.title}" 已准备好下载`,
            () => {
              // 点击通知时下载文件
              chrome.runtime.sendMessage({
                action: 'download',
                url: window.location.href,
                downloadUrl: response.downloadUrl,
                title: response.title
              });
            }
          );
        } else if (response.status === 'failed') {
          clearInterval(statusInterval);
          showNotification('转换失败', '处理视频时出错');
        }
        // 对于pending和processing状态，继续轮询
      }
    );
  }, 5000); // 每5秒检查一次
  
  // 60秒后停止轮询，避免无限轮询
  setTimeout(() => {
    clearInterval(statusInterval);
  }, 60000);
}

// 显示通知
function showNotification(title, message, onClick) {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = 'yt-to-mp3-notification';
  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
  `;
  
  // 设置样式
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#fff';
  notification.style.color = '#333';
  notification.style.padding = '15px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '9999';
  notification.style.minWidth = '250px';
  notification.style.maxWidth = '350px';
  notification.style.transition = 'opacity 0.3s';
  
  // 添加点击事件
  if (onClick) {
    notification.style.cursor = 'pointer';
    notification.addEventListener('click', onClick);
  }
  
  // 添加到页面
  document.body.appendChild(notification);
  
  // 5秒后自动关闭
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}