// background.js - 处理API请求和下载功能

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getVideoInfo') {
    // 获取视频信息
    getVideoInfo(request.videoId)
      .then(data => {
        sendResponse({success: true, data: data});
      })
      .catch(error => {
        console.error('获取视频信息失败:', error);
        sendResponse({success: false, error: '获取视频信息失败: ' + error.message});
      });
    return true; // 保持消息通道开放，以便异步响应
  }
  
  else if (request.action === 'prepareAudioConversion') {
    // 准备音频转换
    prepareAudioConversion(request.videoId)
      .then(() => {
        sendResponse({success: true});
      })
      .catch(error => {
        console.error('准备音频转换失败:', error);
        sendResponse({success: false, error: '准备音频转换失败: ' + error.message});
      });
    return true; // 保持消息通道开放，以便异步响应
  }
  
  else if (request.action === 'downloadAudio') {
    // 下载音频
    downloadAudio(request.videoId, request.title)
      .then(() => {
        sendResponse({success: true});
      })
      .catch(error => {
        console.error('下载音频失败:', error);
        sendResponse({success: false, error: '下载音频失败: ' + error.message});
      });
    return true; // 保持消息通道开放，以便异步响应
  }
});

// 从YouTube API获取视频信息
async function getVideoInfo(videoId) {
  try {
    // 这里应该使用YouTube Data API获取视频信息
    // 由于API需要密钥，这里使用一个简化的方法
    
    // 构建一个基本的视频信息对象
    // 在实际应用中，这里应该调用YouTube API
    const videoInfo = {
      title: '视频 ' + videoId,
      author: 'YouTube创作者',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: 180, // 假设视频长度为3分钟
      url: `https://www.youtube.com/watch?v=${videoId}`,
      videoId: videoId
    };
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return videoInfo;
  } catch (error) {
    console.error('获取视频信息时出错:', error);
    throw new Error('无法获取视频信息');
  }
}

// 准备音频转换
async function prepareAudioConversion(videoId) {
  try {
    // 这里应该调用后端服务来准备音频转换
    // 由于这是一个前端扩展，我们只模拟这个过程
    
    // 模拟准备过程的延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 在实际应用中，这里应该与后端服务通信
    // 例如，发送请求到自己的服务器，让服务器准备音频转换
    
    return true;
  } catch (error) {
    console.error('准备音频转换时出错:', error);
    throw new Error('无法准备音频转换');
  }
}

// 下载音频
async function downloadAudio(videoId, title) {
  try {
    // 格式化文件名
    const fileName = (title || 'audio').replace(/[\\/:*?"<>|]/g, '_') + '.mp3';
    
    // 使用我们的网站API进行实际转换
    const apiUrl = 'https://www.youtube-to-mp3.net/api/convert';
    
    // 首先发送转换请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `https://youtube.com/watch?v=${videoId}` })
    });
    
    if (!response.ok) {
      throw new Error('服务器响应错误: ' + response.status);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || '转换失败');
    }
    
    // 轮询检查转换状态
    let statusUrl = `https://www.youtube-to-mp3.net/api/status/${data.fileId}`;
    let statusData;
    let attempts = 0;
    const maxAttempts = 30; // 最多尝试30次，每次间隔2秒
    
    while (attempts < maxAttempts) {
      attempts++;
      
      const statusResponse = await fetch(statusUrl);
      if (!statusResponse.ok) {
        throw new Error('获取状态失败');
      }
      
      statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        break;
      } else if (statusData.status === 'failed') {
        throw new Error('音频转换失败');
      }
      
      // 等待2秒再次检查
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('转换超时');
    }
    
    // 修改：直接使用完整的下载URL，不拼接域名
    const downloadUrl = statusData.downloadUrl.startsWith('http') 
      ? statusData.downloadUrl 
      : `https://www.youtube-to-mp3.net${statusData.downloadUrl}`;
    
    // 修改：先尝试通过fetch获取文件内容，然后创建blob URL下载
    const fileResponse = await fetch(downloadUrl);
    if (!fileResponse.ok) {
      throw new Error('获取文件失败: ' + fileResponse.status);
    }
    
    const blob = await fileResponse.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: blobUrl,
      filename: fileName,
      saveAs: true
    }, (downloadId) => {
      // 下载完成后释放blob URL
      if (chrome.runtime.lastError) {
        console.error('下载错误:', chrome.runtime.lastError);
      } else {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000); // 1分钟后释放
      }
    });
    
    return true;
  } catch (error) {
    console.error('下载音频时出错:', error);
    throw new Error('无法下载音频: ' + error.message);
  }
}