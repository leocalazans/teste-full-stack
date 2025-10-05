<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateClinicsTable extends Migration
{
    public function up()
   {
        Schema::create('clinics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('corporate_name');
            $table->string('fantasy_name');
            $table->string('cnpj')->unique();
            $table->uuid('regional'); 
            $table->date('inauguration_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('regional')
                  ->references('id')
                  ->on('regions')
                  ->onDelete('restrict'); // ou cascade
        });
    }

    public function down()
    {
        Schema::dropIfExists('clinics');
    }
}