<template>
  <section 
    class="min-h-screen flex items-center justify-center py-20"
    id="skills"
    data-animate
  >
    <div class="container mx-auto px-4">
      <h2 class="text-5xl font-bold mb-16 text-gradient text-center">
        技能专长
      </h2>
      
      <div v-if="skills" class="space-y-12">
        <div 
          v-for="(category, index) in skills" 
          :key="index"
          class="glass rounded-2xl p-8"
        >
          <h3 class="text-3xl font-semibold mb-6 text-purple-300">
            {{ category.category }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="(skill, skillIndex) in category.items" 
              :key="skillIndex"
              class="space-y-2"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-lg flex items-center gap-2">
                  <span>{{ skill.icon }}</span>
                  {{ skill.name }}
                </span>
                <span class="text-purple-400">{{ skill.level }}%</span>
              </div>
              
              <div class="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                  :style="{ width: `${skill.level}%`, animationDelay: `${skillIndex * 0.1}s` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: skills } = await useFetch('/api/skills')
</script>
