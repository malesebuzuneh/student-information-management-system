<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enhanced Rate Limiting
        $this->configureRateLimiting();
        
        // Query Optimization
        $this->configureQueryOptimization();
        
        // Security Headers
        $this->configureSecurityHeaders();
    }

    /**
     * Configure rate limiting for different endpoints
     */
    protected function configureRateLimiting(): void
    {
        // General API rate limiting
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
        });

        // Authentication endpoints (more restrictive)
        RateLimiter::for('auth', function (Request $request) {
            return [
                Limit::perMinute(5)->by($request->ip()),
                Limit::perHour(20)->by($request->ip()),
            ];
        });

        // Admin endpoints (higher limits for authenticated admins)
        RateLimiter::for('admin', function (Request $request) {
            if ($request->user() && $request->user()->role === 'admin') {
                return Limit::perMinute(120)->by($request->user()->id);
            }
            return Limit::perMinute(30)->by($request->ip());
        });

        // Student/Instructor endpoints
        RateLimiter::for('user', function (Request $request) {
            if ($request->user()) {
                return Limit::perMinute(90)->by($request->user()->id);
            }
            return Limit::perMinute(30)->by($request->ip());
        });

        // Report generation (more restrictive due to resource usage)
        RateLimiter::for('reports', function (Request $request) {
            return [
                Limit::perMinute(10)->by(optional($request->user())->id ?: $request->ip()),
                Limit::perHour(50)->by(optional($request->user())->id ?: $request->ip()),
            ];
        });
    }

    /**
     * Configure query optimization and monitoring
     */
    protected function configureQueryOptimization(): void
    {
        // Log slow queries in development
        if (app()->environment('local')) {
            DB::listen(function ($query) {
                if ($query->time > 1000) { // Log queries taking more than 1 second
                    Log::warning('Slow Query Detected', [
                        'sql' => $query->sql,
                        'bindings' => $query->bindings,
                        'time' => $query->time . 'ms'
                    ]);
                }
            });
        }

        // Enable query log for debugging (only in development)
        if (app()->environment('local') && config('app.debug')) {
            DB::enableQueryLog();
        }
    }

    /**
     * Configure security headers
     */
    protected function configureSecurityHeaders(): void
    {
        // This will be handled by middleware, but we can set defaults here
        if (app()->environment('production')) {
            // Force HTTPS in production
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
