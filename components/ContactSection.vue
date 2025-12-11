<template>
  <section 
    class="min-h-screen flex items-center justify-center py-20"
    id="contact"
    data-animate
  >
    <div class="container mx-auto px-4">
      <div class="glass rounded-3xl p-12 max-w-2xl mx-auto text-center">
        <h2 class="text-5xl font-bold mb-8 text-gradient">
          联系我
        </h2>
        
        <p class="text-xl text-gray-300 mb-12">
          有项目想法或合作机会？欢迎随时联系！
        </p>
        
        <div v-if="profile" class="space-y-6">
          <a 
            :href="`mailto:${profile.email}`"
            class="block glass px-8 py-4 rounded-full text-lg hover:scale-105 transition-transform duration-300"
          >
            📧 {{ profile.email }}
          </a>
          
          <div class="flex gap-4 justify-center mt-8">
            <a 
              v-for="(url, platform) in profile.social" 
              :key="platform"
              :href="url"
              target="_blank"
              class="glass px-6 py-3 rounded-full hover:scale-110 transition-transform duration-300"
            >
              {{ platform }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: profile } = await useFetch('/api/profile')
</script>
