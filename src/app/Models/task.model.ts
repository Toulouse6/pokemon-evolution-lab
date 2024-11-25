export interface Task {

    id: string;
    pokemonId: string;
    title: string;
    summary: string;

    // Evolution
    evolutionStage?: number; 
}
