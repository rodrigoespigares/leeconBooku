<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ErrorController extends Controller
{
    public function error404(Request $request)
    {
        return response()->json(['error' => 'Página no encontrada'], 404);
    }
}
