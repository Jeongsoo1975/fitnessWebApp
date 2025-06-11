result.confidence = confidence
      return result
    }
  }

  // 2단계: 이메일 정확 매칭 (높은 신뢰도)
  if (normalizedEmail) {
    const stepCandidates: string[] = []
    matchedRequests = requests.filter(request => {
      const requestEmail = normalizationUtils.normalizeEmail(request.memberId)
      stepCandidates.push(requestEmail)
      return requestEmail === normalizedEmail
    })
    
    result.debugInfo.matchSteps.push({
      step: 2,
      method: 'email-exact',
      query: normalizedEmail,
      matches: matchedRequests.length,
      candidates: stepCandidates
    })

    if (matchedRequests.length > 0) {
      matchMethod = 'email-exact'
      confidence = 'high'
      
      matchingLogger.info('Found requests by email exact match', {
        normalizedEmail,
        matchCount: matchedRequests.length,
        matchedIds: matchedRequests.map(r => r.id)
      })
      
      result.requests = matchedRequests
      result.method = matchMethod
      result.confidence = confidence
      return result
    }
  }

  // 3단계: 이메일 사용자명 매칭 (중간 신뢰도)
  if (emailUsername) {
    const stepCandidates: string[] = []
    matchedRequests = requests.filter(request => {
      const requestUsername = normalizationUtils.extractEmailUsername(request.memberId)
      if (requestUsername) {
        stepCandidates.push(requestUsername)
        return requestUsername === emailUsername
      }
      return false
    })
    
    result.debugInfo.matchSteps.push({
      step: 3,
      method: 'email-username',
      query: emailUsername,
      matches: matchedRequests.length,
      candidates: stepCandidates
    })

    if (matchedRequests.length > 0) {
      matchMethod = 'email-username'
      confidence = 'medium'
      
      matchingLogger.info('Found requests by email username match', {
        emailUsername,
        matchCount: matchedRequests.length,
        matchedIds: matchedRequests.map(r => r.id)
      })
      
      result.requests = matchedRequests
      result.method = matchMethod
      result.confidence = confidence
      return result
    }
  }

  // 4단계: Clerk ID 부분 매칭 (중간 신뢰도)
  if (clerkId) {
    const stepCandidates: string[] = []
    matchedRequests = requests.filter(request => {
      stepCandidates.push(request.memberId)
      return normalizationUtils.fuzzyMatch(request.memberId, clerkId, 0.8)
    })
    
    result.debugInfo.matchSteps.push({
      step: 4,
      method: 'clerk-id-fuzzy',
      query: clerkId,
      matches: matchedRequests.length,
      candidates: stepCandidates
    })

    if (matchedRequests.length > 0) {
      matchMethod = 'clerk-id-fuzzy'
      confidence = 'medium'
      
      matchingLogger.info('Found requests by Clerk ID fuzzy match', {
        clerkId,
        matchCount: matchedRequests.length,
        matchedIds: matchedRequests.map(r => r.id)
      })
      
      result.requests = matchedRequests
      result.method = matchMethod
      result.confidence = confidence
      return result
    }
  }

  // 5단계: 이메일 부분 매칭 (낮은 신뢰도)
  if (email) {
    const stepCandidates: string[] = []
    matchedRequests = requests.filter(request => {
      stepCandidates.push(request.memberId)
      return normalizationUtils.fuzzyMatch(request.memberId, email, 0.7)
    })
    
    result.debugInfo.matchSteps.push({
      step: 5,
      method: 'email-fuzzy',
      query: email,
      matches: matchedRequests.length,
      candidates: stepCandidates
    })

    if (matchedRequests.length > 0) {
      matchMethod = 'email-fuzzy'
      confidence = 'low'
      
      matchingLogger.info('Found requests by email fuzzy match', {
        email,
        matchCount: matchedRequests.length,
        matchedIds: matchedRequests.map(r => r.id)
      })
      
      result.requests = matchedRequests
      result.method = matchMethod
      result.confidence = confidence
      return result
    }
  }

  // 6단계: 전체 데이터 디버깅을 위한 로깅
  matchingLogger.warn('No matching requests found - Full debug info', {
    searchCriteria: {
      originalClerkId: clerkId,
      originalEmail: email,
      normalizedClerkId,
      normalizedEmail,
      emailUsername
    },
    availableRequests: requests.map(r => ({
      id: r.id,
      memberId: r.memberId,
      normalizedMemberId: normalizationUtils.normalizeString(r.memberId),
      extractedUsername: normalizationUtils.extractEmailUsername(r.memberId),
      status: r.status,
      trainerId: r.trainerId
    })),
    totalRequests: requests.length,
    allMatchSteps: result.debugInfo.matchSteps
  })

  result.requests = []
  result.method = 'no-match'
  result.confidence = 'none'
  return result
}

/**
 * 레거시 호환성을 위한 래퍼 함수
 */
export function findMemberRequestsWithImprovedMatching(
  requests: MockTrainerMemberRequest[],
  searchCriteria: { clerkId?: string; email?: string }
) {
  const result = improvedFindMemberRequests(requests, searchCriteria)
  
  // 기존 인터페이스와 호환되는 형태로 반환
  return {
    requests: result.requests,
    method: result.method
  }
}

/**
 * 매칭 품질 분석 함수
 */
