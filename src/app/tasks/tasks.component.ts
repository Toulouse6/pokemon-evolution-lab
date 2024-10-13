import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TaskComponent } from './task/task.component';
import { Pokemon } from '../Models/pokemon.model';
import { Task } from '../Models/task.model';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { PokemonTaskService } from '../Services/pokemon.task.service';
import { AudioService } from '../Services/audio.service';
import { PokemonEvolutionService } from '../Services/pokemon.evolution.service';
import { PokemonService } from '../Services/pokemon.service';

@Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [TaskComponent, NgFor, NgIf, NgClass],
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit, OnChanges {

    @Input({ required: true }) pokemon!: Pokemon;

    message: string = '';
    isAddingTask: boolean = false;
    displayAttack: number = 0;
    displayDefense: number = 0;


    // Constructor
    constructor(
        private pokemonService: PokemonService,
        private pokemonTasksService: PokemonTaskService,
        private pokemonEvolutionService: PokemonEvolutionService,
        private audioService: AudioService,
        private cdr: ChangeDetectorRef
    ) { }


    // ngOnInit
    ngOnInit() {
        this.loadPokemonState();
        this.checkConditions();

        // Call animateStats
        this.pokemonEvolutionService.animateStats(
            'attack',
            this.pokemon.attack,
            2000,
            0,
            value => this.displayAttack = value
        );
        this.pokemonEvolutionService.animateStats(
            'defense',
            this.pokemon.defense,
            2000,
            0,
            value => this.displayDefense = value
        );
    }

    // ngOnChanges
    ngOnChanges(changes: SimpleChanges) {
        if (changes['pokemon'] && !changes['pokemon'].firstChange) {
            this.loadPokemonState();
            this.checkConditions();
            this.audioService.playSoundEffect('sword-sound.mp3');
            this.cdr.detectChanges();

            //  Pokémon change animate stats
            this.pokemonEvolutionService.animateStats(
                'attack',
                this.pokemon.attack,
                2000,
                0,
                value => this.displayAttack = value
            );
            this.pokemonEvolutionService.animateStats(
                'defense',
                this.pokemon.defense,
                2000,
                0,
                value => this.displayDefense = value
            );
        }
    }


    // Get evolution stage
    public getCurrentEvolutionStage(pokemon: Pokemon): string {
        let stage = 1;
        let totalStages = 1;

        if (pokemon.thirdEvolution) {
            totalStages = 3;
            if (pokemon.gif === pokemon.thirdGif) {
                stage = 3;
            } else if (pokemon.gif === pokemon.secondGif) {
                stage = 2;
            }
        } else if (pokemon.secondEvolution) {
            totalStages = 2;
            if (pokemon.gif === pokemon.secondGif) {
                stage = 2;
            }
        }

        return `${stage}/${totalStages}`;
    }


    // Load Pokemon State
    loadPokemonState() {
        const updatedPokemon = this.pokemonService.loadPokemonState(this.pokemon.id);
        if (updatedPokemon) {
            this.pokemon = { ...updatedPokemon };

            // Animate stats
            this.pokemonEvolutionService.animateStats(
                'attack',
                this.pokemon.attack,
                2000,
                this.displayAttack,
                value => this.displayAttack = value
            );
            this.pokemonEvolutionService.animateStats(
                'defense',
                this.pokemon.defense,
                2000,
                this.displayDefense,
                value => this.displayDefense = value
            );

            this.setEvolutionMessage();
        }
    }


    // Evolve Pokemon
    evolvePokemon(): void {
        this.pokemonEvolutionService.evolvePokemon(this.pokemon,
            (newAttack) => this.displayAttack = newAttack,
            (newDefense) => this.displayDefense = newDefense
        );
        this.cdr.detectChanges();
    }


    // On Task Completed
    onTaskCompleted(): void {
        this.loadPokemonState();
        this.setEvolutionMessage();
        this.cdr.detectChanges();
    }


    // Track By Task Id
    trackByTaskId(index: number, task: Task): string {
        return task.id;
    }

    // Show evolution hint message
    showEvolutionHint(): boolean {
        return !!this.message;
    }


    // Set Evolution Message
    setEvolutionMessage() {
        this.message = this.pokemonEvolutionService.setEvolutionMessage(this.pokemon, this.selectedPokemonTasks);
    }


    // Check conditions (evolution, task completion)
    private checkConditions() {
        this.pokemonService.checkAndUpdatePokemon(this.pokemon.id);
        this.loadPokemonState();
    }


    // Selected Pokemon Tasks
    get selectedPokemonTasks(): Task[] {
        const currentStageString = this.getCurrentEvolutionStage(this.pokemon);
        const currentStage = parseInt(currentStageString.split('/')[0], 10); // Extract the current stage as a number
        return this.pokemonTasksService.getSelectedPokemonTasks(this.pokemon.id, currentStage);
    }


    // Action Buttons

    feed(soundFile: string): void {
        this.pokemonService.feedPokemon(this.pokemon.id, soundFile);
        this.loadPokemonState();
        this.checkConditions();
        this.setEvolutionMessage();
    }

    moonStone(soundFile: string): void {
        this.pokemonService.useMoonStone(this.pokemon.id, soundFile);
        this.loadPokemonState();
        this.checkConditions();
        this.setEvolutionMessage();
    }

    potion(soundFile: string): void {
        this.pokemonService.usePotion(this.pokemon.id, soundFile);
        this.loadPokemonState();
        this.checkConditions();
        this.setEvolutionMessage();
    }

    // Disable Action buttons
    areActionsDisabled(): boolean {
        return this.pokemon.health === 2500 && this.pokemon.happiness === 2500;
    }

}