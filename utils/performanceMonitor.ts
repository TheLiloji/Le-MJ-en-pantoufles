// Performance monitoring utility for React Native app
interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = __DEV__;

  /**
   * Start measuring performance for a specific operation
   */
  startMeasure(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };

    this.metrics.set(name, metric);
    console.log(`🚀 [Performance] Started measuring: ${name}`);
  }

  /**
   * End measuring performance for a specific operation
   */
  endMeasure(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ [Performance] No metric found for: ${name}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    console.log(`✅ [Performance] ${name}: ${duration}ms`, metric.metadata);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`🐌 [Performance] Slow operation detected: ${name} took ${duration}ms`);
    }

    return duration;
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.startMeasure(name, metadata);
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution time
   */
  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startMeasure(name, metadata);
    try {
      const result = fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.duration !== undefined);
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: string): PerformanceMetric[] {
    return this.getMetrics().filter(metric => metric.name.startsWith(category));
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    if (metrics.length === 0) {
      return 'No performance metrics available';
    }

    const report = [
      '📊 Performance Report',
      '==================',
      '',
    ];

    // Group by category
    const categories = new Map<string, PerformanceMetric[]>();
    metrics.forEach(metric => {
      const category = metric.name.split(':')[0];
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(metric);
    });

    categories.forEach((categoryMetrics, category) => {
      report.push(`📁 ${category.toUpperCase()}`);
      report.push('─'.repeat(category.length + 2));

      categoryMetrics
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .forEach(metric => {
          const duration = metric.duration || 0;
          const status = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '✅';
          report.push(`  ${status} ${metric.name}: ${duration}ms`);
          
          if (metric.metadata) {
            Object.entries(metric.metadata).forEach(([key, value]) => {
              report.push(`    └─ ${key}: ${value}`);
            });
          }
        });

      const avgDuration = categoryMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / categoryMetrics.length;
      report.push(`  📈 Average: ${avgDuration.toFixed(2)}ms`);
      report.push('');
    });

    const totalOperations = metrics.length;
    const slowOperations = metrics.filter(m => (m.duration || 0) > 1000).length;
    const avgDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalOperations;

    report.push('📈 SUMMARY');
    report.push('─────────');
    report.push(`Total operations: ${totalOperations}`);
    report.push(`Slow operations (>1s): ${slowOperations}`);
    report.push(`Average duration: ${avgDuration.toFixed(2)}ms`);

    return report.join('\n');
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    console.log('🧹 [Performance] Metrics cleared');
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔧 [Performance] Monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Log current memory usage (React Native specific)
   */
  logMemoryUsage(): void {
    if (!this.isEnabled) return;

    // This is a simplified version - in production you might want to use
    // more sophisticated memory tracking libraries
    if (global.performance && global.performance.memory) {
      const memory = (global.performance.memory as any);
      console.log('💾 [Performance] Memory usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startMeasure = (name: string, metadata?: Record<string, any>) => 
  performanceMonitor.startMeasure(name, metadata);

export const endMeasure = (name: string) => 
  performanceMonitor.endMeasure(name);

export const measureAsync = <T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>) => 
  performanceMonitor.measureAsync(name, fn, metadata);

export const measureSync = <T>(name: string, fn: () => T, metadata?: Record<string, any>) => 
  performanceMonitor.measureSync(name, fn, metadata);

// Export types
export type { PerformanceMetric };