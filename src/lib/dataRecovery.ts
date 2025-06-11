Serializer.serializeData(backupData)
            this.fsModule.writeFileSync(this.dataFilePath, serializedData, 'utf8')
          }
          
          result.success = true
          result.source = 'backup'
          result.dataVersion = backupData.version
          result.warnings.push('Data restored from backup')
          
          recoveryLogger.info('Data recovered from backup successfully', {
            dataVersion: backupData.version
          })
          
          return result
        }
      }

      // 3단계: 빈 데이터로 시작
      const emptyData = dataSerializer.createEmptyData()
      
      if (this.fsModule) {
        const serializedData = dataSerializer.serializeData(emptyData)
        this.fsModule.writeFileSync(this.dataFilePath, serializedData, 'utf8')
      }
      
      result.success = true
      result.source = 'empty'
      result.dataVersion = emptyData.version
      result.warnings.push('Started with empty data')
      
      recoveryLogger.info('Initialized with empty data', {
        dataVersion: emptyData.version
      })
      
      return result
    } catch (error) {
      result.errors.push(error.message)
      recoveryLogger.error('Data initialization failed:', error)
      return result
    }
  }

  /**
   * Hot Reload 감지 및 처리
   */
  async handleHotReload(): Promise<boolean> {
    await this.waitForInitialization()
    
    try {
      // Hot Reload 환경에서는 데이터 백업을 생성하여 데이터 손실 방지
      const env = getDataStoreEnvironmentInfo()
      
      if (env.isServer && typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        // 개발 환경에서 자동 백업 생성
        await this.createBackup()
        
        recoveryLogger.info('Hot reload detected, backup created')
        return true
      }
      
      return false
    } catch (error) {
      recoveryLogger.error('Failed to handle hot reload:', error)
      return false
    }
  }

  /**
   * 시스템 상태 진단
   */
  async diagnoseSystem(): Promise<{
    originalFileExists: boolean
    originalFileValid: boolean
    backupCount: number
    latestBackupValid: boolean
    recommendations: string[]
  }> {
    await this.waitForInitialization()
    
    const diagnosis = {
      originalFileExists: false,
      originalFileValid: false,
      backupCount: 0,
      latestBackupValid: false,
      recommendations: [] as string[]
    }

    if (!this.fsModule || !this.pathModule) {
      diagnosis.recommendations.push('파일 시스템에 접근할 수 없습니다')
      return diagnosis
    }

    try {
      // 원본 파일 진단
      if (this.fsModule.existsSync(this.dataFilePath)) {
        diagnosis.originalFileExists = true
        
        try {
          const fileContent = this.fsModule.readFileSync(this.dataFilePath, 'utf8')
          const data = dataSerializer.deserializeData(fileContent)
          const validation = dataSerializer.validateDataIntegrity(data)
          
          diagnosis.originalFileValid = validation.isValid
          
          if (!validation.isValid) {
            diagnosis.recommendations.push('원본 파일에 오류가 있습니다. 백업에서 복구를 고려하세요')
          }
        } catch {
          diagnosis.recommendations.push('원본 파일을 읽을 수 없습니다')
        }
      } else {
        diagnosis.recommendations.push('원본 파일이 존재하지 않습니다')
      }

      // 백업 파일 진단
      if (this.fsModule.existsSync(this.backupDirPath)) {
        const backupFiles = this.fsModule.readdirSync(this.backupDirPath)
          .filter(file => file.endsWith('.json'))
        
        diagnosis.backupCount = backupFiles.length
        
        if (backupFiles.length === 0) {
          diagnosis.recommendations.push('백업 파일이 없습니다. 백업 생성을 권장합니다')
        } else {
          // 최신 백업 검증
          const latestBackup = backupFiles
            .map(file => ({
              name: file,
              path: this.pathModule!.join(this.backupDirPath, file),
              mtime: this.fsModule!.statSync(this.pathModule!.join(this.backupDirPath, file)).mtime
            }))
            .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0]
          
          try {
            const fileContent = this.fsModule.readFileSync(latestBackup.path, 'utf8')
            const data = dataSerializer.deserializeData(fileContent)
            const validation = dataSerializer.validateDataIntegrity(data)
            
            diagnosis.latestBackupValid = validation.isValid
            
            if (!validation.isValid) {
              diagnosis.recommendations.push('최신 백업 파일에 오류가 있습니다')
            }
          } catch {
            diagnosis.recommendations.push('최신 백업 파일을 읽을 수 없습니다')
          }
        }
      }

      // 권장사항 생성
      if (!diagnosis.originalFileExists && diagnosis.backupCount === 0) {
        diagnosis.recommendations.push('데이터 파일과 백업이 모두 없습니다. 시스템을 초기화하세요')
      }
      
      if (diagnosis.originalFileValid && diagnosis.backupCount < this.options.maxBackupFiles) {
        diagnosis.recommendations.push('백업 파일이 부족합니다. 추가 백업 생성을 권장합니다')
      }

    } catch (error) {
      diagnosis.recommendations.push('시스템 진단 중 오류가 발생했습니다')
      recoveryLogger.error('System diagnosis failed:', error)
    }

    return diagnosis
  }

  /**
   * 수동 복구 수행
   */
  async performManualRecovery(source: 'backup' | 'empty' = 'backup'): Promise<RecoveryResult> {
    await this.waitForInitialization()
    
    const result: RecoveryResult = {
      success: false,
      source: 'empty',
      errors: [],
      warnings: []
    }

    try {
      if (source === 'backup') {
        const backupData = await this.restoreFromBackup()
        if (backupData) {
          if (this.fsModule) {
            const serializedData = dataSerializer.serializeData(backupData)
            this.fsModule.writeFileSync(this.dataFilePath, serializedData, 'utf8')
          }
          
          result.success = true
          result.source = 'backup'
          result.dataVersion = backupData.version
          
          recoveryLogger.info('Manual recovery from backup completed')
        } else {
          result.errors.push('백업에서 복구할 수 없습니다')
        }
      } else {
        // 빈 데이터로 초기화
        const emptyData = dataSerializer.createEmptyData()
        
        if (this.fsModule) {
          const serializedData = dataSerializer.serializeData(emptyData)
          this.fsModule.writeFileSync(this.dataFilePath, serializedData, 'utf8')
        }
        
        result.success = true
        result.source = 'empty'
        result.dataVersion = emptyData.version
        
        recoveryLogger.info('Manual recovery with empty data completed')
      }
    } catch (error) {
      result.errors.push(error.message)
      recoveryLogger.error('Manual recovery failed:', error)
    }

    return result
  }

  /**
   * 설정 업데이트
   */
  updateOptions(newOptions: Partial<RecoveryOptions>): void {
    this.options = { ...this.options, ...newOptions }
    recoveryLogger.info('Recovery options updated', { options: this.options })
  }

  /**
   * 시스템 준비 상태 확인
   */
  isReady(): boolean {
    return this.initialized
  }

  /**
   * 백업 목록 조회
   */
  async getBackupList(): Promise<Array<{
    name: string
    size: number
    created: Date
    valid: boolean
  }>> {
    await this.waitForInitialization()
    
    if (!this.fsModule || !this.pathModule) {
      return []
    }

    try {
      const backupFiles = this.fsModule.readdirSync(this.backupDirPath)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = this.pathModule!.join(this.backupDirPath, file)
          const stats = this.fsModule!.statSync(filePath)
          
          let valid = false
          try {
            const fileContent = this.fsModule!.readFileSync(filePath, 'utf8')
            const data = dataSerializer.deserializeData(fileContent)
            const validation = dataSerializer.validateDataIntegrity(data)
            valid = validation.isValid
          } catch {
            valid = false
          }
          
          return {
            name: file,
            size: stats.size,
            created: stats.mtime,
            valid
          }
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime())

      return backupFiles
    } catch (error) {
      recoveryLogger.error('Failed to get backup list:', error)
      return []
    }
  }
}

