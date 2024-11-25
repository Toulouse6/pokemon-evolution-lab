import { Injectable } from '@angular/core';
import { Pokemon } from '../Models/pokemon.model';
import { Task } from '../Models/task.model';
import { PokemonService } from './pokemon.service';

@Injectable({
    providedIn: 'root'
})
export class PokemonEvolutionService {

    private pokemons: Pokemon[] = [];

    // constructor
    constructor(
        private pokemonService: PokemonService,
    ) { }


    // PokemonEvolutionService.ts
    animateStats(
        stat: 'attack' | 'defense',
        targetValue: number,
        duration: number,
        startValue: number = 0,
        setDisplayValue: (value: number) => void
    ): void {
        const startTime = performance.now();
        const step = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const value = Math.floor(startValue + progress * (targetValue - startValue));

            setDisplayValue(value);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }


    // Evolving the Pokémon and updating stats
    evolvePokemon(
        pokemon: Pokemon,
        setDisplayAttack: (value: number) => void,
        setDisplayDefense: (value: number) => void
    ): void {
        const { hasEvolved, attack, defense } = this.pokemonService.checkAndUpdatePokemon(pokemon.id);

        if (hasEvolved) {
            // Animate the evolution state
            this.animateStats('attack', attack, 2000, pokemon.attack, setDisplayAttack);
            this.animateStats('defense', defense, 2000, pokemon.defense, setDisplayDefense);

            // Update with new stats
            pokemon.attack = attack;
            pokemon.defense = defense;

            // Save the evolved state
            this.pokemonService.saveSelectedPokemonState(pokemon);
        }
    }


    // Set evolution message based on conditions
    setEvolutionMessage(pokemon: Pokemon, selectedPokemonTasks: Task[]): string {
        const health = pokemon.health || 0;
        const happiness = pokemon.happiness || 0;
        const tasksRemaining = selectedPokemonTasks.length > 0;

        const hasFirstEvolved = pokemon.gif === pokemon.secondGif;
        const hasFinalEvolved = pokemon.gif === pokemon.thirdGif;

        if (tasksRemaining) {
            // Message for evolving from the first to the second stage
            if (!hasFirstEvolved && health >= 1000 && happiness >= 1000 && health < 2000 && happiness < 2000) {
                return "Complete tasks to evolve!";
            }

            // Message for evolving from the second to the third stage
            if (!hasFinalEvolved && health >= 2000 && happiness >= 2000 && health < 2500 && happiness < 2500) {
                return "Almost fully evolved. Finish tasks!";
            }

            // Final message when the Pokémon has fully evolved and maxed out health and happiness
            if (hasFinalEvolved && health === 2500 && happiness === 2500) {
                return "You have reached full health & happiness!<br>Clear tasks for maximum strength!";
            }
        }

        // No tasks or no conditions met
        return '';
    }


    // Check Pokémon conditions (evolution, task completion)
    checkConditions(pokemon: Pokemon): void {
        this.pokemonService.checkAndUpdatePokemon(pokemon.id);
    }


}
