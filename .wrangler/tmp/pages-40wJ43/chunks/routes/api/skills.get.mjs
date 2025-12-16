import { d as defineEventHandler } from '../../nitro/nitro.mjs';

const skills_get = defineEventHandler(async (event) => {
  return [
    {
      category: "\u524D\u7AEF\u6280\u672F",
      items: [
        { name: "Vue.js / Nuxt.js", level: 95, icon: "\u26A1" },
        { name: "React / Next.js", level: 90, icon: "\u269B\uFE0F" },
        { name: "TypeScript", level: 92, icon: "\u{1F4D8}" },
        { name: "Three.js / WebGL", level: 85, icon: "\u{1F3A8}" },
        { name: "Tailwind CSS", level: 88, icon: "\u{1F485}" }
      ]
    },
    {
      category: "\u540E\u7AEF\u6280\u672F",
      items: [
        { name: "Node.js", level: 90, icon: "\u{1F7E2}" },
        { name: "Python", level: 85, icon: "\u{1F40D}" },
        { name: "Cloudflare Workers", level: 80, icon: "\u2601\uFE0F" },
        { name: "PostgreSQL", level: 82, icon: "\u{1F418}" },
        { name: "Redis", level: 78, icon: "\u{1F534}" }
      ]
    },
    {
      category: "\u8BBE\u8BA1\u5DE5\u5177",
      items: [
        { name: "Figma", level: 88, icon: "\u{1F3A8}" },
        { name: "Blender", level: 75, icon: "\u{1F3AC}" },
        { name: "After Effects", level: 70, icon: "\u{1F39E}\uFE0F" }
      ]
    }
  ];
});

export { skills_get as default };
//# sourceMappingURL=skills.get.mjs.map
