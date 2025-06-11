// 환경 감지 유틸리티 함수들
interface EnvironmentInfo {
  isServer: boolean
  isBrowser: boolean
  isEdgeRuntime: boolean
  canAccessFileSystem: boolean
}

// 환경 정보 캐시 (성능 최적화)
let environmentCache: EnvironmentInfo | null = null

/**
 * 서버 환경인지 확인 (SSR, API Routes, etc.)
 */
function isServerEnvironment(): boolean {
  try {
    return typeof window === 'undefined'
  } catch {
    return true
  }
}

/**
 * 브라우저 환경인지 확인
 */
function isBrowserEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined'
  } catch {
    return false
  }
}

/**
 * Edge Runtime 환경인지 확인
 */
function isEdgeRuntime(): boolean {
  try {
    return typeof process !== 'undefined' && 
           process.env && 
           process.env.NEXT_RUNTIME === 'edge'
  } catch {
    return false
  }
}

/**
 * 파일 시스템 접근 가능한지 확인
 */
function canAccessFileSystem(): boolean {
  try {
    return isServerEnvironment() && 
           !isEdgeRuntime() && 
           typeof process !== 'undefined' && 
           typeof require !== 'undefined'
  } catch {
    return false
  }
}

/**
 * 현재 환경 정보를 반환 (캐싱됨)
 */
function getEnvironmentInfo(): EnvironmentInfo {
  if (environmentCache === null) {
    environmentCache = {
      isServer: isServerEnvironment(),
      isBrowser: isBrowserEnvironment(),
      isEdgeRuntime: isEdgeRuntime(),
      canAccessFileSystem: canAccessFileSystem()
    }
  }
  return environmentCache
}

// 동적 모듈 로딩 시스템
type FileSystemModule = {
  existsSync: (path: string) => boolean
  mkdirSync: (path: string, options?: { recursive?: boolean }) => void
  statSync: (path: string) => { size: number }
  appendFileSync: (path: string, data: string, encoding?: string) => void
  unlinkSync: (path: string) => void
  renameSync: (oldPath: string, newPath: string) => void
}

type PathModule = {
  join: (...paths: string[]) => string
}

// 모듈 로딩 캐시
let fsModuleCache: FileSystemModule | null | 'loading' = null
let pathModuleCache: PathModule | null | 'loading' = null

/**
 * fs 모듈을 동적으로 로딩
 */
