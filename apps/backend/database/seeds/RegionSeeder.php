<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Carbon\Carbon;
use App\Region;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         DB::table('regions')->insert([
            ['id' => Uuid::uuid4()->toString(), 'name' => 'Alto Tiete', 'label' => 'Alto tietê'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'Interior', 'label' => 'Interior'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'ES', 'label' => 'Espírito Santo'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'SP Interior', 'label' => 'SP Interior'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'SP', 'label' => 'SP'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'MG', 'label' => 'MG'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'Nacional', 'label' => 'Nacional'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'SP CAV', 'label' => 'SP CAV'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'RJ', 'label' => 'RJ'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'SP1', 'label' => 'SP1'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'SP2', 'label' => 'SP2'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'NE1', 'label' => 'NE1'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'NE2', 'label' => 'NE2'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'SUL', 'label' => 'SUL'],
            ['id' => Uuid::uuid4()->toString(), 'name' => 'Norte', 'label' => 'Vale do Paraíba'],

        ]);
    }
}
