import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pokemon } from '../Models/pokemon.model';
import { CardComponent } from "../shared/card/card.component";

@Component({
    selector: 'app-pokemon',
    standalone: true,
    imports: [CardComponent],
    templateUrl: './pokemon.component.html',
    styleUrls: ['./pokemon.component.css']
})

export class PokemonComponent {

    @Input({ required: true }) pokemon!: Pokemon;
    @Input({ required: true }) selected!: boolean;

    @Output() select = new EventEmitter<string>();

    get pokemonImage() {
        return './assets/pokemons/' + this.pokemon.avatar;
    }

    // On Select Pokemon
    selectPokemon() {
        this.select.emit(this.pokemon.id);
    }
}