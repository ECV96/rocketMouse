import Phaser from 'phaser'

import RocketMouse from '../game/RocketMouse'

import TextureKeys from '../consts/TextureKeys'
import SceneKeys from '../consts/SceneKeys'
import LaserObstacle from '../game/LaserObstacle'

export default class Game extends Phaser.Scene {

    private background!: Phaser.GameObjects.TileSprite
    private mouseHole!: Phaser.GameObjects.Image
    private window1!: Phaser.GameObjects.Image
    private window2!: Phaser.GameObjects.Image
    private bookcase1!: Phaser.GameObjects.Image
    private bookcase2!: Phaser.GameObjects.Image
    private laserObstacle!: LaserObstacle
    private coins!: Phaser.Physics.Arcade.StaticGroup

    private readonly teleportX = 2380

    private bookcases: Phaser.GameObjects.Image[] = []
    private windows: Phaser.GameObjects.Image[] = []

    private score = 0
    private scoreText!: Phaser.GameObjects.Text

    private scoreDistance = 0
    private scoreDistanceText!: Phaser.GameObjects.Text
    private lastMouseX = 0

    private rocketMouse!: RocketMouse

    init() {
        this.score = 0
        this.scoreDistance = 0
        this.lastMouseX = 0
    }

    constructor() {
        super(SceneKeys.Game)
    }

    create() {
        const width = this.scale.width
        const height = this.scale.height

        this.add.image(0, 0, TextureKeys.Background).setOrigin(0)
        this.background = this.add.tileSprite(0, 0, width, height, TextureKeys.Background).setOrigin(0).setScrollFactor(0, 0)

        this.mouseHole = this.add.image(Phaser.Math.Between(900, 1500), 501, TextureKeys.MouseHole)
        this.window1 = this.add.image(Phaser.Math.Between(900, 1300), 200, TextureKeys.Window1)
        this.window2 = this.add.image(Phaser.Math.Between(1600, 2000), 200, TextureKeys.Window2)
        this.windows = [this.window1, this.window2]
        this.bookcase1 = this.add.image(Phaser.Math.Between(2200, 2700), 580, TextureKeys.Bookcase1).setOrigin(0.5, 1)
        this.bookcase2 = this.add.image(Phaser.Math.Between(2900, 3400), 580, TextureKeys.Bookcase2).setOrigin(0.5, 1)
        this.bookcases = [this.bookcase1, this.bookcase2]

        this.laserObstacle = new LaserObstacle(this, 900, 100)
        this.add.existing(this.laserObstacle)

        this.coins = this.physics.add.staticGroup()
        this.spawnCoins()

        this.rocketMouse = new RocketMouse(this, width / 2, height - 30)
        this.add.existing(this.rocketMouse)
        const body = this.rocketMouse.body as Phaser.Physics.Arcade.Body
        body.setVelocityX(200)
        body.setCollideWorldBounds(true)

        this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height - 55)

