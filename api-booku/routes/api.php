<?php

use App\Http\Controllers\ErrorController;
use App\Http\Controllers\ExamenController;
use App\Http\Controllers\LibrosController;
use App\Http\Controllers\RetoController;
use App\Http\Middleware\CheckBearerToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::middleware(['checkBearerToken'])->group(function () {
    
    Route::prefix('examenes')->group(function () {
        Route::get('/show/{id}', [ExamenController::class, 'show']);
        Route::post('/create', [ExamenController::class, 'create']);
        Route::post('/edit/{id}', [ExamenController::class, 'update']);
        Route::get('/delete/{id}', [ExamenController::class, 'destroy']);
    });

    Route::prefix('libro')->group(function () {
        Route::get('/', [LibrosController::class, 'index']);
        Route::post('/create', [LibrosController::class, 'create']);
        Route::get('/show/{id}', [LibrosController::class, 'show']);
        Route::get('/delete/{id}', [LibrosController::class, 'destroy']);
        Route::post('/update/{id}', [LibrosController::class, 'update']);
        Route::get('/edit/{id}', [LibrosController::class, 'edit']);
    });

    Route::prefix('reto')->group(function () {
        Route::get('/', [RetoController::class, 'index']);
        Route::post('/create', [RetoController::class, 'create']);
        Route::get('/show/{id}', [RetoController::class, 'show']);
        Route::get('/delete/{id}', [RetoController::class, 'destroy']);
        Route::post('/update/{id}', [RetoController::class, 'update']);
        Route::get('/edit/{id}', [RetoController::class, 'edit']);
    });
});


Route::fallback([ErrorController::class, 'error404']);