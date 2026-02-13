<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RequestLoggingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        // Log incoming request (only in production for security monitoring)
        if (app()->environment('production')) {
            $this->logRequest($request);
        }

        $response = $next($request);

        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2); // Convert to milliseconds

        // Log response details
        $this->logResponse($request, $response, $duration);

        return $response;
    }

    /**
     * Log incoming request details
     */
    protected function logRequest(Request $request): void
    {
        $logData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => optional($request->user())->id,
            'timestamp' => now()->toISOString(),
        ];

        // Log sensitive endpoints with more detail
        if ($this->isSensitiveEndpoint($request)) {
            $logData['headers'] = $this->sanitizeHeaders($request->headers->all());
        }

        Log::channel('security')->info('API Request', $logData);
    }

    /**
     * Log response details
     */
    protected function logResponse(Request $request, Response $response, float $duration): void
    {
        $logData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'status' => $response->getStatusCode(),
            'duration_ms' => $duration,
            'user_id' => optional($request->user())->id,
            'ip' => $request->ip(),
        ];

        // Log different levels based on status code
        if ($response->getStatusCode() >= 500) {
            Log::error('API Error Response', $logData);
        } elseif ($response->getStatusCode() >= 400) {
            Log::warning('API Client Error', $logData);
        } elseif ($duration > 2000) { // Log slow responses (>2 seconds)
            Log::warning('Slow API Response', $logData);
        } else {
            Log::info('API Response', $logData);
        }
    }

    /**
     * Check if the endpoint is sensitive and requires detailed logging
     */
    protected function isSensitiveEndpoint(Request $request): bool
    {
        $sensitivePatterns = [
            'api/login',
            'api/register',
            'api/logout',
            'api/admin/*',
            'api/settings/*',
            'api/reports/*',
        ];

        foreach ($sensitivePatterns as $pattern) {
            if ($request->is($pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Sanitize headers to remove sensitive information
     */
    protected function sanitizeHeaders(array $headers): array
    {
        $sensitiveHeaders = [
            'authorization',
            'cookie',
            'x-api-key',
            'x-auth-token',
        ];

        foreach ($sensitiveHeaders as $header) {
            if (isset($headers[$header])) {
                $headers[$header] = ['[REDACTED]'];
            }
        }

        return $headers;
    }
}