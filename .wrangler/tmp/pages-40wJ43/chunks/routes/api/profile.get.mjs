import { d as defineEventHandler } from '../../nitro/nitro.mjs';

const profile_get = defineEventHandler(async (event) => {
  return {
    name: "\u5F20\u4E09",
    title: "\u5168\u6808\u5F00\u53D1\u5DE5\u7A0B\u5E08 & \u521B\u610F\u8BBE\u8BA1\u5E08",
    bio: "\u4E13\u6CE8\u4E8E\u521B\u9020\u4EE4\u4EBA\u60CA\u53F9\u7684\u6570\u5B57\u4F53\u9A8C\uFF0C\u64C5\u957F\u5C06\u521B\u610F\u4E0E\u6280\u672F\u5B8C\u7F8E\u7ED3\u5408\u3002\u62E5\u6709 5+ \u5E74\u5168\u6808\u5F00\u53D1\u7ECF\u9A8C\uFF0C\u70ED\u7231 3D \u56FE\u5F62\u3001\u52A8\u753B\u548C\u4EA4\u4E92\u8BBE\u8BA1\u3002",
    location: "\u5317\u4EAC\uFF0C\u4E2D\u56FD",
    email: "zhangsan@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
    social: {
      github: "https://github.com/zhangsan",
      linkedin: "https://linkedin.com/in/zhangsan",
      twitter: "https://twitter.com/zhangsan"
    }
  };
});

export { profile_get as default };
//# sourceMappingURL=profile.get.mjs.map
