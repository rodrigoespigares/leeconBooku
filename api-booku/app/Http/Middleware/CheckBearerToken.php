<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\BeforeValidException;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class CheckBearerToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token de acceso no proporcionado'], 401);
        }

        // Fetch public keys from Firebase
        $response = Http::get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');

        if (!$response->successful()) {
            return response()->json(['error' => 'No se pudo obtener las claves públicas'], 500);
        }

        $keys = $response->json();

        // Decode the token without verification to extract the header
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return response()->json(['error' => 'Token de acceso inválido'], 401);
        }

        $header = json_decode(base64_decode($tokenParts[0]), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json(['error' => 'Encabezado del token inválido'], 401);
        }

        $kid = $header['kid'] ?? null;
        if (!$kid || !isset($keys[$kid])) {
            return response()->json(['error' => 'Clave pública no encontrada para el token proporcionado'], 401);
        }

        $publicKey = $keys[$kid];

        try {
            // Verify the token using the correct public key
            $decodedToken = JWT::decode($token, new Key($publicKey, 'RS256'));
        } catch (ExpiredException $e) {
            return response()->json(['error' => 'Token de acceso expirado'], 401);
        } catch (SignatureInvalidException $e) {
            return response()->json(['error' => 'Firma del token de acceso no válida'], 401);
        } catch (BeforeValidException $e) {
            return response()->json(['error' => 'El token de acceso no es válido aún'], 401);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token de acceso inválido: ' . $e->getMessage()], 401);
        }

        return $next($request);
    }
}