        this.cameras.main.startFollow(this.rocketMouse)
        this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height)

        this.physics.add.overlap(this.laserObstacle, this.rocketMouse, this.handleOverlapLaser, undefined, this)

        this.physics.add.overlap(this.coins, this.rocketMouse, this.handleOverlapCoin, undefined, this)

        this.scoreText = this.add.text(10, 10, `Score ${this.score}`, {
            fontSize: '24px',
            color: '#080808',
            backgroundColor: '#F8E71C',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setScrollFactor(0)

        this.scoreDistanceText = this.add.text(10, 40, `Distance: ${this.scoreDistance}m`, {
            fontSize: '24px',
            color: '#080808',
            backgroundColor: '#F8E71C',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setScrollFactor(0)

        this.lastMouseX = this.rocketMouse.x
    }

    update() {
        this.wrapMouseHole()
        this.wrapWindows()
        this.wrapBookcases()
        this.wrapLaserObstacle()
        this.wrapCoins()
        this.background.setTilePosition(this.cameras.main.scrollX)
        this.teleportBackwards()
        this.handleScoreDistance()
    }

    private handleOverlapLaser(_: any, obj2: any) {
        const mouse = obj2 as RocketMouse
        mouse.kill()
    }

    private handleOverlapCoin(_: any, obj2: any) {
        const coin = obj2 as Phaser.Physics.Arcade.Sprite

        this.coins.killAndHide(coin)
        if (coin.body) {
            coin.body.enable = false
        }
        this.score += 1
        this.scoreText.text = `Score: ${this.score}`
    }

    private spawnCoins() {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        let x = rightEdge + 100
        const numCoins = Phaser.Math.Between(1, 20)

        for (let i = 0; i < numCoins; ++i) {
            const coin = this.coins.get(x, Phaser.Math.Between(100, this.scale.height - 100), TextureKeys.Coin) as Phaser.Physics.Arcade.Sprite
            coin.setVisible(true)
            coin.setActive(true)

            const body = coin.body as Phaser.Physics.Arcade.StaticBody
            body.setCircle(body.width * 0.5)
            body.enable = true

            body.updateFromGameObject()

            x += coin.width * 1.5
        }
    }

    private wrapCoins() {
        const scrollX = this.cameras.main.scrollX

        let oneActive = false
        this.coins.children.each(child => {
            const coin = child as Phaser.Physics.Arcade.Sprite

            if (coin.x < scrollX) {
                this.coins.killAndHide(coin)
                if (coin.body) {
                    coin.body.enable = false
                }
            } else if (coin.active) {
                oneActive = true
            }

            return true
        })

        if (!oneActive) {
            this.spawnCoins()
        }
    }

    private wrapMouseHole() {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        if (this.mouseHole.x + this.mouseHole.width < scrollX) {
            this.mouseHole.x = Phaser.Math.Between(rightEdge + 100, rightEdge + 1000)
        }
    }

    private wrapWindows() {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        let width = this.window1.width * 2
        this.wrapSprite(this.window1, width, rightEdge + width, this.bookcases, false)

        width = this.window2.width
        this.wrapSprite(this.window2, width, this.window1.x + width, this.bookcases, false)
    }

    private wrapBookcases() {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        let width = this.bookcase1.width * 2
        this.wrapSprite(this.bookcase1, width, rightEdge + width, this.windows, true)

        width = this.bookcase2.width
        this.wrapSprite(this.bookcase2, width, this.bookcase1.x + width, this.windows, true)
    }

    private wrapLaserObstacle() {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        const body = this.laserObstacle.body as Phaser.Physics.Arcade.StaticBody

        const width = body.width
        if (this.laserObstacle.x + width < scrollX) {
            this.laserObstacle.x = Phaser.Math.Between(rightEdge + width, rightEdge + width + 1000)
            this.laserObstacle.y = Phaser.Math.Between(0, 300)
            body.position.x = this.laserObstacle.x + body.offset.x
            body.position.y = this.laserObstacle.y
        }

    }

    private wrapSprite(
        sprite: Phaser.GameObjects.Image,
        maxWidth: number,
        minX: number,
        obstacles: Phaser.GameObjects.Image[],
        useObstacleWidthForOverlap: boolean = false
    ) {
        const scrollX = this.cameras.main.scrollX

        if (sprite.x + maxWidth < scrollX) {
            sprite.x = Phaser.Math.Between(minX, minX + 800)

            const overlap = obstacles.find(obstacle => {
                const safeDist = useObstacleWidthForOverlap ? obstacle.width : sprite.width
                return Math.abs(sprite.x - obstacle.x) <= safeDist
            })

            sprite.visible = !overlap
        }
    }

    private teleportBackwards() {
        const scrollX = this.cameras.main.scrollX
        const maxX = this.teleportX

        if (scrollX > maxX) {

            this.rocketMouse.x -= maxX
            this.mouseHole.x -= maxX

            this.windows.forEach(win => {
                win.x -= maxX
            })

            this.bookcases.forEach(bookcase => {
                bookcase.x -= maxX
            })

            this.laserObstacle.x -= maxX
            const laserBody = this.laserObstacle.body as Phaser.Physics.Arcade.StaticBody

            laserBody.x -= maxX

            this.coins.children.each(child => {
                const coin = child as Phaser.Physics.Arcade.Sprite

                coin.x -= maxX
                const body = coin.body as Phaser.Physics.Arcade.StaticBody
                body.updateFromGameObject()
                return true
            })
        }
    }

    private handleScoreDistance() {
        const x = this.rocketMouse.x
        const diffX = x - this.lastMouseX

        if (diffX > 0) {
            this.scoreDistance += diffX
        }

        // if we teleported, diffX will be negative (around -2380)
        // so we don't add it in the negative check, but we need
        // to realize we traveled that distance frame

        // Actually, clearer logic:
        // Regular move: newX > oldX. Dist += (newX - oldX)
        // Teleport move: newX < oldX. But we know we effectively moved forward.
        // The teleport moves everything back by this.teleportX.
        // So the real distance traveled is (newX + teleportX) - oldX.
        // But since we control the teleport, we can just detect the teleport happened in `teleportBackwards` possibly?
        // Or just handle the wrap here.

        if (diffX < -1000) {
            // We likely teleported.
            // Theoretical 'real' x would be x + this.teleportX
            const traveled = (x + this.teleportX) - this.lastMouseX
            if (traveled > 0) {
                this.scoreDistance += traveled
            }
        }

        this.lastMouseX = x
        this.scoreDistanceText.text = `Distance: ${Math.floor(this.scoreDistance / 10)}m`
    }
}