<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// API Documentation Route
Route::get('/api/documentation', function () {
    return redirect('/api/documentation/');
});
