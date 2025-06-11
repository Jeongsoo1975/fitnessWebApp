import * as fs from 'fs'
import * as path from 'path'

// 로그 레벨 정의
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// 로그 설정
interface LoggerConfig {
  logLevel: LogLevel
  maxFileSize: number // bytes
  maxFiles: number
  enableConsole: boolean
}

// 기본 설정
const defaultConfig: LoggerConfig = {
  logLevel: LogLevel.DEBUG,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  enableConsole: true
}

class Logger {
  private config: LoggerConfig
  private logsDir: string

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.logsDir = path.join(process.cwd(), 'logs')
    
    // logs 디렉토리가 없으면 생성
    this.ensureLogsDirectory()
  }

  private ensureLogsDirectory(): void {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create logs directory:', error)
    }
  }

  private getCurrentDateString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0] // YYYY-MM-DD 형식
  }

  private getCurrentTimeString(): string {
    const now = new Date()
    return now.toISOString().replace('T', ' ').replace('Z', '')
  }

  private getLogFileName(): string {
    const dateString = this.getCurrentDateString()
    return `app-${dateString}.log`
  }

  private getLogFilePath(): string {
    return path.join(this.logsDir, this.getLogFileName())
  }

  private maskSensitiveData(message: string): string {
    // 민감한 정보 마스킹 처리
    let maskedMessage = message
    
    // 이메일 부분 마스킹 (첫 3자만 표시)
    maskedMessage = maskedMessage.replace(
      /([a-zA-Z0-9._%+-]{3})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '$1***@$2'
    )
    
    // 비밀번호, 토큰 등 마스킹
    maskedMessage = maskedMessage.replace(
      /(password|token|secret|key)[\s]*[:=][\s]*[^\s,}]+/gi,
      '$1: ***'
    )
    
    // Clerk 사용자 ID 마스킹 (앞 4자만 표시)
    maskedMessage = maskedMessage.replace(
      /user_[a-zA-Z0-9]{4}[a-zA-Z0-9]+/g,
      (match) => match.substring(0, 9) + '***'
    )
    
    return maskedMessage
  }

  private formatLogMessage(level: string, message: string, context?: any): string {
    const timestamp = this.getCurrentTimeString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level}] ${message}${contextStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.logLevel
  }

  private rotateLogIfNeeded(): void {
    try {
      const logFilePath = this.getLogFilePath()
      
      if (fs.existsSync(logFilePath)) {
        const stats = fs.statSync(logFilePath)
        
        if (stats.size > this.config.maxFileSize) {
          // 기존 파일들을 순서대로 이름 변경
          const dateString = this.getCurrentDateString()
          const baseName = `app-${dateString}`
          
          for (let i = this.config.maxFiles - 1; i > 0; i--) {
            const oldFile = path.join(this.logsDir, `${baseName}.${i}.log`)
            const newFile = path.join(this.logsDir, `${baseName}.${i + 1}.log`)
            
            if (fs.existsSync(oldFile)) {
              if (i + 1 > this.config.maxFiles) {
                fs.unlinkSync(oldFile) // 오래된 파일 삭제
              } else {
                fs.renameSync(oldFile, newFile)
              }
            }
          }
          
          // 현재 파일을 .1로 이름 변경
          const rotatedFile = path.join(this.logsDir, `${baseName}.1.log`)
          fs.renameSync(logFilePath, rotatedFile)
        }
      }
    } catch (error) {
      console.error('Log rotation failed:', error)
    }
  }

  private writeToFile(formattedMessage: string): void {
    try {
      this.rotateLogIfNeeded()
      
      const logFilePath = this.getLogFilePath()
      const maskedMessage = this.maskSensitiveData(formattedMessage)
      
      fs.appendFileSync(logFilePath, maskedMessage + '\n', 'utf8')
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private log(level: LogLevel, levelName: string, message: string, context?: any): void {
    if (!this.shouldLog(level)) {
      return
    }

    const formattedMessage = this.formatLogMessage(levelName, message, context)
    
    // 파일에 로그 저장
    this.writeToFile(formattedMessage)
    
    // 콘솔에도 출력 (설정에 따라)
    if (this.config.enableConsole) {
      const consoleMethod = level === LogLevel.ERROR ? console.error :
                          level === LogLevel.WARN ? console.warn :
                          console.log
      consoleMethod(formattedMessage)
    }
  }

  error(message: string, context?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, context)
  }

  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, context)
  }

  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, context)
  }

  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context)
  }

  // API별 로거 생성 헬퍼
  createApiLogger(apiName: string) {
    return {
      error: (message: string, context?: any) => 
        this.error(`[${apiName}] ${message}`, context),
      warn: (message: string, context?: any) => 
        this.warn(`[${apiName}] ${message}`, context),
      info: (message: string, context?: any) => 
        this.info(`[${apiName}] ${message}`, context),
      debug: (message: string, context?: any) => 
        this.debug(`[${apiName}] ${message}`, context)
    }
  }
}

// 전역 로거 인스턴스
export const logger = new Logger()

// API별 로거 팩토리
export const createApiLogger = (apiName: string) => logger.createApiLogger(apiName)

// 기존 console.log 대체용 헬퍼 함수들
export const logError = (message: string, context?: any) => logger.error(message, context)
export const logWarn = (message: string, context?: any) => logger.warn(message, context)
export const logInfo = (message: string, context?: any) => logger.info(message, context)
export const logDebug = (message: string, context?: any) => logger.debug(message, context)

export default logger
