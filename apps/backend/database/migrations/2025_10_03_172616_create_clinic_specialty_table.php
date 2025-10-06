<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateClinicSpecialtyTable extends Migration
{
    public function up()
    {
        Schema::create('clinic_specialty', function (Blueprint $table) {
            // Referência à tabela clinics
            $table->uuid('clinic_id');
            $table->foreign('clinic_id')->references('id')->on('clinics')->onDelete('cascade');

            // Referência à tabela specialties
            $table->uuid('specialty_id');
            $table->foreign('specialty_id')->references('id')->on('specialties')->onDelete('cascade');

            // Chave primária composta
            $table->primary(['clinic_id', 'specialty_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('clinic_specialty');
    }
}