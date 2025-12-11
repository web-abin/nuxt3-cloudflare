export default defineEventHandler(async (event) => {
  return [
    {
      category: '前端技术',
      items: [
        { name: 'Vue.js / Nuxt.js', level: 95, icon: '⚡' },
        { name: 'React / Next.js', level: 90, icon: '⚛️' },
        { name: 'TypeScript', level: 92, icon: '📘' },
        { name: 'Three.js / WebGL', level: 85, icon: '🎨' },
        { name: 'Tailwind CSS', level: 88, icon: '💅' }
      ]
    },
    {
      category: '后端技术',
      items: [
        { name: 'Node.js', level: 90, icon: '🟢' },
        { name: 'Python', level: 85, icon: '🐍' },
        { name: 'Cloudflare Workers', level: 80, icon: '☁️' },
        { name: 'PostgreSQL', level: 82, icon: '🐘' },
        { name: 'Redis', level: 78, icon: '🔴' }
      ]
    },
    {
      category: '设计工具',
      items: [
        { name: 'Figma', level: 88, icon: '🎨' },
        { name: 'Blender', level: 75, icon: '🎬' },
        { name: 'After Effects', level: 70, icon: '🎞️' }
      ]
    }
  ]
})
