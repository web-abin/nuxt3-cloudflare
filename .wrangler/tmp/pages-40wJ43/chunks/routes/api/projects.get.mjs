import { d as defineEventHandler } from '../../nitro/nitro.mjs';

const projects_get = defineEventHandler(async (event) => {
  return [
    {
      id: 1,
      title: "3D \u4EA4\u4E92\u5F0F\u4EA7\u54C1\u5C55\u793A\u5E73\u53F0",
      description: "\u4F7F\u7528 Three.js \u6784\u5EFA\u7684\u6C89\u6D78\u5F0F 3D \u4EA7\u54C1\u5C55\u793A\u7CFB\u7EDF\uFF0C\u652F\u6301\u5B9E\u65F6\u4EA4\u4E92\u548C AR \u9884\u89C8\u529F\u80FD\u3002",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      tags: ["Three.js", "WebGL", "Vue.js", "AR"],
      link: "https://example.com/project1",
      featured: true
    },
    {
      id: 2,
      title: "\u5B9E\u65F6\u534F\u4F5C\u8BBE\u8BA1\u5DE5\u5177",
      description: "\u57FA\u4E8E WebSocket \u7684\u591A\u4EBA\u5728\u7EBF\u8BBE\u8BA1\u534F\u4F5C\u5E73\u53F0\uFF0C\u652F\u6301\u5B9E\u65F6\u540C\u6B65\u548C\u7248\u672C\u63A7\u5236\u3002",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      tags: ["React", "WebSocket", "Node.js", "MongoDB"],
      link: "https://example.com/project2",
      featured: true
    },
    {
      id: 3,
      title: "AI \u9A71\u52A8\u7684\u6570\u636E\u5206\u6790\u4EEA\u8868\u677F",
      description: "\u667A\u80FD\u6570\u636E\u53EF\u89C6\u5316\u5E73\u53F0\uFF0C\u96C6\u6210\u673A\u5668\u5B66\u4E60\u6A21\u578B\u8FDB\u884C\u9884\u6D4B\u5206\u6790\u548C\u5B9E\u65F6\u76D1\u63A7\u3002",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      tags: ["Python", "TensorFlow", "D3.js", "FastAPI"],
      link: "https://example.com/project3",
      featured: false
    },
    {
      id: 4,
      title: "\u79FB\u52A8\u7AEF\u6E38\u620F\u5F15\u64CE",
      description: "\u9AD8\u6027\u80FD 2D/3D \u79FB\u52A8\u6E38\u620F\u5F15\u64CE\uFF0C\u652F\u6301\u8DE8\u5E73\u53F0\u90E8\u7F72\u548C\u5B9E\u65F6\u7269\u7406\u6A21\u62DF\u3002",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
      tags: ["C++", "OpenGL", "Unity", "Mobile"],
      link: "https://example.com/project4",
      featured: false
    },
    {
      id: 5,
      title: "\u533A\u5757\u94FE NFT \u5E02\u573A",
      description: "\u53BB\u4E2D\u5FC3\u5316 NFT \u4EA4\u6613\u5E73\u53F0\uFF0C\u652F\u6301\u591A\u94FE\u90E8\u7F72\u548C\u667A\u80FD\u5408\u7EA6\u96C6\u6210\u3002",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
      tags: ["Solidity", "Web3", "Ethereum", "IPFS"],
      link: "https://example.com/project5",
      featured: true
    },
    {
      id: 6,
      title: "\u667A\u80FD\u5BB6\u5C45\u63A7\u5236\u7CFB\u7EDF",
      description: "IoT \u8BBE\u5907\u7BA1\u7406\u5E73\u53F0\uFF0C\u652F\u6301\u8BED\u97F3\u63A7\u5236\u548C\u81EA\u52A8\u5316\u573A\u666F\u914D\u7F6E\u3002",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      tags: ["IoT", "MQTT", "React Native", "AWS"],
      link: "https://example.com/project6",
      featured: false
    }
  ];
});

export { projects_get as default };
//# sourceMappingURL=projects.get.mjs.map
