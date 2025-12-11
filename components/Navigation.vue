<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-lg transition-all duration-300"
    :class="{ 'bg-slate-900/80': scrolled }"
  >
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="text-2xl font-bold text-gradient">
          个人作品集
        </div>
        
        <div class="hidden md:flex gap-6">
          <a 
            v-for="link in navLinks" 
            :key="link.id"
            :href="`#${link.id}`"
            class="text-gray-300 hover:text-purple-400 transition-colors duration-300"
            @click="scrollToSection(link.id)"
          >
            {{ link.label }}
          </a>
        </div>
        
        <!-- Mobile Menu Button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden text-white"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div 
        v-if="mobileMenuOpen"
        class="md:hidden mt-4 space-y-2"
      >
        <a 
          v-for="link in navLinks" 
          :key="link.id"
          :href="`#${link.id}`"
          class="block py-2 text-gray-300 hover:text-purple-400 transition-colors"
          @click="mobileMenuOpen = false"
        >
          {{ link.label }}
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

const navLinks = [
  { id: 'hero', label: '首页' },
  { id: 'about', label: '关于' },
  { id: 'skills', label: '技能' },
  { id: 'projects', label: '作品' },
  { id: 'experience', label: '经历' },
  { id: 'contact', label: '联系' }
]

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
