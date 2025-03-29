// popup.js - 处理扩展弹出窗口的交互逻辑

document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const urlInput = document.getElementById('url-input');
  const extractBtn = document.getElementById('extract-btn');
  const autoExtractCheckbox = document.getElementById('auto-extract-checkbox');
  const progressContainer = document.getElementById('progress-container');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const errorContainer = document.getElementById('error-container');
  const audioInfo = document.getElementById('audio-info');
  const thumbnail = document.getElementById('thumbnail');
  const audioTitle = document.getElementById('audio-title');
  const audioDuration = document.getElementById('audio-duration');
  const downloadBtn = document.getElementById('download-btn');
  
  // 初始状态
  let currentVideoId = null;
  let audioData = null;
  
  // 检查当前标签页是否是YouTube视频
  function checkCurrentTab() {
    if (autoExtractCheckbox.checked) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        if (currentTab && currentTab.url && currentTab.url.includes('youtube.com/watch')) {
          urlInput.value = currentTab.url;
          extractAudio();
        }
      });
    }
  }
  
  // 从URL中提取YouTube视频ID
  function extractVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }
  
  // 显示错误信息
  function showError(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    progressContainer.style.display = 'none';
  }
  
  // 隐藏错误信息
  function hideError() {
    errorContainer.style.display = 'none';
  }
  
  // 更新进度条
  function updateProgress(percent, message) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = message;
  }
  
  // 提取音频
  function extractAudio() {
    const url = urlInput.value.trim();
    
    if (!url) {
      showError('请输入YouTube视频链接');
      return;
    }
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      showError('无效的YouTube链接');
      return;
    }
    
    // 如果是同一个视频，直接显示之前的结果
    if (videoId === currentVideoId && audioData) {
      showAudioInfo(audioData);
      return;
    }
    
    currentVideoId = videoId;
    hideError();
    audioInfo.style.display = 'none';
    progressContainer.style.display = 'block';
    extractBtn.disabled = true;
    
    updateProgress(10, '获取视频信息...');
    
    // 向content script发送消息，获取当前页面的视频信息
    if (url.includes('youtube.com/watch')) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'getVideoInfo'}, function(response) {
          if (chrome.runtime.lastError) {
            // 如果content script没有响应，则通过background script获取信息
            getVideoInfoFromApi(videoId);
          } else if (response && response.success) {
            processVideoInfo(response.data);
          } else {
            getVideoInfoFromApi(videoId);
          }
        });
      });
    } else {
      // 如果不是在YouTube页面上，直接通过API获取
      getVideoInfoFromApi(videoId);
    }
  }
  
  // 通过background script的API获取视频信息
  function getVideoInfoFromApi(videoId) {
    updateProgress(30, '通过API获取视频信息...');
    
    chrome.runtime.sendMessage(
      {action: 'getVideoInfo', videoId: videoId},
      function(response) {
        if (response && response.success) {
          processVideoInfo(response.data);
        } else {
          showError(response ? response.error : '获取视频信息失败');
          extractBtn.disabled = false;
        }
      }
    );
  }
  
  // 处理获取到的视频信息
  function processVideoInfo(data) {
    updateProgress(60, '准备音频转换...');
    
    audioData = {
      id: currentVideoId,
      title: data.title,
      duration: data.duration,
      thumbnail: data.thumbnail,
      author: data.author
    };
    
    // 向background script发送消息，准备音频转换
    chrome.runtime.sendMessage(
      {action: 'prepareAudioConversion', videoId: currentVideoId},
      function(response) {
        if (response && response.success) {
          updateProgress(100, '音频准备完成');
          setTimeout(() => {
            showAudioInfo(audioData);
            extractBtn.disabled = false;
          }, 500);
        } else {
          showError(response ? response.error : '音频转换准备失败');
          extractBtn.disabled = false;
        }
      }
    );
  }
  
  // 显示音频信息
  function showAudioInfo(data) {
    thumbnail.src = data.thumbnail || '';
    audioTitle.textContent = data.title || '未知标题';
    
    // 格式化时长
    let durationText = '未知时长';
    if (data.duration) {
      const minutes = Math.floor(data.duration / 60);
      const seconds = data.duration % 60;
      durationText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    audioDuration.textContent = durationText;
    progressContainer.style.display = 'none';
    audioInfo.style.display = 'block';
  }
  
  // 下载音频
  function downloadAudio() {
    if (!currentVideoId) return;
    
    downloadBtn.disabled = true;
    progressContainer.style.display = 'block';
    updateProgress(0, '准备下载...');
    
    chrome.runtime.sendMessage(
      {action: 'downloadAudio', videoId: currentVideoId, title: audioData.title},
      function(response) {
        if (response && response.success) {
          updateProgress(100, '下载已开始');
          setTimeout(() => {
            progressContainer.style.display = 'none';
            downloadBtn.disabled = false;
          }, 1000);
        } else {
          showError(response ? response.error : '下载失败');
          downloadBtn.disabled = false;
        }
      }
    );
  }
  
  // 事件监听
  extractBtn.addEventListener('click', extractAudio);
  downloadBtn.addEventListener('click', downloadAudio);
  autoExtractCheckbox.addEventListener('change', checkCurrentTab);
  
  // 初始化时检查当前标签页
  checkCurrentTab();
});