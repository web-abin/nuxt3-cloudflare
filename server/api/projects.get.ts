export default defineEventHandler(async (event) => {
  return [
    {
      id: 1,
      title: '3D 交互式产品展示平台',
      description: '使用 Three.js 构建的沉浸式 3D 产品展示系统，支持实时交互和 AR 预览功能。',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      tags: ['Three.js', 'WebGL', 'Vue.js', 'AR'],
      link: 'https://example.com/project1',
      featured: true
    },
    {
      id: 2,
      title: '实时协作设计工具',
      description: '基于 WebSocket 的多人在线设计协作平台，支持实时同步和版本控制。',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      tags: ['React', 'WebSocket', 'Node.js', 'MongoDB'],
      link: 'https://example.com/project2',
      featured: true
    },
    {
      id: 3,
      title: 'AI 驱动的数据分析仪表板',
      description: '智能数据可视化平台，集成机器学习模型进行预测分析和实时监控。',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      tags: ['Python', 'TensorFlow', 'D3.js', 'FastAPI'],
      link: 'https://example.com/project3',
      featured: false
    },
    {
      id: 4,
      title: '移动端游戏引擎',
      description: '高性能 2D/3D 移动游戏引擎，支持跨平台部署和实时物理模拟。',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      tags: ['C++', 'OpenGL', 'Unity', 'Mobile'],
      link: 'https://example.com/project4',
      featured: false
    },
    {
      id: 5,
      title: '区块链 NFT 市场',
      description: '去中心化 NFT 交易平台，支持多链部署和智能合约集成。',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
      tags: ['Solidity', 'Web3', 'Ethereum', 'IPFS'],
      link: 'https://example.com/project5',
      featured: true
    },
    {
      id: 6,
      title: '智能家居控制系统',
      description: 'IoT 设备管理平台，支持语音控制和自动化场景配置。',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      tags: ['IoT', 'MQTT', 'React Native', 'AWS'],
      link: 'https://example.com/project6',
      featured: false
    }
  ]
})
