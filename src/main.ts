import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import GameOver from './scenes/GameOver'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 640,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		// Force landscape orientation
		orientation: Phaser.Scale.Orientation.LANDSCAPE,
		// Round pixel values to integers to prevent sub-pixel rendering artifacts
		autoRound: true
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200, x: 0 },
			debug: true,
		},
	},
	scene: [Preloader, Game, GameOver],
}

export default new Phaser.Game(config)
