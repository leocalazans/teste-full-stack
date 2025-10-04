<?php

namespace App\Http\Controllers;

use App\Specialty;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    /**
     * Lista todas as especialidades no formato que o frontend espera.
     */
    public function index()
    {
        $specialties = Specialty::all(['id as value', 'name as label']);

        // O seu frontend espera um array, vamos retornar isso.
        return response()->json($specialties);
    }
}