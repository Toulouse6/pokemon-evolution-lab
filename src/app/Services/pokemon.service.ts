import { Injectable } from "@angular/core";
import { AudioService } from "./audio.service";
import { TaskService } from "./tasks.service";
import { Pokemon } from "../Models/pokemon.model";
import { DUMMY_POKEMONS } from "../dummy-pokemons";

@Injectable({
    providedIn: 'root'
})

export class PokemonService {

    private pokemons: Pokemon[] = [];
    private selectedPokemonId?: string;

    // Constructor
    constructor(
        private taskService: TaskService,
        private audioService: AudioService
    ) {
        const savedPokemons = localStorage.getItem('pokemons');
        this.pokemons = savedPokemons ? JSON.parse(savedPokemons) : DUMMY_POKEMONS;
    }


    // Scroll Selected Pokemon
    scrollIntoView(pokemonId: string) {
        setTimeout(() => {
            const element = document.getElementById('pokemon-' + pokemonId);
            const listContainer = document.getElementById('pokemons');
            if (element && listContainer) {
                const elementRect = element.getBoundingClientRect();
                const containerRect = listContainer.getBoundingClientRect();
                if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
            }
        }, 100); // ensure the DOM is updated
    }


    // Get Pokemons
    getPokemons(): Pokemon[] {
        const storedPokemons = localStorage.getItem('pokemons');
        if (storedPokemons) {
            this.pokemons = JSON.parse(storedPokemons);
        }
        return this.pokemons;
    }

    // Get one Pokemon
    getPokemon(pokemonId: string): Pokemon | undefined {
        return this.pokemons.find(pokemon => pokemon.id === pokemonId);
    }


    // Load states
    loadSavedState(): { selectedPokemonId?: string, selectedPokemon?: Pokemon, pokemons: Pokemon[] } {
        const savedStates = JSON.parse(localStorage.getItem('evolvedPokemonStates') || '{}');
        const savedPokemonId = localStorage.getItem('selectedPokemonId');
        let selectedPokemon: Pokemon | undefined;

        if (savedPokemonId && savedStates[savedPokemonId]) {
            this.selectedPokemonId = savedPokemonId;
            selectedPokemon = this.pokemons.find(p => p.id === savedPokemonId);

            if (selectedPokemon) {
                selectedPokemon.name = savedStates[savedPokemonId].name;
                selectedPokemon.avatar = savedStates[savedPokemonId].avatar;
            }
        } else {
            this.selectedPokemonId = this.pokemons[0]?.id || '';
            selectedPokemon = this.pokemons[0];
        }

        this.pokemons.forEach(pokemon => {
            if (savedStates[pokemon.id]) {
                pokemon.name = savedStates[pokemon.id].name;
                pokemon.avatar = savedStates[pokemon.id].avatar;
            }
        });

        localStorage.setItem('selectedPokemonId', this.selectedPokemonId || '');
        this.savePokemons();

        return { selectedPokemonId: this.selectedPokemonId, selectedPokemon, pokemons: this.pokemons };
    }


    // Load Pokemon State
    public loadPokemonState(pokemonId: string): Pokemon | undefined {
        return this.getPokemon(pokemonId);
    }


    // Save Pokemons
    savePokemons(): void {
        localStorage.setItem('pokemons', JSON.stringify(this.pokemons));
    }

    // Update Pokemon
    updatePokemon(pokemonId: string, updateFn: (pokemon: Pokemon) => void): void {
        const pokemon = this.getPokemon(pokemonId);

        if (pokemon) {
            updateFn(pokemon);
            this.pokemons = this.pokemons.map(p => p.id === pokemonId ? pokemon : p);
            this.savePokemons();
        }
    }


    // Save Selected Pokemons State
    saveSelectedPokemonState(pokemon: Pokemon): void {

        const savedStates = JSON.parse(localStorage.getItem('evolvedPokemonStates') || '{}');
        savedStates[pokemon.id] = {
            name: pokemon.name,
            avatar: pokemon.avatar,
            gif: pokemon.gif,
            energy: pokemon.energy,
            attack: pokemon.attack,
            defense: pokemon.defense
        };
        localStorage.setItem('evolvedPokemonStates', JSON.stringify(savedStates));
    }


    // Actions

    // Feed
    public feedPokemon(pokemonId: string, soundFile: string): void {

        this.updatePokemon(pokemonId, (pokemon) => {

            if (pokemon.health === 2500 && pokemon.happiness === 2500) {
                return;
            }
            pokemon.health = Math.min(2500, (pokemon.health || 0) + 50);
            pokemon.happiness = Math.min(2500, (pokemon.happiness || 0) + 50);
        });
        this.audioService.playSoundEffect(soundFile);
    }


    // MoonStone
    public useMoonStone(pokemonId: string, soundFile: string): void {

        this.updatePokemon(pokemonId, (pokemon) => {
            if (pokemon.health === 2500 && pokemon.happiness === 2500) {
                return;
            }
            pokemon.health = Math.min(2500, (pokemon.health || 0) + 200);
            pokemon.happiness = Math.min(2500, (pokemon.happiness || 0) + 200);
        });
        this.audioService.playSoundEffect(soundFile);
    }

