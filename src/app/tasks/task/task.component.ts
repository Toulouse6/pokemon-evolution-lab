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

    // Constructor
    constructor(
        private pokemonTasksService: PokemonTaskService,
        private pokemonService: PokemonService,
        private audioService: AudioService,
        private cdr: ChangeDetectorRef) { }

    // ngOnInit
    ngOnInit() {
        this.loadPokemonState();
    }

    // ngOnChanges
    ngOnChanges(changes: SimpleChanges) {
        if (changes['pokemon'] && !changes['pokemon'].firstChange) {
            this.loadPokemonState();
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
        this.loadPokemonState();
        this.cdr.detectChanges();
    }

    // Load latest Pokemon state
    public loadPokemonState() {
        const updatedPokemon = this.pokemonService.getPokemon(this.pokemon.id);
        if (updatedPokemon) {
            this.pokemon = { ...updatedPokemon };
        }
    }

}
