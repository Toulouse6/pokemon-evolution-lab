import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class AudioService {

    // background Music
    private backgroundAudio = new Audio('./assets/audio/retro-game1.mp3');

    playMusic(): void {
        try {
            // Play the background music
            this.backgroundAudio.play();
        } catch (error) {
            console.error("Failed to play music:", error);
        }
    }

    pause(): void {
        if (!this.backgroundAudio.paused) {
            this.backgroundAudio.pause();
            console.log('Music paused.');
        } else {
            console.log('Music is already paused.');
        }
    }

    isPlaying(): boolean {
        return !this.backgroundAudio.paused;
    }

    playSoundEffect(soundFile: string): void {
        const soundEffect = new Audio(`./assets/audio/${soundFile}`);
        soundEffect.onerror = () => {
            console.error('Failed to load sound effect:', soundFile);
        };
        soundEffect.play().catch(error => {
            console.error('Failed to play sound effect:', error);
        });
    }

    // Evolution effect
    evolutionEffect(soundFile: string): void {
        const soundEffect = new Audio(`./assets/audio/${soundFile}`);
        soundEffect.play().catch(error => {
            console.error('Failed to play sound effect:', error);
        });
    }

    // Task effect
    taskCompleteEffect(file: string): void {
        const effect = new Audio(`./assets/audio/${file}`);
        effect.play().catch(error => console.error('Failed to play task complete effect:', error));
    }
}
