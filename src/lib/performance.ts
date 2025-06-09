// Performance measurement utilities for FitnessWebApp
export class PerformanceLogger {
  private static instance: PerformanceLogger
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger()
    }
    return PerformanceLogger.instance
  }

  startTimer(label: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      this.metrics.set(label, performance.now())
      console.time(label)
    }
  }

  endTimer(label: string): number | null {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = this.metrics.get(label)
      if (startTime) {
        const duration = performance.now() - startTime
        console.timeEnd(label)
        console.log(`⚡ Performance: ${label} completed in ${duration.toFixed(2)}ms`)
        this.metrics.delete(label)
        return duration
      }
    }
    return null
  }

  measureAsync<T>(label: string, asyncFn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startTimer(label)
      try {
        const result = await asyncFn()
        this.endTimer(label)
        resolve(result)
      } catch (error) {
        this.endTimer(label)
        reject(error)
      }
    })
  }

  logNavigation(from: string, to: string): void {
    console.log(`🚀 Navigation: ${from} → ${to} at ${new Date().toISOString()}`)
  }

  logRoleUpdate(role: string, duration?: number): void {
    const message = duration 
      ? `👤 Role Update: Set to '${role}' in ${duration.toFixed(2)}ms`
      : `👤 Role Update: Set to '${role}'`
    console.log(message)
  }
}

export const performanceLogger = PerformanceLogger.getInstance()
