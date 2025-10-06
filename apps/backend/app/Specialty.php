<?php
namespace App;

use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false; // Indica que a chave primária não é auto-incremento
    protected $keyType = 'string'; // Define o tipo da chave primária como string (UUID)

    protected $fillable = [
        'name',
        'id' // Inclua 'id' se estiver gerando no backend antes de salvar
    ];

    /**
     * Relacionamento N:M com Clinic.
     */
    public function clinics()
    {
        return $this->belongsToMany(Clinic::class, 'clinic_specialty', 'specialty_id', 'clinic_id');
    }
}