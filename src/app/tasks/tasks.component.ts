import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TaskComponent } from './task/task.component';
import { Pokemon } from '../Models/pokemon.model';
import { Task } from '../Models/task.model';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { PokemonTaskService } from '../Services/pokemon.task.service';
import { AudioService } from '../Services/audio.service';
import { PokemonEvolutionService } from '../Services/pokemon.evolution.service';
import { PokemonService } from '../Services/pokemon.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';

@Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [TaskComponent, NgFor, NgIf, NgClass, SpinnerComponent],
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit, OnChanges {
    @Input({ required: true }) pokemon!: Pokemon;

    message: string = '';
    displayAttack: number = 0;
    displayDefense: number = 0;

    isLoading: boolean = false;

    // Constructor
    constructor(
        private pokemonService: PokemonService,
        private pokemonTasksService: PokemonTaskService,
        private pokemonEvolutionService: PokemonEvolutionService,
        private audioService: AudioService,
        private cdr: ChangeDetectorRef
    ) {}

    // ngOnInit
    ngOnInit() {
        this.loadPokemonState();
        this.checkConditions();
        this.animateStats();

        this.isLoading = true;  


        setTimeout(() => {
            this.isLoading = false;   
            this.cdr.detectChanges(); 
        }, 500);   
    }

    // ngOnChanges
    ngOnChanges(changes: SimpleChanges) {
        if (changes['pokemon'] && !changes['pokemon'].firstChange) {
  
            this.isLoading = true;  


            setTimeout(() => {
                this.isLoading = false;   
                this.cdr.detectChanges(); 
            }, 500);   

            this.loadPokemonState(); 
            this.checkConditions(); 
            this.audioService.playSoundEffect('sword-sound.mp3');
        }
    }


    // Animate stats
    animateStats() {
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

    // Handle image load event
    onPokemonImageLoad() {
        console.log('Pokemon image loaded:', this.pokemon.gif);
        this.isLoading = false;  
        this.cdr.detectChanges(); 
    }

    // Load Pokemon State
    loadPokemonState() {
 const updatedPokemon = this.pokemonService.loadPokemonState(this.pokemon.id);
       
        if (updatedPokemon) {
            this.pokemon = { ...updatedPokemon };
        }
    }


    // Evolve Pokemon
    evolvePokemon(): void {

        this.pokemonEvolutionService.evolvePokemon(this.pokemon,
            (newAttack) => {
                this.displayAttack = newAttack;
                this.cdr.detectChanges(); 
            },
            (newDefense) => {
                this.displayDefense = newDefense;
                this.isLoading = false;  
                this.cdr.detectChanges();  
            }
        );
    }

    onTaskCompleted(): void {
        this.setEvolutionMessage();
        this.loadPokemonState(); 
        this.cdr.detectChanges();
    }

    trackByTaskId(index: number, task: Task): string {
        return task.id;
    }

    showEvolutionHint(): boolean {
        return !!this.message;
    }

    setEvolutionMessage() {
        this.message = this.pokemonEvolutionService.setEvolutionMessage(this.pokemon, this.selectedPokemonTasks);
    }

    private checkConditions() {
        this.pokemonService.checkAndUpdatePokemon(this.pokemon.id);
        this.loadPokemonState();  
    }

    get selectedPokemonTasks(): Task[] {
        const currentStageString = this.getCurrentEvolutionStage(this.pokemon);
        const currentStage = parseInt(currentStageString.split('/')[0], 10);
        return this.pokemonTasksService.getSelectedPokemonTasks(this.pokemon.id, currentStage);
    }

    getCurrentEvolutionStage(pokemon: Pokemon): string {
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

    areActionsDisabled(): boolean {
        return this.pokemon.health === 2500 && this.pokemon.happiness === 2500;
    }
}
