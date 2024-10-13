import { Injectable } from "@angular/core";
import { Task } from "../Models/task.model";
import { TASKS } from "../dummy.tasks.component";
import { Pokemon } from "../Models/pokemon.model";

@Injectable({
    providedIn: 'root'
})

export class TaskService {

    private tasks: Task[] = [];

    // Constructor
    constructor() {
        this.initializeTasks();
    }

    // Initialize tasks
    private initializeTasks() {
        const tasks = localStorage.getItem('tasks');
        if (tasks) {
            this.tasks = JSON.parse(tasks);
        } else {
            this.tasks = [...TASKS];
        }
    }

    // Get Tasks
    getPokemonTasks(pokemonId: string, evolutionStage: number): Task[] {
        return this.tasks.filter(task => task.pokemonId === pokemonId && task.evolutionStage === evolutionStage);
    }


    // Remove a task by ID
    removeTask(id: string) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
        }
    }


    // Save Tasks
    private saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }


    // Evolutions
    evolveToSecondStage(pokemon: Pokemon): void {
        pokemon.name = pokemon.secondEvolution ?? pokemon.name;
        pokemon.gif = pokemon.secondGif ?? pokemon.gif;
        pokemon.avatar = pokemon.secondAvatar ?? pokemon.avatar;
        pokemon.attack = pokemon.secondAttack ?? pokemon.attack;
        pokemon.defense = pokemon.secondDefense ?? pokemon.defense;
        pokemon.evolutionSoundPlayed = true;
    }

    evolveToThirdStage(pokemon: Pokemon): void {
        pokemon.name = pokemon.thirdEvolution ?? pokemon.name;
        pokemon.gif = pokemon.thirdGif ?? pokemon.gif;
        pokemon.avatar = pokemon.thirdAvatar ?? pokemon.avatar;
        pokemon.attack = pokemon.thirdAttack ?? pokemon.attack;
        pokemon.defense = pokemon.thirdDefense ?? pokemon.defense;
        pokemon.evolutionSoundPlayed = false;
    }


}

