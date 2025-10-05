<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Carbon\Carbon;
use Faker\Factory as Faker;

class ClinicsAndSpecialtiesSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Pega todas as especialidades existentes
        $specialties = DB::table('specialties')->pluck('id')->toArray();
        if (empty($specialties)) {
            $this->command->info("Nenhuma especialidade encontrada. Rode primeiro a seed de especialidades.");
            return;
        }

        // Pega todas as regiões existentes
        $regions = DB::table('regions')->pluck('id')->toArray();
        if (empty($regions)) {
            $this->command->info("Nenhuma região encontrada. Rode primeiro a seed de regiões.");
            return;
        }

        // Quantidade de clínicas que você quer criar
        $numClinics = 80;

        // Pega todos os CNPJs já existentes para evitar conflito
        $existingCNPJs = DB::table('clinics')->pluck('cnpj')->toArray();

        for ($i = 0; $i < $numClinics; $i++) {
            $clinicId = Uuid::uuid4()->toString();
            $fantasyName = $faker->company;

            // Gera um CNPJ único
            do {
                $cnpj = $faker->numerify('########0001##'); // ex: 12345678000199
            } while (in_array($cnpj, $existingCNPJs));
            $existingCNPJs[] = $cnpj;

            // Cria a clínica
            DB::table('clinics')->insert([
                'id'                => $clinicId,
                'corporate_name'    => $faker->company . ' LTDA',
                'fantasy_name'      => $fantasyName,
                'cnpj'              => $cnpj,
                'regional'          => $faker->randomElement($regions),
                'inauguration_date' => $faker->date('Y-m-d'),
                'is_active'         => $faker->boolean(80),
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ]);

            // Associa 1–5 especialidades aleatórias sem repetição
            $assignedSpecialties = $faker->randomElements($specialties, rand(1, min(5, count($specialties))));
            $assignedSpecialties = array_unique($assignedSpecialties); // garante que não haja duplicatas

            foreach ($assignedSpecialties as $specId) {
                DB::table('clinic_specialty')->insert([
                    'clinic_id'    => $clinicId,
                    'specialty_id' => $specId,
                ]);
            }

            $this->command->info("Clínica '{$fantasyName}' criada com CNPJ {$cnpj} e " . count($assignedSpecialties) . " especialidades.");
        }

        $this->command->info("Seed concluída: {$numClinics} clínicas criadas com sucesso.");
    }
}
