export default defineNuxtConfig({
  compatibilityDate: '2024-01-01',
  // 禁用 devtools 以避免 oxc-parser 原生绑定问题（Cloudflare Pages 构建环境不支持）
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: '交互式个人简历/作品集',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '一个包含 3D 效果和滚动动画的交互式个人简历/作品集' }
      ]
    }
  },
  nitro: {
    preset: 'cloudflare-pages'
  },
  // 优化构建配置
  experimental: {
    payloadExtraction: false
  }
})
