<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    use HasFactory;

    protected $fillable = [
        'uid_user',
        'id_grupo',
        'pregunta',
        'respuestas',
        'correcta',
        'fecha',
    ];


}
