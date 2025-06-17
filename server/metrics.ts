import { Request, Response } from 'express';
import { storage } from './storage';

interface Metrics {
  total_users: number;
  active_chat_sessions: number;
  total_messages: number;
  lawyers_count: number;
  uptime_seconds: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  response_time_ms: number;
  error_rate_percent: number;
}

class MetricsCollector {
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private totalResponseTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  recordRequest(responseTime: number, isError: boolean = false) {
    this.requestCount++;
    this.totalResponseTime += responseTime;
    if (isError) {
      this.errorCount++;
    }
  }

  async collectMetrics(): Promise<Metrics> {
    const users = Array.from((storage as any).users.values());
    const sessions = Array.from((storage as any).chatSessions.values());
    const messages = Array.from((storage as any).chatMessages.values());
    const lawyers = Array.from((storage as any).lawyers.values());

    const activeSessions = sessions.filter(session => session.status === 'active');
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);

    // Error rate calculation
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    
    // Average response time
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;

    return {
      total_users: users.length,
      active_chat_sessions: activeSessions.length,
      total_messages: messages.length,
      lawyers_count: lawyers.length,
      uptime_seconds: uptime,
      memory_usage_mb: memoryUsageMB,
      cpu_usage_percent: 0, // Would need more complex calculation for real CPU usage
      response_time_ms: avgResponseTime,
      error_rate_percent: errorRate
    };
  }

  // Prometheus format metrics
  async getPrometheusMetrics(): Promise<string> {
    const metrics = await this.collectMetrics();
    
    return `
# HELP lawhelp_total_users Total number of registered users
# TYPE lawhelp_total_users gauge
lawhelp_total_users ${metrics.total_users}

# HELP lawhelp_active_chat_sessions Number of active chat sessions
# TYPE lawhelp_active_chat_sessions gauge
lawhelp_active_chat_sessions ${metrics.active_chat_sessions}

# HELP lawhelp_total_messages Total number of chat messages
# TYPE lawhelp_total_messages counter
lawhelp_total_messages ${metrics.total_messages}

# HELP lawhelp_lawyers_count Total number of registered lawyers
# TYPE lawhelp_lawyers_count gauge
lawhelp_lawyers_count ${metrics.lawyers_count}

# HELP lawhelp_uptime_seconds Application uptime in seconds
# TYPE lawhelp_uptime_seconds counter
lawhelp_uptime_seconds ${metrics.uptime_seconds}

# HELP lawhelp_memory_usage_mb Memory usage in megabytes
# TYPE lawhelp_memory_usage_mb gauge
lawhelp_memory_usage_mb ${metrics.memory_usage_mb}

# HELP lawhelp_response_time_ms Average response time in milliseconds
# TYPE lawhelp_response_time_ms gauge
lawhelp_response_time_ms ${metrics.response_time_ms}

# HELP lawhelp_error_rate_percent Error rate percentage
# TYPE lawhelp_error_rate_percent gauge
lawhelp_error_rate_percent ${metrics.error_rate_percent}

# HELP lawhelp_requests_total Total number of HTTP requests
# TYPE lawhelp_requests_total counter
lawhelp_requests_total ${this.requestCount}
`.trim();
  }
}

export const metricsCollector = new MetricsCollector();

// Metrics endpoint handler
export async function metricsHandler(req: Request, res: Response) {
  try {
    const prometheusMetrics = await metricsCollector.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  } catch (error) {
    console.error('Error collecting metrics:', error);
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
}

// Health check endpoint
export function healthHandler(req: Request, res: Response) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - metricsCollector['startTime']) / 1000),
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.json(health);
}