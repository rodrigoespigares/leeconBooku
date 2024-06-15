<?php

namespace App\Http\Controllers;

use App\Repository\ExamenRepository;
use App\Utils\Utils;
use DateTime;
use Illuminate\Http\Request;

class ExamenController extends Controller
{
    protected $repository;
    public function __construct(ExamenRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $json["head"]=Utils::statusMessage(202,"Se ha creado el examen correctamente");
        $data["uid"]=$request->uid;
        $data["id_grupo"]=$request->id_grupo;
        $data["fecha"]=new DateTime($request->fecha);
        $data["tiempo"]=new DateTime($request->tiempo);
        $data["contrasena"]=$request->contrasena;

        

        $data["examen"]=["preguntas"=>$request->preguntas,"respuestas"=>$request->respuestas,"solucion"=>$request->solucion];

        $json["head"]['id'] = $this->repository->crear($data);
        

        return response()->json($json);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        $data=$this->repository->getExamen($id);

        $json["head"]=Utils::statusMessage(202,"Aquí esta su examen!");
        $json["data"]= $data;

        return response()->json($json);
    }

    /**
     * Update the specified resource in storage.    
     */
    public function update(string $id, Request $request)
    {
        $json["head"]=Utils::statusMessage(202,"El reto ha sido editado");

        $data["uid"]=$request->uid;
        $data["id_grupo"]=$request->id_grupo;
        $data["fecha"]=new DateTime($request->fecha);
        $data["tiempo"]=new DateTime($request->tiempo);
        $data["contrasena"]=$request->contrasena;

        $data["examen"]=["preguntas"=>$request->preguntas,"respuestas"=>$request->respuestas,"solucion"=>$request->solucion];

        $this->repository->editExamen($id,$data);

        return response()->json($json);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $json["head"]=Utils::statusMessage(202,"El examen ha sido borrado");
        $this->repository->removeExamen($id);

        return response()->json($json);
    }
}
