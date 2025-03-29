// content.js - 在YouTube页面上运行，获取视频信息

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getVideoInfo') {
    try {
      // 获取视频信息
      const videoInfo = extractVideoInfo();
      if (videoInfo) {
        sendResponse({success: true, data: videoInfo});
      } else {
        sendResponse({success: false, error: '无法从页面获取视频信息'});
      }
    } catch (error) {
      console.error('获取视频信息时出错:', error);
      sendResponse({success: false, error: '获取视频信息时出错'});
    }
    return true; // 保持消息通道开放，以便异步响应
  }
});

// 从YouTube页面提取视频信息
function extractVideoInfo() {
  // 检查是否在YouTube视频页面
  if (!window.location.href.includes('youtube.com/watch')) {
    return null;
  }
  
  try {
    // 获取视频标题
    const title = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer')?.textContent.trim() ||
                 document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent.trim() ||
                 document.title.replace(' - YouTube', '');
    
    // 获取视频作者
    const author = document.querySelector('#owner #channel-name')?.textContent.trim() ||
                   document.querySelector('#owner-name a')?.textContent.trim() ||
                   'Unknown';
    
    // 获取视频缩略图
    const videoId = new URLSearchParams(window.location.search).get('v');
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    
    // 获取视频时长
    let duration = 0;
    const durationElement = document.querySelector('.ytp-time-duration');
    if (durationElement) {
      const durationText = durationElement.textContent;
      const durationParts = durationText.split(':').map(part => parseInt(part, 10));
      
      if (durationParts.length === 3) { // 小时:分钟:秒
        duration = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];
      } else if (durationParts.length === 2) { // 分钟:秒
        duration = durationParts[0] * 60 + durationParts[1];
      }
    }
    
    // 返回视频信息
    return {
      title: title,
      author: author,
      thumbnail: thumbnail,
      duration: duration,
      url: window.location.href,
      videoId: videoId
    };
  } catch (error) {
    console.error('提取视频信息时出错:', error);
    return null;
  }
}

// 页面加载完成后，检查是否有视频信息
document.addEventListener('DOMContentLoaded', function() {
  // 这里可以添加页面加载完成后的初始化代码
  console.log('YouTube音频提取器已在页面上激活');
});