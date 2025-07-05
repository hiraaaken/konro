import type { FireLevel } from '~/types/domain'

export interface ChatMessageRequest {
  message: string
  fireLevel: FireLevel
  sessionId: string
  userInfo?: {
    age?: string
    gender?: string
    occupation?: string
  }
}

export interface ChatMessageResponse {
  response: string
  processedMessage?: string
  detectedNegativeWords?: string[]
  transformedWords?: Array<{ original: string; transformed: string }>
}

export interface SessionStartRequest {
  fireLevel: FireLevel
  userInfo?: {
    age?: string
    gender?: string
    occupation?: string
  }
}

export interface SessionStartResponse {
  sessionId: string
  initialMessage: string
}

class ChatApiService {
  private baseUrl: string
  private apiKey?: string

  constructor() {
    // Use environment variables for API configuration
    this.baseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
    this.apiKey = process.env.NUXT_PUBLIC_API_KEY
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`)
    }

    return response.json()
  }

  async startSession(request: SessionStartRequest): Promise<SessionStartResponse> {
    // For now, simulate API call with placeholder response
    if (process.env.NODE_ENV === 'development') {
      return this.simulateStartSession(request)
    }

    return this.makeRequest<SessionStartResponse>('/sessions/start', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    // For now, simulate API call with placeholder response
    if (process.env.NODE_ENV === 'development') {
      return this.simulateSendMessage(request)
    }

    return this.makeRequest<ChatMessageResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async endSession(sessionId: string): Promise<void> {
    // For now, simulate API call
    if (process.env.NODE_ENV === 'development') {
      return this.simulateEndSession(sessionId)
    }

    return this.makeRequest<void>(`/sessions/${sessionId}/end`, {
      method: 'POST'
    })
  }

  // Simulation methods for development (will be removed when real API is ready)
  private async simulateStartSession(request: SessionStartRequest): Promise<SessionStartResponse> {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay

    const sessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const initialMessages = {
      weak: 'お疲れさま。今日はどうしたの？何か辛いことでもあった？',
      medium: 'やあ！今日はどんなことがあったんだい？話してみて！',
      strong: 'どうした！何があった！全部話せ！'
    }

    return {
      sessionId,
      initialMessage: initialMessages[request.fireLevel] || initialMessages.medium
    }
  }

  private async simulateSendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000)) // Simulate processing time

    // Simulate negative word detection
    const negativeWords = ['辛い', 'つらい', '悲しい', '嫌', 'だめ', '無理', '疲れた', '憂鬱', 'うつ', '不安']
    const detectedNegativeWords = negativeWords.filter(word => 
      request.message.includes(word)
    )

    // Simulate word transformation
    const transformedWords = detectedNegativeWords.map(word => ({
      original: word,
      transformed: this.getPositiveTransform(word)
    }))

    // Generate response based on fire level and context
    const response = this.generateResponse(request.message, request.fireLevel, detectedNegativeWords)

    return {
      response,
      detectedNegativeWords,
      transformedWords: transformedWords.length > 0 ? transformedWords : undefined,
      processedMessage: transformedWords.length > 0 
        ? this.applyTransformations(request.message, transformedWords)
        : undefined
    }
  }

  private async simulateEndSession(sessionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    // Just simulate successful session end
  }

  private getPositiveTransform(negativeWord: string): string {
    const transformMap: Record<string, string> = {
      '辛い': '成長のチャンス',
      'つらい': '乗り越えられる試練',
      '悲しい': '感情豊かな証拠',
      '嫌': '新しい発見の機会',
      'だめ': '改善の余地がある',
      '無理': '挑戦的だけど可能',
      '疲れた': 'よく頑張った',
      '憂鬱': '心が繊細で優しい',
      'うつ': '深く物事を考える力',
      '不安': '慎重で責任感が強い'
    }
    
    return transformMap[negativeWord] || 'ポジティブな可能性'
  }

  private applyTransformations(message: string, transformations: Array<{ original: string; transformed: string }>): string {
    let processedMessage = message
    
    transformations.forEach(({ original, transformed }) => {
      processedMessage = processedMessage.replace(new RegExp(original, 'g'), transformed)
    })
    
    return processedMessage
  }

  private generateResponse(message: string, fireLevel: FireLevel, detectedNegativeWords: string[]): string {
    const hasNegativeWords = detectedNegativeWords.length > 0
    
    const responses = {
      weak: hasNegativeWords ? [
        'そうですね、そんな気持ちになることもありますよね。でも、あなたは一人じゃありませんよ。',
        'そういう時もあって当然です。あなたの気持ちを大切にしてくださいね。',
        'つらい気持ちを話してくれてありがとう。あなたのペースで大丈夫ですからね。'
      ] : [
        'そうなんですね。あなたの気持ちがよく伝わってきます。',
        'お話しを聞かせてくれてありがとうございます。',
        'そういうことがあったんですね。'
      ],
      
      medium: hasNegativeWords ? [
        'そんな時もあるよ！でも君なら絶対に乗り越えられる！',
        '大変だったね。でもこれは成長のチャンスでもあるんだ！',
        'つらい経験も、きっと君を強くしてくれるよ！'
      ] : [
        'いいね！そういう話を聞くのは楽しいよ！',
        'そうなんだ！もっと聞かせてよ！',
        'なるほど！君らしい考え方だね！'
      ],
      
      strong: hasNegativeWords ? [
        'そんなことで負けてたまるか！お前はもっと強いはずだ！',
        '弱音を吐いてる場合じゃない！立ち上がって前に進め！',
        'その程度で諦めるな！お前にはもっと大きな可能性があるんだ！'
      ] : [
        'よし！その調子だ！どんどん話せ！',
        'いいぞ！お前の話は聞いてて気持ちがいい！',
        'その通りだ！お前の考えは正しい！'
      ]
    }
    
    const levelResponses = responses[fireLevel] || responses.medium
    return levelResponses[Math.floor(Math.random() * levelResponses.length)]
  }
}

// Singleton instance
export const chatApiService = new ChatApiService()

export default chatApiService