<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Carbon\Carbon;

class ClinicsTableSeeder extends Seeder
{
    public function run()
    {
        $clinics = [
            [
                'corporate_name'   => 'Clínica Saúde Total LTDA',
                'fantasy_name'     => 'Saúde Total',
                'cnpj'             => '12345678000101',
                'regional'         => 'São Paulo',
                'inauguration_date'=> '2010-05-12',
                'is_active'        => true,
            ],
            [
                'corporate_name'   => 'Clínica Bem Viver LTDA',
                'fantasy_name'     => 'Bem Viver',
                'cnpj'             => '98765432000199',
                'regional'         => 'Rio de Janeiro',
                'inauguration_date'=> '2015-08-22',
                'is_active'        => true,
            ],
        ];

        foreach ($clinics as $clinic) {
            DB::table('clinics')->insert([
                'id'               => Uuid::uuid4()->toString(),
                'corporate_name'   => $clinic['corporate_name'],
                'fantasy_name'     => $clinic['fantasy_name'],
                'cnpj'             => $clinic['cnpj'],
                'regional'         => $clinic['regional'],
                'inauguration_date'=> $clinic['inauguration_date'],
                'is_active'        => $clinic['is_active'],
                'created_at'       => Carbon::now(),
                'updated_at'       => Carbon::now(),
            ]);
        }
    }
}
