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
        $specialties = Specialty::all();
        return response()->json($specialties);
    }
}