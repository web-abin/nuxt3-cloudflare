export const useScrollAnimation = () => {
  const observeElements = () => {
    if (typeof window === 'undefined') return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )
    
    const elements = document.querySelectorAll('[data-animate]')
    elements.forEach((el) => observer.observe(el))
  }
  
  onMounted(() => {
    observeElements()
  })
  
  return { observeElements }
}
