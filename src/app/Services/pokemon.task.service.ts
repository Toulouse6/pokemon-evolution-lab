import { Injectable } from '@angular/core';
import { TaskService } from './tasks.service';
import { Pokemon } from '../Models/pokemon.model';
import { DUMMY_POKEMONS } from '../dummy-pokemons';
import { AudioService } from './audio.service';
import { Task } from '../Models/task.model';
import { PokemonService } from './pokemon.service';


@Injectable({
    providedIn: 'root'
})

export class PokemonTaskService {

    private pokemons: Pokemon[] = [];

    // Constructor
    constructor(
        private taskService: TaskService,
        private audioService: AudioService,
        private pokemonService: PokemonService
    ) {
        this.initializePokemons();
    }


    // Initialize Pokemons
    private initializePokemons() {
        const savedPokemons = localStorage.getItem('pokemons');
        if (savedPokemons) {
            this.pokemons = JSON.parse(savedPokemons);
        } else {
            this.pokemons = [...DUMMY_POKEMONS];
            this.pokemonService.savePokemons();
        }
    }


    // Check conditions (evolution, task completion)
    checkConditions(pokemon: Pokemon): void {
        this.pokemonService.checkAndUpdatePokemon(pokemon.id);
    }


    // Get Pokemon tasks based on evolution
    getSelectedPokemonTasks(pokemonId: string, currentStage: number): Task[] {
        const stage1Tasks = this.taskService.getPokemonTasks(pokemonId, 1).slice(0, 2);
        const stage2Tasks = this.taskService.getPokemonTasks(pokemonId, 2).slice(0, 2);
        const stage3Tasks = this.taskService.getPokemonTasks(pokemonId, 3).slice(0, 2);

        if (currentStage === 1) {
            return stage1Tasks;
        } else if (currentStage === 2) {
            return [...stage1Tasks, ...stage2Tasks];
        } else {
            return [...stage1Tasks, ...stage2Tasks, ...stage3Tasks];
        }
    }


    // Complete Task
    completeTask(pokemonId: string, taskId: string): void {

        this.taskService.removeTask(taskId);

        this.audioService.taskCompleteEffect('completed.mp3');

        const pokemon = this.pokemonService.getPokemon(pokemonId);

        if (pokemon) {
            const health = pokemon.health ?? 0;
            const happiness = pokemon.happiness ?? 0;

            const evolutionStage = pokemon.gif === pokemon.thirdGif ? 3 :
                pokemon.gif === pokemon.secondGif ? 2 : 1;
            const tasks = this.taskService.getPokemonTasks(pokemonId, evolutionStage);

            if (tasks.length === 0) {

                // First Evolution
                if (
                    !pokemon.evolutionSoundPlayed &&
                    health >= 1000 &&
                    happiness >= 1000 &&
                    evolutionStage === 1 &&
                    pokemon.secondEvolution
                ) {
                    pokemon.name = pokemon.secondEvolution ?? pokemon.name;
                    pokemon.gif = pokemon.secondGif ?? pokemon.gif;
                    pokemon.avatar = pokemon.secondAvatar ?? pokemon.avatar;
                    pokemon.attack = pokemon.secondAttack ?? pokemon.attack;
                    pokemon.defense = pokemon.secondDefense ?? pokemon.defense;
                    pokemon.message = pokemon.message ?? pokemon.message;

                    // Play evolution sound
                    this.audioService.taskCompleteEffect('evolution2.mp3');
                    pokemon.evolutionSoundPlayed = true;

                    // Clear message after evolution
                    pokemon.message = '';

                    // Save Pokémon state
                    this.pokemonService.savePokemons();
                    this.pokemonService.saveSelectedPokemonState(pokemon);
                }

                // Second Evolution
                else if (
                    pokemon.evolutionSoundPlayed &&
                    health >= 2000 &&
                    happiness >= 2000 &&
                    evolutionStage === 2 &&
                    pokemon.thirdEvolution
                ) {
                    pokemon.name = pokemon.thirdEvolution ?? pokemon.name;
                    pokemon.gif = pokemon.thirdGif ?? pokemon.gif;
                    pokemon.avatar = pokemon.thirdAvatar ?? pokemon.avatar;
                    pokemon.attack = pokemon.thirdAttack ?? pokemon.attack;
                    pokemon.defense = pokemon.thirdDefense ?? pokemon.defense;

                    // Play evolution sound
                    this.audioService.taskCompleteEffect('evolution2.mp3');
                    pokemon.evolutionSoundPlayed = false; // Reset evolution sound state

                    // Clear message after evolution
                    pokemon.message = '';

                    // Save Pokémon state
                    this.pokemonService.savePokemons();
                    this.pokemonService.saveSelectedPokemonState(pokemon);
                }

                // Fully evolved state
                if (health === 2500 && happiness === 2500 && tasks.length === 0) {

                    pokemon.isFullyEvolved = true; // Mark as fully evolved
                    this.audioService.playSoundEffect('magic-mallet.mp3');
                } else {
                    pokemon.isFullyEvolved = false;
                }

                this.pokemonService.savePokemons();

            } else {
                // If tasks remain, show a message based on health & happiness
                if (health >= 1000 && happiness >= 1000 && evolutionStage === 1) {
                    pokemon.message = "You need to complete all tasks to evolve to the second stage!";
                } else if (health >= 2000 && happiness >= 2000 && evolutionStage === 2) {
                    pokemon.message = "You need to complete all tasks to evolve to the third stage!";
                } else if (health === 2500 && happiness === 2500) {
                    pokemon.message = "You need to complete all tasks to fully evolve!";
                } else {
                    pokemon.message = '';
                }
            }

            this.pokemonService.savePokemons();
        }
    }


}
