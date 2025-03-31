import { useLoginNoMessage } from '@/hooks/login-hooks';
import { rsaPsw } from '@/utils';
import { Alert, Button, Form, Input, Spin, Typography } from 'antd';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';

const { Title } = Typography;

/**
 * Base64解码函数
 * @param base64 Base64编码的字符串
 * @returns 解码后的字符串
 */
const decodeBase64 = (base64: string): string => {
  try {
    return atob(base64);
  } catch (error) {
    console.error('Base64解码失败:', error);
    return '';
  }
};

/**
 * 嵌入页面认证包装器
 * 处理自动登录逻辑，支持通过URL参数传递登录信息
 * 密码使用base64编码传递，增加安全性
 * 支持通过targetUrl参数指定登录成功后要展示的页面
 */
const EmbedAuthWrapper: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [targetUrl, setTargetUrl] = useState('');
  const { login } = useLoginNoMessage();
  // 创建iframe引用，将其移至组件顶部
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // 添加表单状态
  const [form] = Form.useForm();

  useEffect(() => {
    const addDebugInfo = (info: string) => {
      console.log(info);
      setDebugInfo((prev) => [...prev, info]);
    };

    const attemptLogin = async () => {
      addDebugInfo('开始登录流程...');
      try {
        // 从URL参数获取登录信息
        const query = queryString.parse(window.location.search);
        addDebugInfo(`获取到URL参数: ${JSON.stringify(query)}`);

        const email = query.email;
        const encPassword = query.encpwd; // 使用encpwd参数传递base64加密的密码

        // 获取目标URL
        if (typeof query.targetUrl === 'string' && query.targetUrl) {
          // 确保targetUrl以/开头，如果不是则添加
          const url = query.targetUrl.startsWith('/')
            ? query.targetUrl
            : `/${query.targetUrl}`;
          setTargetUrl(url);
          addDebugInfo(`设置目标URL: ${url}`);
        }

        addDebugInfo(
          `email: ${typeof email === 'string' ? '有效' : '无效'}, encPassword: ${typeof encPassword === 'string' ? '有效' : '无效'}`,
        );

        if (email && typeof email === 'string') {
          // 预填充邮箱到表单
          form.setFieldsValue({ email });
        }

        if (
          !email ||
          !encPassword ||
          typeof email !== 'string' ||
          typeof encPassword !== 'string'
        ) {
          // 如果没有登录参数，尝试检查是否已登录
          const userInfo = localStorage.getItem('userInfo');
          addDebugInfo(`本地存储中的用户信息: ${userInfo ? '存在' : '不存在'}`);

          if (userInfo) {
            addDebugInfo('检测到已登录，跳过登录步骤');
            setIsLoggedIn(true);
            setLoading(false);
            return;
          }

          // 没有参数且未登录，显示登录表单
          addDebugInfo('缺少登录参数且未检测到已登录状态，显示登录表单');
          setLoading(false);
          return;
        }

        // 解码base64密码
        const decodedPassword = decodeBase64(encPassword);

        if (!decodedPassword) {
          addDebugInfo('Base64密码解码失败');
          setLoginError('密码解码失败，请检查URL参数格式');
          setLoading(false);
          return;
        }

        // 执行登录
        addDebugInfo('开始执行登录...');
        const rsaPassword = rsaPsw(decodedPassword) as string;
        const code = await login({
          email: email.trim(),
          password: rsaPassword,
        });

        addDebugInfo(`登录响应代码: ${code}`);
        if (code === 0) {
          addDebugInfo('登录成功');
          setIsLoggedIn(true);
          setLoading(false);
        } else {
          addDebugInfo('登录失败，错误代码: ' + code);
          setLoginError('登录失败，请检查用户名和密码');
          setLoading(false);
        }
      } catch (error) {
        addDebugInfo(`登录过程中发生错误: ${error}`);
        console.error('登录过程中发生错误:', error);
        setLoginError(
          `登录失败: ${error instanceof Error ? error.message : String(error)}`,
        );
        setLoading(false);
      }
    };

    attemptLogin();
  }, [form]);

  // 处理登录提交
  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const rsaPassword = rsaPsw(values.password) as string;
      const code = await login({
        email: values.email.trim(),
        password: rsaPassword,
      });

      if (code === 0) {
        console.log('登录成功');
        setIsLoggedIn(true);
        setLoading(false);
      } else {
        console.log('登录失败，错误代码:', code);
        setLoginError('登录失败，请检查用户名和密码');
        setLoading(false);
      }
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      setLoginError(
        `登录失败: ${error instanceof Error ? error.message : String(error)}`,
      );
      setLoading(false);
    }
  };

  // 登录表单渲染
  const renderLoginForm = () => {
    return (
      <div
        style={{
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
          登录RAG
        </Title>

        {loginError && (
          <Alert
            message="登录失败"
            description={loginError}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>

        {debugInfo.length > 0 && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              调试信息:
            </p>
            <div
              style={{
                maxHeight: '200px',
                overflow: 'auto',
                background: '#f0f0f0',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              {debugInfo.map((info, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  {info}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin>
          <div style={{ padding: '30px', textAlign: 'center' }}></div>
        </Spin>
      </div>
    );
  }

  // 如果未登录，显示登录表单
  if (!isLoggedIn) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#f5f5f5',
        }}
      >
        {renderLoginForm()}
      </div>
    );
  }

  // 已登录，显示iframe内容
  console.log(`已登录，使用iframe嵌入页面: ${targetUrl}`);

  // iframe加载完成后处理样式
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

      // 创建样式元素并注入
      const styleElement = iframe.contentDocument.createElement('style');
      styleElement.textContent = `
        /* 隐藏全局导航和侧边栏 */
        .ant-layout-header,
        .ant-layout-sider,
        .ant-menu-root,
        .setting-sidebar,
        .user-setting-header,
        .user-setting-container .ant-layout-sider,
        .ant-page-header,
        .ant-layout-sider-trigger {
          display: none !important;
        }
        .ant-layout .ant-divider.ant-divider-horizontal {
          display: none !important;
        }
        
        /* 调整内容区域 */
        .ant-layout-content,
        .ant-layout-container {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* 设置主布局背景和宽度 */
        .ant-layout {
          background: white !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* 调整设置容器 */
        .setting-container,
        .setting-content {
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
        }
      `;

      iframe.contentDocument.head.appendChild(styleElement);
      console.log('已向iframe注入样式');
    } catch (error) {
      console.error('处理iframe时出错:', error);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src={targetUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          overflow: 'hidden',
        }}
        title="嵌入内容"
        onLoad={handleIframeLoad}
        allow="clipboard-write; clipboard-read"
      />
    </div>
  );
};

export default EmbedAuthWrapper;
