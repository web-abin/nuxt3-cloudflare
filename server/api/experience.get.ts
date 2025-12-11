export default defineEventHandler(async (event) => {
  return [
    {
      id: 1,
      company: '创新科技公司',
      position: '高级全栈工程师',
      period: '2022 - 至今',
      description: '负责核心产品的前后端开发，领导技术团队完成多个大型项目。使用 Vue.js、Node.js 和云原生技术栈。',
      achievements: [
        '将系统性能提升 300%，用户响应时间减少 60%',
        '带领团队完成 5+ 个百万级用户项目',
        '建立并优化 CI/CD 流程，部署效率提升 80%'
      ]
    },
    {
      id: 2,
      company: '数字创意工作室',
      position: '前端开发工程师',
      period: '2020 - 2022',
      description: '专注于创建视觉震撼的交互式 Web 应用，擅长 3D 图形和动画效果实现。',
      achievements: [
        '开发了 10+ 个获奖的交互式网站',
        '引入 Three.js 技术栈，提升团队 3D 开发能力',
        '优化移动端性能，页面加载速度提升 50%'
      ]
    },
    {
      id: 3,
      company: '创业公司',
      position: '全栈开发工程师',
      period: '2018 - 2020',
      description: '从零开始构建产品 MVP，负责前后端开发和 DevOps 工作。',
      achievements: [
        '独立完成产品核心功能开发',
        '实现从 0 到 10 万用户的增长',
        '建立完整的监控和日志系统'
      ]
    }
  ]
})
