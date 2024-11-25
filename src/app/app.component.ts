import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { PokemonComponent } from "./pokemon/pokemon.component";
import { TasksComponent } from "./tasks/tasks.component";
import { CommonModule } from '@angular/common';
import { AudioService } from './Services/audio.service';
import { Pokemon } from './Models/pokemon.model';
import { PokemonService } from './Services/pokemon.service';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [HeaderComponent, PokemonComponent, TasksComponent, CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    
    @Input({ required: true }) pokemon!: Pokemon;

    pokemons: Pokemon[] = [];
    selectedPokemonId?: string;
    selectedPokemon?: Pokemon;

    // Constructor
    constructor(
        private pokemonService: PokemonService,
        public audioService: AudioService,
        private cdr: ChangeDetectorRef
    ) { }

    // OnInit
    ngOnInit(): void {
        this.loadSavedState();
        this.preloadGifs();
    }

    // Pre load Gifs
    preloadGifs(): void {
        const preloadLinks = this.getGifLinks();
        const head = document.head;

        preloadLinks.forEach(gif => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = gif;
            link.as = 'image';
            head.appendChild(link);
        });
    }

    getGifLinks(): string[] {
        return this.pokemons.flatMap(pokemon => [
            pokemon.gif,
            pokemon.secondGif,
            pokemon.thirdGif,
        ]).filter((gif): gif is string => typeof gif === 'string' && gif.length > 0);
    }

    // Load states
    loadSavedState(): void {
        const { selectedPokemonId, selectedPokemon, pokemons } = this.pokemonService.loadSavedState();
        this.selectedPokemonId = selectedPokemonId;
        this.selectedPokemon = selectedPokemon;
        this.pokemons = pokemons;
        this.cdr.detectChanges();
    }

    // On select Pokemon
    onSelectPokemon(id: string, soundFile: string): void {
        this.selectedPokemonId = id;
        this.selectedPokemon = this.pokemonService.getPokemon(id);

        if (this.selectedPokemon) {
            const evolved = this.pokemonService.checkAndUpdatePokemon(id);

            if (evolved) {
                this.cdr.detectChanges();
            }

            this.audioService.playSoundEffect(soundFile);
            localStorage.setItem('selectedPokemonId', id);

            setTimeout(() => {
                const element = document.getElementById('pokemon-' + id);
                const listContainer = document.getElementById('pokemons');

                if (element && listContainer) {
                    const elementRect = element.getBoundingClientRect();
                    const containerRect = listContainer.getBoundingClientRect();

                    if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }
                }
            }, 100);
        }
    }

    // Track Pokemon ID
    trackByPokemonId(index: number, pokemon: Pokemon): string {
        return pokemon.id;
    }

    // Navigation
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


    // Music
    toggleMusic(): void {
        if (this.audioService.isPlaying()) {
            this.audioService.pause();
        } else {
            this.audioService.playMusic();
        }
    }
}