export function analyzeMatchingQuality(
  requests: MockTrainerMemberRequest[],
  searchCriteria: { clerkId?: string; email?: string }
): {
  quality: 'excellent' | 'good' | 'poor' | 'failed'
  recommendations: string[]
  diagnostics: any
} {
  const result = improvedFindMemberRequests(requests, searchCriteria)
  
  const analysis = {
    quality: 'failed' as 'excellent' | 'good' | 'poor' | 'failed',
    recommendations: [] as string[],
    diagnostics: result.debugInfo
  }

  if (result.confidence === 'high') {
    analysis.quality = 'excellent'
    analysis.recommendations.push('매칭이 정확합니다. 추가 조치가 필요하지 않습니다.')
  } else if (result.confidence === 'medium') {
    analysis.quality = 'good'
    analysis.recommendations.push('매칭이 발견되었지만 확신도가 중간입니다. 데이터 정확성을 확인해주세요.')
  } else if (result.confidence === 'low') {
    analysis.quality = 'poor'
    analysis.recommendations.push('매칭이 발견되었지만 확신도가 낮습니다. 수동 확인을 권장합니다.')
    analysis.recommendations.push('사용자 ID 또는 이메일 주소의 정확성을 확인해주세요.')
  } else {
    analysis.quality = 'failed'
    analysis.recommendations.push('매칭에 실패했습니다. 다음을 확인해주세요:')
    analysis.recommendations.push('1. 요청이 실제로 생성되었는지 확인')
    analysis.recommendations.push('2. 올바른 사용자 ID와 이메일이 사용되었는지 확인')
    analysis.recommendations.push('3. 데이터 동기화 상태 확인')
    
    if (result.debugInfo.totalRequests === 0) {
      analysis.recommendations.push('4. 시스템에 요청 데이터가 없습니다. 데이터 저장 문제일 수 있습니다.')
    }
  }

  return analysis
}

/**
 * 실시간 매칭 성능 모니터링
 */
export class MatchingPerformanceMonitor {
  private matchingStats = {
    totalSearches: 0,
    successfulMatches: 0,
    failedMatches: 0,
    averageSearchTime: 0,
    methodDistribution: {} as Record<string, number>,
    confidenceDistribution: {} as Record<string, number>
  }

  recordSearch(
    searchCriteria: { clerkId?: string; email?: string },
    result: MatchingResult,
    searchTimeMs: number
  ) {
    this.matchingStats.totalSearches++
    
    if (result.requests.length > 0) {
      this.matchingStats.successfulMatches++
    } else {
      this.matchingStats.failedMatches++
    }

    // 평균 검색 시간 업데이트
    this.matchingStats.averageSearchTime = 
      (this.matchingStats.averageSearchTime * (this.matchingStats.totalSearches - 1) + searchTimeMs) / 
      this.matchingStats.totalSearches

    // 메서드 분포 업데이트
    this.matchingStats.methodDistribution[result.method] = 
      (this.matchingStats.methodDistribution[result.method] || 0) + 1

    // 신뢰도 분포 업데이트
    this.matchingStats.confidenceDistribution[result.confidence] = 
      (this.matchingStats.confidenceDistribution[result.confidence] || 0) + 1

    matchingLogger.debug('Matching performance recorded', {
      searchTimeMs,
      method: result.method,
      confidence: result.confidence,
      stats: this.matchingStats
    })
  }

  getStats() {
    return {
      ...this.matchingStats,
      successRate: this.matchingStats.totalSearches > 0 
        ? this.matchingStats.successfulMatches / this.matchingStats.totalSearches 
        : 0
    }
  }

  generateReport() {
    const stats = this.getStats()
    
    return {
      timestamp: new Date().toISOString(),
      performance: {
        totalSearches: stats.totalSearches,
        successRate: `${(stats.successRate * 100).toFixed(1)}%`,
        averageSearchTime: `${stats.averageSearchTime.toFixed(2)}ms`,
        failureRate: `${((1 - stats.successRate) * 100).toFixed(1)}%`
      },
      methodEffectiveness: stats.methodDistribution,
      confidenceDistribution: stats.confidenceDistribution,
      recommendations: this.generateRecommendations(stats)
    }
  }

  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = []

    if (stats.successRate < 0.8) {
      recommendations.push('매칭 성공률이 낮습니다. 데이터 품질을 개선하세요.')
    }

    if (stats.averageSearchTime > 100) {
      recommendations.push('검색 시간이 깁니다. 인덱싱 또는 캐싱을 고려하세요.')
    }

    if (stats.confidenceDistribution.high / stats.totalSearches < 0.6) {
      recommendations.push('높은 신뢰도 매칭이 부족합니다. 데이터 정규화를 개선하세요.')
    }

    return recommendations
  }

  reset() {
    this.matchingStats = {
      totalSearches: 0,
      successfulMatches: 0,
      failedMatches: 0,
      averageSearchTime: 0,
      methodDistribution: {},
      confidenceDistribution: {}
    }
  }
}

// 전역 성능 모니터 인스턴스
export const globalMatchingMonitor = new MatchingPerformanceMonitor()

// 개선된 매칭 함수 (성능 모니터링 포함)
export function findMemberRequestsWithMonitoring(
  requests: MockTrainerMemberRequest[],
  searchCriteria: { clerkId?: string; email?: string }
) {
  const startTime = Date.now()
  const result = improvedFindMemberRequests(requests, searchCriteria)
  const searchTime = Date.now() - startTime

  // 성능 통계 기록
  globalMatchingMonitor.recordSearch(searchCriteria, result, searchTime)

  return {
    requests: result.requests,
    method: result.method,
    confidence: result.confidence,
    debugInfo: result.debugInfo,
    performance: {
      searchTimeMs: searchTime,
      stats: globalMatchingMonitor.getStats()
    }
  }
}

export default {
  improvedFindMemberRequests,
  findMemberRequestsWithImprovedMatching,
  findMemberRequestsWithMonitoring,
  analyzeMatchingQuality,
  normalizationUtils,
  globalMatchingMonitor
}
