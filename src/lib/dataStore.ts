 this.waitForInitialization()
    }

    // 메모리 캐시 업데이트
    this.memoryCache = data

    if (!this.fsModule || !this.filePath) {
      return false
    }

    try {
      // dataSerializer를 사용하여 직렬화
      const jsonData = dataSerializer.serializeData(data as MockData)
      this.fsModule.writeFileSync(this.filePath, jsonData, 'utf8')
      
      // 파일 수정 시간 업데이트
      const stats = this.fsModule.statSync(this.filePath)
      this.lastFileModified = stats.mtime
      
      return true
    } catch (error) {
      console.error('Failed to save data to file:', error)
      return false
    }
  }

  isReady(): boolean {
    return this.initialized
  }

  getStorageInfo() {
    return {
      type: 'file' as const,
      location: this.filePath,
      lastModified: this.lastFileModified || undefined
    }
  }

  private async waitForInitialization(): Promise<void> {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
}

// 브라우저 환경용 localStorage 기반 데이터 저장소
class BrowserDataStore<T = any> implements PersistentDataStore<T> {
  private memoryCache: T | null = null
  private storageKey: string

  constructor(private fileName: string = 'mockStorage.json') {
    this.storageKey = `fitnessApp_${fileName.replace('.json', '')}`
  }

  async loadData(): Promise<T | null> {
    // localStorage 시도
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
          // dataSerializer를 사용하여 역직렬화 및 검증
          const data = dataSerializer.deserializeData(stored) as T
          this.memoryCache = data
          return data
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error)
      }
    }

    return this.memoryCache
  }

  async saveData(data: T): Promise<boolean> {
    // 메모리 캐시 업데이트
    this.memoryCache = data

    // localStorage 저장 시도
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // dataSerializer를 사용하여 직렬화
        const jsonData = dataSerializer.serializeData(data as MockData)
        localStorage.setItem(this.storageKey, jsonData)
        return true
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
        return false
      }
    }

    return false
  }

  isReady(): boolean {
    return true
  }

  getStorageInfo() {
    const hasLocalStorage = typeof window !== 'undefined' && window.localStorage
    return {
      type: (hasLocalStorage ? 'localStorage' : 'memory') as const,
      location: hasLocalStorage ? `localStorage:${this.storageKey}` : 'memory'
    }
  }
}

// 데이터 저장소 팩토리 함수
export function createDataStore<T = any>(fileName: string = 'mockStorage.json'): PersistentDataStore<T> {
  const env = getEnvironmentInfo()
  
  if (env.isServer) {
    return new ServerDataStore<T>(fileName)
  } else {
    return new BrowserDataStore<T>(fileName)
  }
}

// MockData 전용 데이터 저장소 팩토리
export function createMockDataStore(fileName: string = 'mockStorage.json'): PersistentDataStore<MockData> {
  return createDataStore<MockData>(fileName)
}

// 기본 인스턴스 생성
export const defaultDataStore = createMockDataStore()

// 환경 정보 exports
export { getEnvironmentInfo as getDataStoreEnvironmentInfo }

// 데이터 타입 및 유틸리티 re-export
export { dataSerializer, type MockData } from './dataTypes'
