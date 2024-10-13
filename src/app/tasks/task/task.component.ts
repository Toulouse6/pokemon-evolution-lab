import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Task } from '../../Models/task.model';
import { CardComponent } from '../../shared/card/card.component';
import { Pokemon } from '../../Models/pokemon.model';
import { AudioService } from '../../Services/audio.service';
import { PokemonTaskService } from '../../Services/pokemon.task.service';
import { PokemonService } from '../../Services/pokemon.service';

@Component({
    selector: 'app-task',
    standalone: true,
    imports: [CardComponent],
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css']
})

export class TaskComponent {
    @Input() task!: Task;
    @Input() pokemon!: Pokemon;

    @Output() taskCompleted: EventEmitter<void> = new EventEmitter<void>();

    isLoading = false; 

    // Constructor
    constructor(
        private pokemonTasksService: PokemonTaskService,
        private pokemonService: PokemonService,
        private audioService: AudioService,
        private cdr: ChangeDetectorRef) { }

    // ngOnInit
    ngOnInit() {
        this.onLoadPokemonState();
    }

    // ngOnChanges
    ngOnChanges(changes: SimpleChanges) {
        if (changes['pokemon'] && !changes['pokemon'].firstChange) {
            this.onLoadPokemonState();
        }
    }

    // Complete Task
    completeTask() {
        // Remove task from service
        this.pokemonTasksService.completeTask(this.pokemon.id, this.task.id);
        this.audioService.playSoundEffect('completed.mp3');

        // Emit event
        this.taskCompleted.emit();

        // Load latest Pokémon statE
        this.onLoadPokemonState();
        this.cdr.detectChanges();
    }

    // Load latest Pokemon state
    onLoadPokemonState() {
        this.isLoading = true; // Set loading to true when starting to load

        const updatedPokemon = this.pokemonService.loadPokemonState(this.pokemon.id);
        if (updatedPokemon) {
            this.pokemon = { ...updatedPokemon };

            this.pokemon.gif = updatedPokemon.gif;
            this.isLoading = false; 
        }
    }

}
