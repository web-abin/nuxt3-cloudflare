export default defineEventHandler(async (event) => {
  return {
    name: '张三',
    title: '全栈开发工程师 & 创意设计师',
    bio: '专注于创造令人惊叹的数字体验，擅长将创意与技术完美结合。拥有 5+ 年全栈开发经验，热爱 3D 图形、动画和交互设计。',
    location: '北京，中国',
    email: 'zhangsan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    social: {
      github: 'https://github.com/zhangsan',
      linkedin: 'https://linkedin.com/in/zhangsan',
      twitter: 'https://twitter.com/zhangsan'
    }
  }
})
