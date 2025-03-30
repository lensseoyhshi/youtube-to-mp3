// background.js - Handle background tasks and API requests

// Global variables
const apiBaseUrl = "https://server.youtube-to-mp3.net"; // Local development URL, should be changed to actual API address when deployed

// 监听来自popup.js或content.js的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 根据消息类型执行不同操作
  switch (request.action) {
    case 'convert':
      handleConvert(request.url, sendResponse);
      return true; // 保持消息通道开放，以便异步响应
    
    case 'checkStatus':
      checkStatus(request.fileId, sendResponse);
      return true;
    
    case 'download':
      handleDownload(request.url, request.downloadUrl, request.title, sendResponse);
      return true;
    
    default:
      sendResponse({ success: false, error: '未知操作' });
  }
});

// Handle video conversion request
function handleConversion(videoUrl, cookies, sendResponse) {
  // Get YouTube page cookies
  getCookies(cookies)
    .then(cookieHeader => {
      // Call conversion API
      return fetch(`${apiBaseUrl}/api/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader
        },
        body: JSON.stringify({
          url: videoUrl
        })
      });
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.success) {
        throw new Error(data.error || 'Conversion failed');
      }
      
      // Return successful response
      sendResponse({
        success: true,
        conversionId: data.conversionId,
        title: data.title
      });
    })
    .catch(error => {
      console.error('Conversion failed:', error);
      sendResponse({
        success: false,
        error: error.message || 'Conversion failed'
      });
    });
}

// Check conversion status
function checkConversionStatus(conversionId, cookies, sendResponse) {
  getCookies(cookies)
    .then(cookieHeader => {
      return fetch(`${apiBaseUrl}/api/status/${conversionId}`, {
        headers: {
          'Cookie': cookieHeader
        }
      });
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to get status');
      }
      
      // Return status information
      sendResponse({
        success: true,
        status: data.status,
        progress: data.progress,
        title: data.title
      });
    })
    .catch(error => {
      console.error('Failed to get status:', error);
      sendResponse({
        success: false,
        error: error.message || 'Failed to get status'
      });
    });
}

// 处理下载请求
async function handleDownload(url, downloadUrl, title, sendResponse) {
  try {
    // 获取YouTube页面的cookies
    const cookies = await getCookies();
    
    // 调用下载API
    // 构建带参数的URL
    const params = new URLSearchParams();
    params.append('url', url);
    params.append('cookie', cookies);
    
    const response = await fetch(`${apiBaseUrl}${downloadUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'audio/mpeg, application/octet-stream'
      }
    });
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }
    
    // 获取blob数据
    const blob = await response.blob();
    
    // 创建下载链接
    const downloadLink = URL.createObjectURL(blob);
    
    // 使用chrome.downloads API下载文件
    chrome.downloads.download({
      url: downloadLink,
      filename: `${title || 'youtube-audio'}.mp3`,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message
        });
      } else {
        sendResponse({
          success: true,
          downloadId: downloadId
        });
      }
      
      // 释放URL对象
      URL.revokeObjectURL(downloadLink);
    });
  } catch (error) {
    console.error('下载失败:', error);
    sendResponse({
      success: false,
      error: error.message || '下载失败'
    });
  }
}

// 获取YouTube页面的cookies
async function getCookies() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: '.youtube.com' });
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  } catch (error) {
    console.error('获取cookie失败:', error);
    return '';
  }
}