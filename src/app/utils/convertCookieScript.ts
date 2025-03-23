/**
 * 脚本：将cookie文件转换为Netscape格式并替换原有cookie文件
 */
import { replaceCookieWithNetscape } from './convertCookie';

// 执行转换并替换操作
async function main() {
  try {
    console.log('开始将cookie文件转换为Netscape格式...');
    await replaceCookieWithNetscape();
    console.log('转换完成！');
  } catch (error) {
    console.error('转换过程中发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main();