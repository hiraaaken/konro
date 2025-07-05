import { ref } from 'vue'
import { fireAnimationService } from '~/services/animation/fire-animation'

export const useAnimation = () => {
  const isAnimating = ref(false)
  const animationQueue = ref<string[]>([])

  const animateNegativeWords = async (
    element: HTMLElement,
    detectedWords: string[],
    transformations: Array<{ original: string; transformed: string }>
  ) => {
    if (!element || detectedWords.length === 0) return

    isAnimating.value = true
    animationQueue.value = [...detectedWords]

    try {
      await fireAnimationService.animateMessageTransformation(
        element,
        detectedWords,
        transformations
      )
    } catch (error) {
      console.error('Animation failed:', error)
    } finally {
      isAnimating.value = false
      animationQueue.value = []
    }
  }

  const detectNegativeWords = (text: string): string[] => {
    return fireAnimationService.detectNegativeWords(text)
  }

  const animateSingleWord = async (
    element: HTMLElement,
    original: string,
    transformed: string
  ) => {
    isAnimating.value = true
    
    try {
      await fireAnimationService.animateWordBurning(element, original, transformed)
    } catch (error) {
      console.error('Single word animation failed:', error)
    } finally {
      isAnimating.value = false
    }
  }

  return {
    // State
    isAnimating: readonly(isAnimating),
    animationQueue: readonly(animationQueue),
    
    // Methods
    animateNegativeWords,
    detectNegativeWords,
    animateSingleWord
  }
}