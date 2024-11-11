import { Request, Response, NextFunction, Router, Application } from 'express';
import newrelic from 'newrelic';
import * as path from 'path';

interface BusinessMetrics {
    userId?: string | number;
    societyId?: string | number;
    tenantId?: string | number;
    organizationId?: string | number;
    subscriptionTier?: string;
    userRole?: string;
    feature?: string;
    module?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string | number;
}

interface PerformanceMetrics {
    dbQueryTime?: number;
    cacheHit?: boolean;
    cacheMissRate?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    externalApiCalls?: number;
    externalApiTime?: number;
    responseSize?: number;
}

interface RouteMetrics {
    path: string;
    method: string;
    timestamp: number;
    duration: number;
    statusCode: number;
    error?: string;
    params?: Record<string, any>;
    query?: Record<string, any>;
    body?: Record<string, any>;
    responseSize?: number;
    business?: BusinessMetrics;
    performance?: PerformanceMetrics;
    region?: string;
    datacenter?: string;
    environment?: string;
    apiVersion?: string;
    clientVersion?: string;
    clientPlatform?: string;
}

interface TrackerOptions {
    excludePaths?: string[];
    sensitiveKeys?: string[];
    samplingRate?: number;
    enableBodyTracking?: boolean;
    customMetricPrefix?: string;
    errorStatuses?: number[];
    enablePerformanceMetrics?: boolean;
    enableBusinessMetrics?: boolean;
    businessMetricKeys?: (keyof BusinessMetrics)[];
    apdexTarget?: number;
    slowThreshold?: number;
    verySlowThreshold?: number;
}

export class NewRelicTracker {
    private static metrics: RouteMetrics[] = [];
    private static options: TrackerOptions = {
        excludePaths: ['/health', '/metrics'],
        sensitiveKeys: ['password', 'token', 'secret', 'authorization'],
        samplingRate: 1.0,
        enableBodyTracking: false,
        customMetricPrefix: 'Custom/Route',
        errorStatuses: [400, 401, 403, 404, 429, 500, 502, 503, 504],
        enablePerformanceMetrics: true,
        enableBusinessMetrics: true,
        businessMetricKeys: ['userId', 'societyId', 'userRole'],
        apdexTarget: 500, // ms
        slowThreshold: 2000, // ms
        verySlowThreshold: 5000 // ms
    };

    private static performanceData: Map<string, PerformanceMetrics> = new Map();
    private static businessData: Map<string, BusinessMetrics> = new Map();

    static initialize(app: Application, customOptions?: TrackerOptions) {
        // Merge custom options with defaults
        this.options = { ...this.options, ...customOptions };

        // Apply middleware automatically
        app.use(this.requestMiddleware());
        app.use(this.responseMiddleware());
        app.use(this.errorHandler());

        // Automatically discover and instrument all routes
        this.discoverAndInstrumentRoutes(app);

        // Start background metrics reporting
        this.startMetricsReporting();


        return app;
    }


    private static requestMiddleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            if (this.shouldSkipTracking(req)) {
                return next();
            }

            const startTime = Date.now();
            const txnName = this.getTransactionName(req);
            const requestId = this.getRequestId(req);

            // Start New Relic transaction
            newrelic.setTransactionName(txnName);

            // Track initial memory usage
            const initialMemUsage = process.memoryUsage();

            // Add request context
            this.addRequestAttributes(req);

            // Add business context from headers or token
            this.extractAndSetBusinessContext(req);

            // Track performance metrics
            if (this.options.enablePerformanceMetrics) {
                this.trackPerformanceMetrics(req, initialMemUsage);
            }

            // Attach timing data to request
            (req as any).__newrelicStartTime = startTime;
            (req as any).__newrelicMemUsage = initialMemUsage;

