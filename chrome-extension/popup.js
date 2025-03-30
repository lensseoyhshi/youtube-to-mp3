// 全局变量
let currentVideoUrl = '';
let convertInProgress = false;
let fileId = null;
let statusCheckInterval = null;

// DOM元素
const apiBaseUrl = "https://server.youtube-to-mp3.net";// 本地开发环境URL，上线时需要修改为实际API地址
const currentUrlElement = document.getElementById('currentUrl');
const convertBtn = document.getElementById('convertBtn');
// const copyUrlBtn = document.getElementById('copyUrlBtn');
const statusContainer = document.getElementById('statusContainer');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const errorContainer = document.getElementById('errorContainer');
const downloadContainer = document.getElementById('downloadContainer');
const downloadTitle = document.getElementById('downloadTitle');
const downloadBtn = document.getElementById('downloadBtn');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 获取当前标签页信息
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  if (currentTab && currentTab.url && isYouTubeUrl(currentTab.url)) {
    currentVideoUrl = currentTab.url;
    currentUrlElement.textContent = currentTab.url;
    convertBtn.disabled = false;
  } else {
    currentUrlElement.textContent = '当前页面不是YouTube视频页面';
    convertBtn.disabled = true;
  }
  
  // 添加事件监听器
  convertBtn.addEventListener('click', handleConvert);
  // copyUrlBtn.addEventListener('click', handleCopyUrl);
  downloadBtn.addEventListener('click', handleDownload);
});

// 检查是否是YouTube URL
function isYouTubeUrl(url) {
  return url.match(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/);
}

// 处理转换按钮点击
async function handleConvert() {
  if (convertInProgress) return;
  
  resetUI();
  convertInProgress = true;
  convertBtn.disabled = true;
  statusContainer.style.display = 'block';
  
  try {
    // 获取当前页面的cookie
    const cookies = await getCookies();
    
    // 调用转换API
    const response = await fetch(`${apiBaseUrl}/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: currentVideoUrl })
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || '转换失败');
    }
    
    fileId = data.fileId;
    
    // 开始轮询状态
    updateProgress(10);
    startStatusPolling(fileId);
  } catch (error) {
    handleError(error.message);
  }
}

// 开始轮询状态
function startStatusPolling(fileId) {
  let progress = 10;
  
  statusCheckInterval = setInterval(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/status/${fileId}`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '转换失败');
      }
      
      if (data.status === 'pending' || data.status === 'processing') {
        // 更新进度
        progress = Math.min(progress + 10, 90);
        updateProgress(progress);
        statusText.textContent = '正在转换...';
      } else if (data.status === 'completed') {
        // 转换完成
        clearInterval(statusCheckInterval);
        updateProgress(100);
        statusText.textContent = '转换完成！';
        
        // 显示下载信息
        showDownloadInfo(data.title, data.downloadUrl);
      } else if (data.status === 'failed') {
        throw new Error('转换失败');
      }
    } catch (error) {
      clearInterval(statusCheckInterval);
      handleError(error.message);
    }
  }, 2000); // 每2秒检查一次
}

// 处理下载按钮点击
async function handleDownload() {
  try {
    const downloadUrl = downloadBtn.getAttribute('data-url');
    if (!downloadUrl) {
      throw new Error('Url not found');
    }
    
    // 获取当前页面的cookie
    const cookies = await getCookies();
    
    // 调用下载API
    // 构建带参数的URL
    const params = new URLSearchParams();
    params.append('url', currentVideoUrl);
    params.append('cookie', cookies);
    
    const response = await fetch(`${apiBaseUrl}${downloadUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'audio/mpeg, application/octet-stream'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Download Error ${response.status}`);
    }
    
    // 创建Blob并下载
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${downloadTitle.textContent || 'youtube-audio'}.mp3`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    handleError(error.message);
  }
}

// 处理复制链接按钮点击
function handleCopyUrl() {
  navigator.clipboard.writeText(currentVideoUrl)
    .then(() => {
      copyUrlBtn.textContent = '已复制';
      setTimeout(() => {
        copyUrlBtn.textContent = '复制链接';
      }, 2000);
    })
    .catch(error => {
      handleError('复制链接失败');
    });
}

// 获取YouTube页面的cookies
async function getCookies() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: '.youtube.com' });
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  } catch (error) {
    console.error('Get Cookie Failure', error);
    return '';
  }
}

// 更新进度条
function updateProgress(value) {
  progressBar.style.width = `${value}%`;
}

// 显示下载信息
function showDownloadInfo(title, downloadUrl) {
  downloadTitle.textContent = title || 'YouTube MP3';
  downloadBtn.setAttribute('data-url', downloadUrl);
  downloadContainer.style.display = 'block';
}

// 处理错误
function handleError(message) {
  convertInProgress = false;
  convertBtn.disabled = false;
  statusContainer.style.display = 'none';
  errorContainer.style.display = 'block';
  errorContainer.textContent = `Error ${message}`;
}

// 重置UI
function resetUI() {
  errorContainer.style.display = 'none';
  errorContainer.textContent = '';
  downloadContainer.style.display = 'none';
  statusText.textContent = 'Converting...';
  updateProgress(0);
  
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
  }
}