// 전역 복구 시스템 인스턴스
export const globalRecoverySystem = new DataRecoverySystem()

// 유틸리티 함수들
export const dataRecoveryUtils = {
  /**
   * 시스템 초기화
   */
  initializeDataStore: async (): Promise<RecoveryResult> => {
    return await globalRecoverySystem.initializeData()
  },

  /**
   * 백업 생성
   */
  createBackup: async (data?: MockData): Promise<boolean> => {
    return await globalRecoverySystem.createBackup(data)
  },

  /**
   * 백업에서 복구
   */
  restoreFromBackup: async (): Promise<MockData | null> => {
    return await globalRecoverySystem.restoreFromBackup()
  },

  /**
   * Hot Reload 처리
   */
  handleHotReload: async (): Promise<boolean> => {
    return await globalRecoverySystem.handleHotReload()
  },

  /**
   * 시스템 진단
   */
  diagnoseSystem: async () => {
    return await globalRecoverySystem.diagnoseSystem()
  },

  /**
   * 수동 복구
   */
  performManualRecovery: async (source: 'backup' | 'empty' = 'backup'): Promise<RecoveryResult> => {
    return await globalRecoverySystem.performManualRecovery(source)
  },

  /**
   * 백업 목록 조회
   */
  getBackupList: async () => {
    return await globalRecoverySystem.getBackupList()
  }
}

export default globalRecoverySystem
