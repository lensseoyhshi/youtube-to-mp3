/**
 * 工具函数：用于处理cookie的读取和写入
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * 将浏览器cookie字符串写入临时文件
 * @param cookieStr 浏览器cookie字符串
 * @returns 临时文件路径
 */
export async function writeCookieToTempFile(cookieStr: string): Promise<string> {
  try {
    // 创建临时文件
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `yt_cookie_${Date.now()}.txt`);
    
    // 将cookie字符串转换为Netscape格式
    // Netscape格式头部
    let netscapeCookieContent = '# Netscape HTTP Cookie File\n';
    netscapeCookieContent += '# https://curl.haxx.se/docs/http-cookies.html\n';
    netscapeCookieContent += '# This file was generated by youtube-to-mp3\n\n';
    
    // 处理cookie字符串
    if (cookieStr && cookieStr.trim()) {
      // 分割cookie字符串为单独的cookie
      const cookies = cookieStr.split(';').filter(cookie => cookie.trim());
      
      // 处理每个cookie并转换为Netscape格式
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=').map(part => part.trim());
        if (name && value) {
          // Netscape格式: domain flag path secure expiration name value
          // 正确的Netscape格式要求域名前加点，表示包含所有子域名
          // 格式: .domain.com TRUE path secure expiration name value
          netscapeCookieContent += `.youtube.com\tTRUE\t/\tFALSE\t2147483647\t${name}\t${value}\n`;
        }
      }
    }
    
    // 将Netscape格式的cookie写入临时文件
    await fs.promises.writeFile(tempFilePath, netscapeCookieContent, 'utf-8');
    
    return tempFilePath;
  } catch (error) {
    console.error('Error writing cookie to temp file:', error);
    throw new Error('Failed to write cookie to temp file');
  }
}

/**
 * 清理临时cookie文件
 * @param filePath 临时文件路径
 */
export async function cleanupTempCookieFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp cookie file:', error);
  }
}