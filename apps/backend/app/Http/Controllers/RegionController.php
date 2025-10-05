<?php

namespace App\Http\Controllers;


use App\Region;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class RegionController extends Controller
{
    public function index(): JsonResponse
    {
        $regions = Region::all(); // ou orderBy('label') se quiser
        return response()->json($regions);
    }
}
