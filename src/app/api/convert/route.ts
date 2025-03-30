import { NextResponse } from 'next/server';
// 其他导入...

export async function POST(request: Request) {
  try {
    // 设置CORS头
    const headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求（预检请求）
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers });
    }
    
    // 原有的处理逻辑...
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { 
        status: 400,
        headers
      });
    }
    
    // 处理转换请求...
    // ...
    
    // 返回响应时添加CORS头
    return NextResponse.json({ success: true, fileId: 'your-file-id', statusUrl: '/api/status/your-file-id' }, {
      headers
    });
    
  } catch (error) {
    // 错误处理...
    return NextResponse.json({ success: false, error: 'Conversion failed' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 添加OPTIONS方法处理
export async function OPTIONS(request: Request) {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type');
  
  return new NextResponse(null, { status: 200, headers });
}