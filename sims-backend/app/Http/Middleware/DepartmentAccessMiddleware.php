<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Department;
use Symfony\Component\HttpFoundation\Response;

class DepartmentAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        // Admin users have access to all departments
        if ($user && $user->role === 'admin') {
            return $next($request);
        }
        
        // Department users should only access their own department
        if ($user && $user->role === 'department') {
            // Get the department ID from the route parameter
            $departmentId = $request->route('id') ?? $request->route('department_id');
            
            if ($departmentId) {
                // Check if user can access this department
                $canAccess = false;
                
                // Check if user is linked to this department
                if ($user->department_id == $departmentId) {
                    $canAccess = true;
                }
                
                // Check if user is instructor head of this department
                if (!$canAccess && $user->instructor) {
                    $department = Department::where('head_instructor_id', $user->instructor->id)->first();
                    if ($department && $department->id == $departmentId) {
                        $canAccess = true;
                    }
                }
                
                if (!$canAccess) {
                    return response()->json([
                        'error' => 'Access denied',
                        'message' => 'You can only access your own department data'
                    ], 403);
                }
            }
        }
        
        return $next($request);
    }
}