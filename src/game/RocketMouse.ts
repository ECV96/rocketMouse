import Phaser from 'phaser'

import TextureKeys from '../consts/TextureKeys'
import AnimationKeys from '../consts/AnimationKeys'
import SceneKeys from '../consts/SceneKeys'

enum MouseState {
    Running,
    Killed,
    Dead
}

export default class RocketMouse extends Phaser.GameObjects.Container {

    private mouseState: MouseState = MouseState.Running

    private rocketMouse: Phaser.GameObjects.Sprite
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined
    private flames: Phaser.GameObjects.Sprite

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)

        this.rocketMouse = scene.add.sprite(0, 0, TextureKeys.RocketMouse).setOrigin(0.5, 1).play(AnimationKeys.RocketMouseRun)
        this.flames = scene.add.sprite(-63, -15, TextureKeys.RocketMouse).play(AnimationKeys.RocketMouseFlamesOn)

        this.enableJetPack(false)

        this.add(this.flames)
        this.add(this.rocketMouse)

        scene.physics.add.existing(this)

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setSize(this.rocketMouse.width * 0.5, this.rocketMouse.height * 0.7)
        body.setOffset(this.rocketMouse.width * -0.3, -this.rocketMouse.height + 15)

        this.cursors = scene.input.keyboard?.createCursorKeys()
    }

    preUpdate() {
        const body = this.body as Phaser.Physics.Arcade.Body

        switch (this.mouseState) {
            case MouseState.Running:

                if (this.cursors?.space.isDown || this.scene.input.activePointer.isDown) {
                    body.setAccelerationY(-600)
                    this.enableJetPack(true)
                    this.rocketMouse.play(AnimationKeys.RocketMouseFly, true)
                } else {
                    body.setAccelerationY(0)
                    this.enableJetPack(false)
                }

                if (body.blocked.down) {
                    this.rocketMouse.play(AnimationKeys.RocketMouseRun, true)
                } else if (body.velocity.y > 0) {
                    this.rocketMouse.play(AnimationKeys.RocketMouseFall, true)
                }
                break
            case MouseState.Killed:
                body.velocity.x *= 0.99

                if (body.velocity.x < 5) {
                    this.mouseState = MouseState.Dead
                }
                break
            case MouseState.Dead:
                body.setVelocity(0, 0)
                this.scene.scene.start(SceneKeys.GameOver)
                break
        }
    }

    enableJetPack(enabled: boolean) {
        this.flames.setVisible(enabled)
    }

    kill() {
        if (this.mouseState !== MouseState.Running) return

        this.mouseState = MouseState.Killed
        this.rocketMouse.play(AnimationKeys.RocketMouseDead)

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setAccelerationY(0)
        body.setVelocity(1000, 0)
        this.enableJetPack(false)
    }
}