    // Potion
    public usePotion(pokemonId: string, soundFile: string): void {
        this.updatePokemon(pokemonId, (pokemon) => {

            if (pokemon.health === 2500 && pokemon.happiness === 2500) {
                return;
            }
            pokemon.health = Math.min(2500, (pokemon.health || 0) + 100);
            pokemon.happiness = Math.max(0, (pokemon.happiness || 0) - 20);
        });
        this.audioService.playSoundEffect(soundFile);
    }


    // Update Pokemon & Evolution
    checkAndUpdatePokemon(pokemonId: string): { hasEvolved: boolean, attack: number, defense: number } {

        let hasEvolved = false;
        let newAttack = 0;
        let newDefense = 0;
        this.updatePokemon(pokemonId, (pokemon) => {
            let health = pokemon.health ?? 0;
            let happiness = pokemon.happiness ?? 0;

            const evolutionStage = pokemon.gif === pokemon.thirdGif ? 3 :
                pokemon.gif === pokemon.secondGif ? 2 : 1;
            const tasks = this.taskService.getPokemonTasks(pokemonId, evolutionStage);

            // Evolution state checks
            if (pokemon.isFullyEvolved) {
                return; // Don't change anything if fully evolved
            }

            // First evolution stage (Limit health & happiness)
            if (evolutionStage === 1) {
                if (tasks.length > 0) {
                    health = Math.min(health, 1000);
                    happiness = Math.min(happiness, 1000);

                } else if (health < 2000 && happiness < 2000) {
                    // When tasks are complete: limit health & happiness
                    health = Math.min(health, 2000);
                    happiness = Math.min(happiness, 2000);
                }
            }

            // Second evolution stage (Limit until tasks are completed)
            if (evolutionStage === 2) {
                if (tasks.length > 0) {
                    health = Math.min(health, 2000);
                    happiness = Math.min(happiness, 2000);
                } else {
                    // Allow once tasks are completed
                    health = Math.min(health, 2500);
                    happiness = Math.min(happiness, 2500);
                }
            }

            // Third evolution stage (if exists)
            if (evolutionStage === 3) {
                if (tasks.length > 0) {
                    // No limit here - final evolution
                    health = Math.min(health, 2500);
                    happiness = Math.min(happiness, 2500);
                }
            }

            // Update the Pokémon's health & happiness
            pokemon.health = health;
            pokemon.happiness = happiness;

            // First Stage Evolution
            if (
                !pokemon.evolutionSoundPlayed &&
                tasks.length === 0 &&
                health > 1000 &&
                happiness > 1000 &&
                health < 2000 &&
                happiness < 2000 &&
                pokemon.secondEvolution &&
                evolutionStage === 1
            ) {
                // Set second stage evolution
                pokemon.name = pokemon.secondEvolution ?? pokemon.name;
                pokemon.gif = pokemon.secondGif ?? pokemon.gif;
                pokemon.avatar = pokemon.secondAvatar ?? pokemon.avatar;
                newAttack = pokemon.secondAttack ?? pokemon.attack;
                newDefense = pokemon.secondDefense ?? pokemon.defense;
                pokemon.attack = newAttack;
                pokemon.defense = newDefense;

                hasEvolved = true;

                // Evolution sound
                this.audioService.taskCompleteEffect('evolution4.mp3');
                pokemon.evolutionSoundPlayed = true;

                // Save Pokémon state
                this.savePokemons();
                this.saveSelectedPokemonState(pokemon);
            }

            // Second Stage Evolution (to Third)
            else if (
                pokemon.evolutionSoundPlayed &&
                tasks.length === 0 &&
                health >= 2000 &&
                happiness >= 2000 &&
                pokemon.thirdEvolution &&
                evolutionStage === 2
            ) {
                // Set third stage evolution
                pokemon.name = pokemon.thirdEvolution ?? pokemon.name;
                pokemon.gif = pokemon.thirdGif ?? pokemon.gif;
                pokemon.avatar = pokemon.thirdAvatar ?? pokemon.avatar;
                newAttack = pokemon.thirdAttack ?? pokemon.attack;
                newDefense = pokemon.thirdDefense ?? pokemon.defense;
                pokemon.attack = newAttack;
                pokemon.defense = newDefense;

                hasEvolved = true;

                // Reset the evolution sound state
                pokemon.evolutionSoundPlayed = false;
                this.audioService.taskCompleteEffect('evolution4.mp3');

                // Save Pokémon state
                this.savePokemons();
                this.saveSelectedPokemonState(pokemon);
            }

            // Fully evolved state
            if (health === 2500 && happiness === 2500 && tasks.length === 0) {
                pokemon.isFullyEvolved = true;
                pokemon.finalBackground = pokemon.finalBackground;
                this.audioService.playSoundEffect('rock-spell.mp3');
            } else {
                pokemon.isFullyEvolved = false;
            }

            this.savePokemons();
        });

        return { hasEvolved, attack: newAttack, defense: newDefense };
    }


}