async function loadFileSystemModule(): Promise<FileSystemModule | null> {
  if (fsModuleCache === 'loading') {
    while (fsModuleCache === 'loading') {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    return fsModuleCache
  }

  if (fsModuleCache !== null) {
    return fsModuleCache
  }

  const env = getEnvironmentInfo()
  
  if (!env.canAccessFileSystem) {
    fsModuleCache = null
    return null
  }

  fsModuleCache = 'loading'

  try {
    const fs = await import('fs')
    const fsModule: FileSystemModule = {
      existsSync: fs.existsSync,
      mkdirSync: fs.mkdirSync,
      statSync: fs.statSync,
      appendFileSync: fs.appendFileSync,
      unlinkSync: fs.unlinkSync,
      renameSync: fs.renameSync
    }
    
    fsModuleCache = fsModule
    return fsModule
  } catch (error) {
    console.warn('Failed to load fs module:', error)
    fsModuleCache = null
    return null
  }
}

/**
 * path 모듈을 동적으로 로딩
 */
async function loadPathModule(): Promise<PathModule | null> {
  if (pathModuleCache === 'loading') {
    while (pathModuleCache === 'loading') {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    return pathModuleCache
  }

  if (pathModuleCache !== null) {
    return pathModuleCache
  }

  const env = getEnvironmentInfo()
  
  if (!env.canAccessFileSystem) {
    pathModuleCache = null
    return null
  }

  pathModuleCache = 'loading'

  try {
    const path = await import('path')
    const pathModule: PathModule = {
      join: path.join
    }
    
    pathModuleCache = pathModule
    return pathModule
  } catch (error) {
    console.warn('Failed to load path module:', error)
    pathModuleCache = null
    return null
  }
}

/**
 * process.cwd() 안전 호출
 */
function safeGetCurrentWorkingDirectory(): string {
  try {
    return typeof process !== 'undefined' && process.cwd ? process.cwd() : ''
  } catch {
    return ''
  }
}

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
  maxFileSize: number
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

// 로그 히스토리 아이템
interface LogHistoryItem {
  timestamp: string
  level: string
  message: string
  context?: any
}

/**
 * 브라우저 환경용 Logger 클래스
 */
class BrowserLogger {
  private config: LoggerConfig
  private logHistory: LogHistoryItem[] = []
  private readonly maxHistorySize = 100

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  private getCurrentTimeString(): string {
    const now = new Date()
    return now.toISOString().replace('T', ' ').replace('Z', '')
  }

  private maskSensitiveData(message: string): string {
    let maskedMessage = message
    
    maskedMessage = maskedMessage.replace(
      /([a-zA-Z0-9._%+-]{3})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '$1***@$2'
    )
    
    maskedMessage = maskedMessage.replace(
      /(password|token|secret|key)[\s]*[:=][\s]*[^\s,}]+/gi,
      '$1: ***'
    )
    
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

  private addToHistory(level: string, message: string, context?: any): void {
    const historyItem: LogHistoryItem = {
      timestamp: this.getCurrentTimeString(),
      level,
      message: this.maskSensitiveData(message),
      context
    }

    this.logHistory.push(historyItem)

    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }
  }

  private log(level: LogLevel, levelName: string, message: string, context?: any): void {
    if (!this.shouldLog(level)) {
      return
    }

    const formattedMessage = this.formatLogMessage(levelName, message, context)
    
    this.addToHistory(levelName, message, context)
    
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

  getLogHistory(): LogHistoryItem[] {
    return [...this.logHistory]
  }

  clearHistory(): void {
    this.logHistory = []
  }
}

/**
 * 서버 환경용 FileLogger 클래스
 */
class FileLogger {
  private config: LoggerConfig
  private logsDir: string
  private fsModule: FileSystemModule | null = null
  private pathModule: PathModule | null = null
  private initialized = false

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.logsDir = ''
    
    this.initializeAsync()
  }

  private async initializeAsync(): Promise<void> {
    try {
      this.fsModule = await loadFileSystemModule()
      this.pathModule = await loadPathModule()
      
      if (this.pathModule && this.fsModule) {
        const cwd = safeGetCurrentWorkingDirectory()
        this.logsDir = this.pathModule.join(cwd, 'logs')
        await this.ensureLogsDirectory()
      }
      
      this.initialized = true
    } catch (error) {
      console.warn('FileLogger initialization failed, falling back to console mode:', error)
      this.initialized = true
    }
  }

  private async ensureLogsDirectory(): Promise<void> {
    if (!this.fsModule || !this.logsDir) return
    
    try {
      if (!this.fsModule.existsSync(this.logsDir)) {
        this.fsModule.mkdirSync(this.logsDir, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create logs directory:', error)
    }
  }

  private getCurrentDateString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0]
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
    if (!this.pathModule || !this.logsDir) return ''
    return this.pathModule.join(this.logsDir, this.getLogFileName())
  }

  private maskSensitiveData(message: string): string {
    let maskedMessage = message
    
    maskedMessage = maskedMessage.replace(
      /([a-zA-Z0-9._%+-]{3})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '$1***@$2'
    )
    
    maskedMessage = maskedMessage.replace(
      /(password|token|secret|key)[\s]*[:=][\s]*[^\s,}]+/gi,
      '$1: ***'
    )
    
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

  private async writeToFile(formattedMessage: string): Promise<void> {
    if (!this.fsModule || !this.initialized) {
      return
    }
    
    try {
      const logFilePath = this.getLogFilePath()
      if (!logFilePath) return
      
      const maskedMessage = this.maskSensitiveData(formattedMessage)
      this.fsModule.appendFileSync(logFilePath, maskedMessage + '\n', 'utf8')
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private async log(level: LogLevel, levelName: string, message: string, context?: any): Promise<void> {
    if (!this.shouldLog(level)) {
      return
    }

    const formattedMessage = this.formatLogMessage(levelName, message, context)
    
    if (this.config.enableConsole) {
      const consoleMethod = level === LogLevel.ERROR ? console.error :
                          level === LogLevel.WARN ? console.warn :
                          console.log
      consoleMethod(formattedMessage)
    }
    
    this.writeToFile(formattedMessage).catch(error => {
      console.error('Background file write failed:', error)
    })
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

  isInitialized(): boolean {
    return this.initialized
  }

  canWriteToFile(): boolean {
    return this.fsModule !== null && this.initialized
  }
}

// Logger 팩토리 시스템
type Logger = BrowserLogger | FileLogger

let globalLoggerInstance: Logger | null = null

function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  const env = getEnvironmentInfo()
  
  if (env.isBrowser) {
    return new BrowserLogger(config)
  } else {
    return new FileLogger(config)
  }
}

function getGlobalLogger(): Logger {
  if (globalLoggerInstance === null) {
    globalLoggerInstance = createLogger()
  }
  return globalLoggerInstance
}

// Export API (기존 호환성 유지)
export const logger = getGlobalLogger()
export const createApiLogger = (apiName: string) => getGlobalLogger().createApiLogger(apiName)
export const logError = (message: string, context?: any) => getGlobalLogger().error(message, context)
export const logWarn = (message: string, context?: any) => getGlobalLogger().warn(message, context)
export const logInfo = (message: string, context?: any) => getGlobalLogger().info(message, context)
export const logDebug = (message: string, context?: any) => getGlobalLogger().debug(message, context)

export default getGlobalLogger()
export { createLogger }
export const getLoggerEnvironmentInfo = () => getEnvironmentInfo()
