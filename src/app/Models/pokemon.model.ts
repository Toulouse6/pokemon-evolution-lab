export interface Pokemon {

    id: string;
    name: string;
    avatar: string;
    gif: string;

    // Attack & Defense
    attack: number;
    defense: number;
    energy: string;

    // Health & Happiness
    health?: number;
    happiness?: number;

    // Evolutions
    evolutionName?: string;
    secondEvolution?: string;
    secondGif?: string;
    secondAvatar?: string;

    // Attack & Defense
    secondAttack: number;
    secondDefense: number;

    thirdEvolution?: string;
    thirdGif?: string;
    thirdAvatar?: string;

    // Attack & Defense
    thirdAttack?: number;
    thirdDefense?: number;

    // Sound Played?
    evolutionSoundPlayed?: boolean;

    // Is Fully Evolved?
    isFullyEvolved?: boolean;

    //Message
    message?: string;

}