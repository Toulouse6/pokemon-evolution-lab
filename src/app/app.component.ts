import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { PokemonComponent } from "./pokemon/pokemon.component";
import { DUMMY_POKEMONS } from './dummy-pokemons';
import { TasksComponent } from "./tasks/tasks.component";
import { CommonModule } from '@angular/common';
import { AudioService } from './Services/audio.service';
import { Pokemon } from './Models/pokemon.model';
import { PokemonService } from './Services/pokemon.service';
import { PokemonTaskService } from './Services/pokemon.task.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [HeaderComponent, PokemonComponent, TasksComponent, CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

    @Input({ required: true }) pokemon!: Pokemon;

    pokemons = DUMMY_POKEMONS;
    selectedPokemonId?: string;
    selectedPokemon?: Pokemon;

    // Constructor
    constructor(
        private pokemonTaskService: PokemonTaskService,
        private pokemonService: PokemonService,
        public audioService: AudioService,
        private cdr: ChangeDetectorRef,
    ) { }


    // OnInit
    ngOnInit(): void {
        this.loadSavedState();
    }


    // Load saved state
    loadSavedState(): void {

        const savedStates = JSON.parse(localStorage.getItem('evolvedPokemonStates') || '{}');
        const savedPokemonId = localStorage.getItem('selectedPokemonId');

        // Check if there is a saved state
        if (savedPokemonId && savedStates[savedPokemonId]) {

            this.selectedPokemonId = savedPokemonId;
            this.selectedPokemon = this.pokemons.find(pokemon => pokemon.id === savedPokemonId);

            if (this.selectedPokemon) {
                // Apply saved avatar and name from localStorage
                this.selectedPokemon.name = savedStates[savedPokemonId].name;
                this.selectedPokemon.avatar = savedStates[savedPokemonId].avatar;

                // Force UI update
                this.cdr.detectChanges();
            }
        } else {
            // Default first Pokémon
            this.selectedPokemonId = this.pokemons[0]?.id || '';
            this.selectedPokemon = this.pokemons[0];
        }

        // Apply saved states to all Pokémon
        this.pokemons.forEach(pokemon => {
            if (savedStates[pokemon.id]) {
                pokemon.name = savedStates[pokemon.id].name;
                pokemon.avatar = savedStates[pokemon.id].avatar;
            }
        });

        // Ensure localStorage is updated
        localStorage.setItem('selectedPokemonId', this.selectedPokemonId);
    }



    // Track Pokemon ID
    trackByPokemonId(index: number, pokemon: Pokemon): string {
        return pokemon.id;
    }


    // Load Pokémon State
    loadSelectedPokemonState(): void {
        if (this.selectedPokemonId) {
            const updatedPokemon = this.pokemonService.getPokemon(this.selectedPokemonId);
            if (updatedPokemon) {
                this.selectedPokemon = { ...updatedPokemon };
                this.cdr.detectChanges();
            }
        }
    }


    // On Select Pokemon
    onSelectPokemon(id: string, soundFile: string): void {
        this.selectedPokemonId = id;
        this.selectedPokemon = this.pokemonService.getPokemon(id);

        if (this.selectedPokemon) {
            const evolved = this.pokemonService.checkAndUpdatePokemon(id);

            if (evolved) {
                this.cdr.detectChanges();
            }

            // Select Pokemon Sound
            this.audioService.playSoundEffect(soundFile);
            localStorage.setItem('selectedPokemonId', id);

            // Scroll selected Pokémon
            setTimeout(() => {
                const element = document.getElementById('pokemon-' + id);
                const listContainer = document.getElementById('pokemons');

                if (element && listContainer) {
                    const elementRect = element.getBoundingClientRect();
                    const containerRect = listContainer.getBoundingClientRect();

                    // Check if element is outside visible area
                    if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }
                }
            }, 100); // delay to ensure DOM is updated
        }
    }

    // Navigation between Pokémon
    selectPreviousPokemon(): void {
        const currentIndex = this.pokemons.findIndex(p => p.id === this.selectedPokemonId);
        const previousIndex = (currentIndex - 1 + this.pokemons.length) % this.pokemons.length;
        this.onSelectPokemon(this.pokemons[previousIndex].id, 'sword-sound.mp3');
    }

    selectNextPokemon(): void {
        const currentIndex = this.pokemons.findIndex(p => p.id === this.selectedPokemonId);
        const nextIndex = (currentIndex + 1) % this.pokemons.length;
        this.onSelectPokemon(this.pokemons[nextIndex].id, 'sword-sound.mp3');
    }


    toggleMusic(): void {
        if (this.audioService.isPlaying()) {
          this.audioService.pause();
        } else {
          this.audioService.playMusic();
        }
      }

}
