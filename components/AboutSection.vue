<template>
  <section 
    class="min-h-screen flex items-center justify-center py-20"
    id="about"
    data-animate
  >
    <div class="container mx-auto px-4">
      <div class="glass rounded-3xl p-12 max-w-4xl mx-auto">
        <h2 class="text-5xl font-bold mb-8 text-gradient text-center">
          关于我
        </h2>
        
        <div v-if="profile" class="space-y-6 text-lg text-gray-300">
          <p>
            {{ profile.bio }}
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div class="glass p-6 rounded-xl">
              <h3 class="text-xl font-semibold mb-2 text-purple-300">📍 位置</h3>
              <p>{{ profile.location }}</p>
            </div>
            
            <div class="glass p-6 rounded-xl">
              <h3 class="text-xl font-semibold mb-2 text-purple-300">📧 邮箱</h3>
              <a :href="`mailto:${profile.email}`" class="hover:text-purple-400 transition-colors">
                {{ profile.email }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: profile } = await useFetch('/api/profile')
</script>
