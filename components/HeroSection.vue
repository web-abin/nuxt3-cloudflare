<template>
  <section 
    v-if="profile" 
    class="min-h-screen flex items-center justify-center relative overflow-hidden"
    id="hero"
  >
    <div class="container mx-auto px-4 text-center z-10">
      <div class="animate-fade-in">
        <div class="mb-6 animate-float">
          <img 
            :src="profile.avatar" 
            :alt="profile.name"
            class="w-32 h-32 rounded-full mx-auto border-4 border-purple-400/50 glow"
          />
        </div>
        
        <h1 class="text-6xl md:text-8xl font-bold mb-4 text-gradient animate-slide-up">
          {{ profile.name }}
        </h1>
        
        <p class="text-2xl md:text-3xl text-purple-300 mb-8 animate-slide-up" style="animation-delay: 0.2s">
          {{ profile.title }}
        </p>
        
        <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 animate-slide-up" style="animation-delay: 0.4s">
          {{ profile.bio }}
        </p>
        
        <div class="flex gap-4 justify-center animate-slide-up" style="animation-delay: 0.6s">
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
        
        <div class="mt-16 animate-bounce">
          <a href="#about" class="text-4xl">↓</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: profile } = await useFetch('/api/profile')
</script>
