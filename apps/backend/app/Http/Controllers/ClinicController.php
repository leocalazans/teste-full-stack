<?php

namespace App\Http\Controllers;

use App\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Para usar UUIDs
use Illuminate\Validation\Rule;
use Ramsey\Uuid\Uuid;
use Illuminate\Http\JsonResponse;

class ClinicController extends Controller
{
    /**
     * Helper para obter os dados validados.
     */
    protected function validateData(Request $request, $isUpdate = false)
    {
        $data = $request->json()->all();

        // Se specialties vier como array de objetos, extrai só os IDs
        if (!empty($data['specialties']) && is_array($data['specialties'])) {
            $data['specialties'] = collect($data['specialties'])
                ->map(function ($item) {
                    return is_array($item) && isset($item['id']) ? $item['id'] : $item;
                })
                ->filter()
                ->toArray();
        } else {
            $data['specialties'] = [];
        }

        // Valida se cada specialty existe na tabela
        foreach ($data['specialties'] as $specialtyId) {
            $exists = \DB::table('specialties')->where('id', $specialtyId)->exists();
            if (!$exists) {
                return response()->json(['errors' => ["specialties" => ["Especialidade inválida: $specialtyId"]]], 422);
            }
        }

        $rules = [
            'corporate_name'    => 'required|string|max:255',
            'fantasy_name'      => 'required|string|max:255',
            'cnpj'              => [
                'required',
                'string',
                'size:14',
                $isUpdate
                    ? \Illuminate\Validation\Rule::unique('clinics', 'cnpj')->ignore($request->route('clinic')->id)
                    : \Illuminate\Validation\Rule::unique('clinics', 'cnpj'),
            ],
            'regional'          => 'required|string|exists:regions,id',
            'inauguration_date' => 'nullable|date',
            'is_active'         => 'boolean',
            'specialties'       => 'required|array|min:1',
            'specialties.*'     => 'required|string|size:36',
        ];

        $validator = validator($data, $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return $data;
    }




    // --- Métodos do CRUD ---

    /**
     * GET /api/clinics - Retorna uma lista de Clínicas.
     */
    public function index()
    {
        // Carrega as especialidades para retornar no objeto completo
        $clinics = Clinic::with('specialties','region')->get();
        return response()->json($clinics);
    }

    /**
     * POST /api/clinics - Cria uma nova Clínica.
     */
    public function store(Request $request) 
    {
        $data = $this->validateData($request);

        if ($data instanceof JsonResponse) {
            return $data; 
        }
    
        $specialties = $data['specialties'];
        unset($data['specialties']);

        $data['id'] = Uuid::uuid4()->toString(); 
        $clinic = Clinic::create($data);

        $clinic->specialties()->sync($specialties);

        return response()->json($clinic->load('specialties'), 201);
    }

    /**
     * GET /api/clinics/{clinic} - Mostra uma Clínica específica.
     */
    public function show(Clinic $clinic)
    {
        return response()->json($clinic->load('specialties', 'region'));
    }

    /**
     * PUT/PATCH /api/clinics/{clinic} - Atualiza uma Clínica.
     */
    public function update(Request $request, Clinic $clinic)
    {
        $data = $this->validateData($request, true);

        if (!$data || !is_array($data)) {
            return response()->json(['error' => 'Dados inválidos ou não enviados'], 422);
        }
        // Separa os specialties do resto
        $specialties = $data['specialties'] ?? [];
        unset($data['specialties']);

        // Atualiza só os campos da clínica
        $clinic->update($data);

        // Atualiza a pivot specialties
        $clinic->specialties()->sync($specialties);

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