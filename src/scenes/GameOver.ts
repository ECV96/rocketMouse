import Phaser from 'phaser'
import SceneKeys from '../consts/SceneKeys'

export default class GameOver extends Phaser.Scene {
    constructor() {
        super(SceneKeys.GameOver)
    }

    create() {
        const { width, height } = this.scale

        const x = width / 2
        const y = height / 2

        let text = 'Touch Screen to Play Again'
        // desktop includes simple check for desktop vs mobile
        if (this.sys.game.device.os.desktop) {
            text = 'Press SPACE to Play Again'
        }

        this.add.text(x, y, text, {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#000',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        })
            .setOrigin(0.5)

        if (this.sys.game.device.os.desktop) {
            this.input.keyboard?.once('keydown-SPACE', () => {
                this.scene.stop(SceneKeys.GameOver)
                this.scene.stop(SceneKeys.Game)
                this.scene.start(SceneKeys.Game)
            })
        } else {
            this.input.once('pointerdown', () => {
                this.scene.stop(SceneKeys.GameOver)
                this.scene.stop(SceneKeys.Game)
                this.scene.start(SceneKeys.Game)
            })
        }
    }
}