            next();
        };
    }

    private static responseMiddleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            if (this.shouldSkipTracking(req)) {
                return next();
            }

            const originalEnd = res.end;
            const originalJson = res.json;
            const requestId = this.getRequestId(req);

            // Override response.json
            res.json = function (body: any) {
                const sanitizedBody = NewRelicTracker.sanitizeData(body);
                const responseSize = JSON.stringify(sanitizedBody).length;

                NewRelicTracker.setPerformanceContext(req, { responseSize });

                return originalJson.call(this, body);
            };

            // Override response.end
            res.end = function (chunk?: any, encoding?: any, callback?: any) {
                const duration = Date.now() - (req as any).__newrelicStartTime;
                const currentMemUsage = process.memoryUsage();
                const initialMemUsage = (req as any).__newrelicMemUsage;

                // Calculate memory impact
                const memoryImpact = Object.keys(currentMemUsage).reduce((acc, key) => {
                    return acc + (currentMemUsage[key as keyof NodeJS.MemoryUsage] -
                        initialMemUsage[key as keyof NodeJS.MemoryUsage]);
                }, 0);

                const metric: RouteMetrics = {
                    path: req.baseUrl + req.path,
                    method: req.method,
                    timestamp: Date.now(),
                    duration,
                    statusCode: res.statusCode,
                    params: req.params,
                    query: NewRelicTracker.sanitizeData(req.query),
                    business: NewRelicTracker.businessData.get(requestId),
                    performance: {
                        ...NewRelicTracker.performanceData.get(requestId),
                        memoryUsage: memoryImpact,
                        cpuUsage: process.cpuUsage().user
                    },
                    region: process.env.REGION || 'unknown',
                    datacenter: process.env.DATACENTER || 'unknown',
                    environment: process.env.NODE_ENV || 'development',
                    apiVersion: process.env.API_VERSION || '1.0',
                    clientVersion: req.headers['x-client-version'] as string,
                    clientPlatform: req.headers['x-client-platform'] as string
                };

                NewRelicTracker.recordEnhancedMetrics(metric);

                // Cleanup request data
                NewRelicTracker.businessData.delete(requestId);
                NewRelicTracker.performanceData.delete(requestId);

                return originalEnd.call(this, chunk, encoding, callback);
            };

            next();
        };
    }

    static setBusinessContext(req: Request, data: Partial<BusinessMetrics>) {
        const requestId = this.getRequestId(req);
        const existing = this.businessData.get(requestId) || {};
        this.businessData.set(requestId, { ...existing, ...data });

        // Add business context to New Relic
        newrelic.addCustomAttributes({
            ...Object.fromEntries(
                Object.entries(data).map(([key, value]) => [`business.${key}`, value])
            )
        });
    }

    static setPerformanceContext(req: Request, data: Partial<PerformanceMetrics>) {
        const requestId = this.getRequestId(req);
        const existing = this.performanceData.get(requestId) || {};
        this.performanceData.set(requestId, { ...existing, ...data });

        // Add performance context to New Relic
        newrelic.addCustomAttributes({
            ...Object.fromEntries(
                Object.entries(data).map(([key, value]) => [`performance.${key}`, value])
            )
        });
    }

    private static extractAndSetBusinessContext(req: Request) {
        // Extract from authorization header or token
        const authHeader = req.headers.authorization;
        // if (authHeader) {
        //     try {
        //         // Assuming JWT token
        //         const token = authHeader.split(' ')[1];
        //         const decoded = this.decodeToken(token);

        //         if (decoded) {
        //             this.setBusinessContext(req, {
        //                 userId: decoded.userId,
        //                 societyId: decoded.societyId,
        //                 tenantId: decoded.tenantId,
        //                 organizationId: decoded.organizationId,
        //                 userRole: decoded.role
        //             });
        //         }
        //     } catch (error) {
        //         // Silent fail - don't block the request
        //         console.warn('Failed to decode auth token for metrics', error);
        //     }
        // }

        // Extract from headers
        const businessContext: Partial<BusinessMetrics> = {};
        const headerPrefix = 'x-business-';

        Object.entries(req.headers).forEach(([key, value]) => {
            if (key.startsWith(headerPrefix)) {
                const metricKey = key.replace(headerPrefix, '') as keyof BusinessMetrics;
                if (this.options.businessMetricKeys?.includes(metricKey)) {
                    businessContext[metricKey] = value as string;
                }
            }
        });

        if (Object.keys(businessContext).length > 0) {
            this.setBusinessContext(req, businessContext);
        }
    }

    private static trackPerformanceMetrics(req: Request, initialMemUsage: NodeJS.MemoryUsage) {
        const requestId = this.getRequestId(req);

        // Track database queries
        const originalQuery = (req as any).db?.query;
        if (originalQuery) {
            (req as any).db.query = async (...args: any[]) => {
                const queryStart = Date.now();
                try {
                    const result = await originalQuery.apply((req as any).db, args);
                    const queryTime = Date.now() - queryStart;

                    this.setPerformanceContext(req, {
                        dbQueryTime: (this.performanceData.get(requestId)?.dbQueryTime || 0) + queryTime
                    });

                    return result;
                } catch (error) {
                    throw error;
                }
            };
        }

        const originalCacheGet = (req as any).cache?.get;
        if (originalCacheGet) {
            (req as any).cache.get = async (...args: any[]) => {
                const cacheStart = Date.now();
                try {
                    const result = await originalCacheGet.apply((req as any).cache, args);
                    const cacheHit = result !== null;

                    this.setPerformanceContext(req, {
                        cacheHit,
                        cacheMissRate: cacheHit ? 0 : 1
                    });

                    return result;
                } catch (error) {
                    throw error;
                }
            };
        }

        // Track external API calls
        const originalFetch = global.fetch;
        global.fetch = async (...args: Parameters<typeof fetch>) => {
            const apiStart = Date.now();
            try {
                const result = await originalFetch(...args);
                const apiTime = Date.now() - apiStart;

                this.setPerformanceContext(req, {
                    externalApiCalls: (this.performanceData.get(requestId)?.externalApiCalls || 0) + 1,
                    externalApiTime: (this.performanceData.get(requestId)?.externalApiTime || 0) + apiTime
                });

                return result;
            } catch (error) {
                throw error;
            }
        };
    }

    static errorHandler() {
        return (err: Error, req: Request, res: Response, next: NextFunction) => {
            const metric: RouteMetrics = {
                path: req.baseUrl + req.path,
                method: req.method,
                timestamp: Date.now(),
                duration: Date.now() - ((req as any).__newrelicStartTime || Date.now()),
                statusCode: res.statusCode,
                error: err.message,
            };

            // Add custom attributes for the error context
            newrelic.addCustomAttributes({
                'error.url': req.url,
                'error.method': req.method,
                'error.status': res.statusCode,
                'error.name': err.name,
                'error.params': JSON.stringify(req.params),
                'error.query': JSON.stringify(this.sanitizeData(req.query)),
            });

            // Record the error with New Relic
            newrelic.noticeError(err);

            // Record error metrics
            this.recordMetric(metric);
            newrelic.incrementMetric(`Errors/${req.method}${req.baseUrl}${req.path}`);

            next(err);
        };
    }

    private static recordEnhancedMetrics(metric: RouteMetrics) {
        this.metrics.push(metric);

        const baseMetricName = `${this.options.customMetricPrefix}${metric.path}`;

        // Record basic timing metric
        newrelic.recordMetric(baseMetricName, metric.duration);

        // Record Apdex score
        const apdexScore = this.calculateApdex(metric.duration);
        newrelic.recordMetric(`${baseMetricName}/apdex`, apdexScore);

        // Record business metrics
        if (metric.business) {
            Object.entries(metric.business).forEach(([key, value]) => {
                if (value) {
                    newrelic.recordMetric(`${baseMetricName}/by_${key}/${value}`, metric.duration);
                }
            });
        }

        // Record performance metrics
        if (metric.performance) {
            Object.entries(metric.performance).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    newrelic.recordMetric(`${baseMetricName}/performance/${key}`, value);
                }
            });
        }

        // Record error metrics
        if (this.options?.errorStatuses?.includes(metric.statusCode)) {
            newrelic.incrementMetric(`${baseMetricName}/errors`);

            // Record error by business context
            if (metric.business) {
                Object.entries(metric.business).forEach(([key, value]) => {
                    if (value) {
                        newrelic.incrementMetric(`${baseMetricName}/errors/by_${key}/${value}`);
                    }
                });
            }
        }

        // Record platform metrics
        if (metric.clientPlatform) {
            newrelic.recordMetric(`${baseMetricName}/platform/${metric.clientPlatform}`, metric.duration);
        }

        // Record version metrics
        if (metric.clientVersion) {
            newrelic.recordMetric(`${baseMetricName}/version/${metric.clientVersion}`, metric.duration);
        }
    }

    private static calculateApdex(duration: number): number {
        if (duration <= (this.options?.apdexTarget ?? 0)) {
            return 1; // Satisfied
        } else if (duration <= (this.options?.apdexTarget ?? 0) * 4) {
            return 0.5; // Tolerating
        }
        return 0; // Frustrated
    }

    private static discoverAndInstrumentRoutes(app: Application) {
        const routers = this.findRouters(app);

        routers.forEach(router => {
            this.instrumentRouter(router);
        });
    }

    private static findRouters(app: Application): Router[] {
        const routers: Router[] = [];

        const searchRouters = (layer: any) => {
            if (layer.handle && layer.handle.stack) {
                routers.push(layer.handle);
            }
            if (layer.route) {
                routers.push(layer.route);
            }
            if (layer.stack) {
                layer.stack.forEach(searchRouters);
            }
        };

        app._router.stack.forEach(searchRouters);
        return routers;
    }

    private static instrumentRouter(router: Router) {
        const stack = (router as any).stack;

        stack.forEach((layer: any) => {
            if (layer.route) {
                const route = layer.route;
                Object.keys(route.methods).forEach((method: string) => {
                    const handlers = route.stack.map((handler: any) => handler.handle);
                    route.stack = route.stack.map((handler: any, index: number) => ({
                        ...handler,
                        handle: this.wrapHandler(handlers[index], route.path, method)
                    }));
                });
            }
        });
    }

    private static wrapHandler(handler: Function, routePath: string, method: string) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const segmentName = `${method.toUpperCase()} ${routePath}`;

            return newrelic.startSegment(segmentName, true, async () => {
                try {
                    return await handler(req, res, next);
                } catch (error) {
                    // Add context before reporting error
                    newrelic.addCustomAttributes({
                        'error.route': routePath,
                        'error.method': method,
                        'error.type': error instanceof Error ? error.name : 'Unknown',
                    });

                    // Notice error with correct signature
                    if (error instanceof Error) {
                        newrelic.noticeError(error);
                    } else {
                        newrelic.noticeError(new Error(String(error)));
                    }

                    next(error);
                }
            });
        };
    }

    private static startMetricsReporting() {
        setInterval(() => {
            this.reportMetrics();
        }, 60000); // Report metrics every minute
    }

    private static reportMetrics() {
        const now = Date.now();
        const recentMetrics = this.metrics.filter(m => now - m.timestamp < 60000);

        if (recentMetrics.length === 0) return;

        // Calculate and report aggregate metrics
        const routeGroups = this.groupBy(recentMetrics, 'path');

        for (const [route, metrics] of Object.entries(routeGroups)) {
            const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
            const errorCount = metrics.filter(m => this.options.errorStatuses?.includes(m.statusCode)).length;
            const successRate = (metrics.length - errorCount) / metrics.length;

            newrelic.recordMetric(`${this.options.customMetricPrefix}${route}/avgDuration`, avgDuration);
            newrelic.recordMetric(`${this.options.customMetricPrefix}${route}/errorRate`, errorCount / metrics.length);
            newrelic.recordMetric(`${this.options.customMetricPrefix}${route}/successRate`, successRate);
            newrelic.recordMetric(`${this.options.customMetricPrefix}${route}/throughput`, metrics.length);
        }

        // Clear old metrics
        this.metrics = this.metrics.filter(m => now - m.timestamp < 60000);
    }

    private static shouldSkipTracking(req: Request): boolean {
        if (this.options.samplingRate !== undefined && Math.random() > this.options.samplingRate) return true;
        return this.options.excludePaths?.some(p => req.path.startsWith(p)) ?? false;
    }

    private static sanitizeData(data: any): any {
        if (!data) return data;

        const sanitized = { ...data };
        this.options.sensitiveKeys?.forEach(key => {
            if (key in sanitized) {
                sanitized[key] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    private static addRequestAttributes(req: Request) {
        newrelic.addCustomAttributes({
            'request.path': req.path,
            'request.method': req.method,
            'request.ip': req.ip || '',
            'request.id': this.getRequestId(req),
            'user.agent': req.get('user-agent') || '',
            'request.referer': req.get('referer') || '',
            'request.protocol': req.protocol,
            'request.hostname': req.hostname,
        });
    }

    private static getRequestId(req: Request): string {
        const requestId = req.headers['x-request-id'];
        return Array.isArray(requestId) ? requestId.join(',') : requestId?.toString() || '';
    }

    private static getTransactionName(req: Request): string {
        return `${req.method} ${req.baseUrl}${req.path}`;
    }

    private static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
        return array.reduce((groups, item) => {
            const groupKey = String(item[key]);
            groups[groupKey] = groups[groupKey] || [];
            groups[groupKey].push(item);
            return groups;
        }, {} as Record<string, T[]>);
    }

    private static recordMetric(metric: RouteMetrics) {
        this.metrics.push(metric);

        const metricName = `${this.options.customMetricPrefix}${metric.path}`;
        newrelic.recordMetric(metricName, metric.duration);

        if (this.options.errorStatuses?.includes(metric.statusCode)) {
            newrelic.incrementMetric(`${metricName}/errors`);
        }
    }
}