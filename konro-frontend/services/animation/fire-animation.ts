export interface WordTransformation {
  original: string
  transformed: string
  element: HTMLElement
}

export interface AnimationConfig {
  duration: number
  flames: boolean
  sparks: boolean
  shake: boolean
}

export class FireAnimationService {
  private animationQueue: WordTransformation[] = []
  private isAnimating = false

  async animateWordBurning(
    element: HTMLElement,
    original: string,
    transformed: string,
    config: AnimationConfig = this.getDefaultConfig()
  ): Promise<void> {
    const transformation: WordTransformation = {
      original,
      transformed,
      element
    }

    this.animationQueue.push(transformation)
    
    if (!this.isAnimating) {
      await this.processAnimationQueue(config)
    }
  }

  private async processAnimationQueue(config: AnimationConfig): Promise<void> {
    this.isAnimating = true

    while (this.animationQueue.length > 0) {
      const transformation = this.animationQueue.shift()
      if (transformation) {
        await this.executeWordBurning(transformation, config)
      }
    }

    this.isAnimating = false
  }

  private async executeWordBurning(
    { element, original, transformed }: WordTransformation,
    config: AnimationConfig
  ): Promise<void> {
    return new Promise((resolve) => {
      // Phase 1: Highlight the negative word
      this.highlightNegativeWord(element, original)

      setTimeout(() => {
        // Phase 2: Add fire effect
        if (config.flames) {
          this.addFireEffect(element)
        }

        // Phase 3: Shake animation
        if (config.shake) {
          this.addShakeEffect(element)
        }

        setTimeout(() => {
          // Phase 4: Burn transition
          this.addBurnTransition(element)

          setTimeout(() => {
            // Phase 5: Transform to positive word
            this.transformWord(element, transformed)
            
            // Phase 6: Celebration effect
            if (config.sparks) {
              this.addSparkEffect(element)
            }

            setTimeout(() => {
              // Phase 7: Cleanup
              this.cleanupEffects(element)
              resolve()
            }, 800)
          }, 600)
        }, 400)
      }, 300)
    })
  }

  private highlightNegativeWord(element: HTMLElement, word: string): void {
    const content = element.textContent || ''
    const regex = new RegExp(`(${word})`, 'gi')
    
    const highlightedContent = content.replace(regex, 
      `<span class="negative-word-highlight animate-pulse bg-red-200 text-red-800 px-1 rounded">$1</span>`
    )
    
    element.innerHTML = highlightedContent
  }

  private addFireEffect(element: HTMLElement): void {
    // Add fire emoji and CSS animation
    const fireContainer = document.createElement('div')
    fireContainer.className = 'fire-effect absolute inset-0 flex items-center justify-center pointer-events-none z-10'
    fireContainer.innerHTML = `
      <div class="fire-flames animate-bounce text-2xl">
        🔥🔥🔥
      </div>
    `
    
    // Make element relative for absolute positioning
    element.style.position = 'relative'
    element.appendChild(fireContainer)
  }

  private addShakeEffect(element: HTMLElement): void {
    element.classList.add('animate-shake')
    
    // Add shake animation CSS if not already present
    if (!document.getElementById('shake-animation')) {
      const style = document.createElement('style')
      style.id = 'shake-animation'
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out 3;
        }
      `
      document.head.appendChild(style)
    }
  }

  private addBurnTransition(element: HTMLElement): void {
    // Add burning effect with CSS
    element.classList.add('burning-effect')
    
    if (!document.getElementById('burn-animation')) {
      const style = document.createElement('style')
      style.id = 'burn-animation'
      style.textContent = `
        .burning-effect {
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e, #ffaaaa);
          color: #fff;
          text-shadow: 0 0 10px rgba(255, 107, 107, 0.8);
          animation: burn 0.6s ease-in-out;
        }
        @keyframes burn {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); filter: blur(1px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
      `
      document.head.appendChild(style)
    }
  }

  private transformWord(element: HTMLElement, transformedText: string): void {
    // Get all negative word highlights
    const highlights = element.querySelectorAll('.negative-word-highlight')
    
    highlights.forEach((highlight) => {
      // Create transformation container
      const transformContainer = document.createElement('span')
      transformContainer.className = 'transformed-word bg-green-200 text-green-800 px-1 rounded animate-pulse'
      transformContainer.textContent = transformedText
      
      // Replace highlight with transformation
      highlight.parentNode?.replaceChild(transformContainer, highlight)
    })
  }

  private addSparkEffect(element: HTMLElement): void {
    const sparkContainer = document.createElement('div')
    sparkContainer.className = 'spark-effect absolute inset-0 flex items-center justify-center pointer-events-none z-20'
    sparkContainer.innerHTML = `
      <div class="sparks animate-ping text-lg">
        ✨⭐✨
      </div>
    `
    
    element.appendChild(sparkContainer)
  }

  private cleanupEffects(element: HTMLElement): void {
    // Remove animation classes
    element.classList.remove('animate-shake', 'burning-effect')
    
    // Remove effect containers
    const fireEffect = element.querySelector('.fire-effect')
    const sparkEffect = element.querySelector('.spark-effect')
    
    if (fireEffect) fireEffect.remove()
    if (sparkEffect) sparkEffect.remove()
    
    // Reset position
    element.style.position = ''
    
    // Fade out transformation highlighting
    setTimeout(() => {
      const transformedWords = element.querySelectorAll('.transformed-word')
      transformedWords.forEach((word) => {
        word.classList.remove('animate-pulse', 'bg-green-200', 'text-green-800')
        word.classList.add('text-green-600')
      })
    }, 1000)
  }

  private getDefaultConfig(): AnimationConfig {
    return {
      duration: 2000,
      flames: true,
      sparks: true,
      shake: true
    }
  }

  // Public method to detect negative words in text
  detectNegativeWords(text: string): string[] {
    const negativeWords = [
      '辛い', 'つらい', '悲しい', '嫌', 'だめ', '無理', '疲れた', 
      '憂鬱', 'うつ', '不安', '心配', '困った', '大変', '最悪',
      'むかつく', 'いらいら', '怒り', '腹立つ', '失敗', '駄目'
    ]
    
    return negativeWords.filter(word => text.includes(word))
  }

  // Method to apply transformations to text content
  async animateMessageTransformation(
    messageElement: HTMLElement,
    detectedWords: string[],
    transformations: Array<{ original: string; transformed: string }>
  ): Promise<void> {
    for (const transformation of transformations) {
      if (detectedWords.includes(transformation.original)) {
        await this.animateWordBurning(
          messageElement,
          transformation.original,
          transformation.transformed
        )
      }
    }
  }
}

// Export singleton instance
export const fireAnimationService = new FireAnimationService()
export default fireAnimationService