<?php

namespace App\Http\Controllers;

use App\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Para usar UUIDs

class ClinicController extends Controller
{
    // ... Métodos de Validação, Helpers, etc ...

    /**
     * Helper para obter os dados validados.
     */
    protected function validateData(Request $request, $isUpdate = false)
    {
        $rules = [
            'corporateName' => 'required|string|max:255',
            'fantasyName' => 'required|string|max:255',
            'cnpj' => 'required|string|size:14|unique:clinics,cnpj' . ($isUpdate ? ',' . $request->route('clinic') : ''),
            'regional' => 'required|string|max:100',
            'inaugurationDate' => 'nullable|date',
            'isActive' => 'boolean',
            'specialties' => 'required|array',
            'specialties.*' => 'required|uuid|exists:specialties,id', // Valida se é um UUID e existe
        ];

        // Mapeia os campos do front-end (camelCase) para o DB (snake_case)
        $validatedData = $request->validate($rules);
        $dbData = [
            'corporate_name' => $validatedData['corporateName'],
            'fantasy_name' => $validatedData['fantasyName'],
            'cnpj' => $validatedData['cnpj'],
            'regional' => $validatedData['regional'],
            'inauguration_date' => $validatedData['inaugurationDate'] ?? null,
            'is_active' => $validatedData['isActive'] ?? true,
        ];

        return array_merge($dbData, ['specialties' => $validatedData['specialties']]);
    }

    // --- Métodos do CRUD ---

    /**
     * GET /api/clinics - Retorna uma lista de Clínicas.
     */
    public function index()
    {
        // Carrega as especialidades para retornar no objeto completo
        $clinics = Clinic::with('specialties')->get();
        return response()->json($clinics);
    }

    /**
     * POST /api/clinics - Cria uma nova Clínica.
     */
    public function store(Request $request)
    {
        $data = $this->validateData($request);

        // Gera o UUID para o Laravel 5.4, se não estiver usando um Trait
        $data['id'] = (string) Str::uuid(); 
        
        $clinic = Clinic::create($data);
        
        // Sincroniza as especialidades (o attach/sync espera um array de IDs)
        $clinic->specialties()->sync($data['specialties']);
        
        // Recarrega para ter as especialidades no objeto de retorno
        return response()->json($clinic->load('specialties'), 201);
    }

    /**
     * GET /api/clinics/{clinic} - Mostra uma Clínica específica.
     */
    public function show(Clinic $clinic)
    {
        return response()->json($clinic->load('specialties'));
    }

    /**
     * PUT/PATCH /api/clinics/{clinic} - Atualiza uma Clínica.
     */
    public function update(Request $request, Clinic $clinic)
    {
        // Passa true para indicar que é uma atualização (para a validação unique do CNPJ)
        $data = $this->validateData($request, true);
        
        $clinic->update($data);
        
        // Sincroniza (adiciona/remove) as especialidades
        $clinic->specialties()->sync($data['specialties']);

        return response()->json($clinic->load('specialties'));
    }

    /**
     * DELETE /api/clinics/{clinic} - Remove uma Clínica.
     */
    public function destroy(Clinic $clinic)
    {
        $clinic->delete();
        // A tabela pivot é limpa automaticamente devido ao onDelete('cascade') na migração.
        return response()->json(null, 204);
    }
}