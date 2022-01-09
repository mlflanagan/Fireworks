/*jslint long:true, this:true browser:true, unordered:true */
/*jshint esversion: 6 */

/*
2022-01-03
Inspired by https://stackoverflow.com/q/43498923
*/

(function () {
    // Return an random integer between the given values inclusive of min but not max
    function randBetween(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function Model() {
        this.explosions = [];

        function Particle(x, y) {
            this.x = x;
            this.y = y;

            this.dx = randBetween(Config.particles.minSpeed, Config.particles.maxSpeed);
            this.dy = randBetween(Config.particles.minSpeed, Config.particles.maxSpeed);

            this.size = randBetween(Config.particles.minSize, Config.particles.maxSize + 1);

            /* set color in Explosion class
            this.r = randBetween(0, 256);
            this.g = randBetween(0, 256);
            this.b = randBetween(0, 256); */
        }

        this.Explosion = function (x, y) {
            this.particles = [];
            // set all particles to the same color
            let red = randBetween(0, 256);
            let green = randBetween(0, 256);
            let blue = randBetween(0, 256);
            /* Note: could also use the ES6 spread operator ("..."), like this:
               [...new Array(Config.particles.perExplosion).keys()].forEach(function () { */
            Array.from(new Array(Config.particles.perExplosion).keys()).forEach(function () {
                let newParticle = new Particle(x, y);
                newParticle.r = red;
                newParticle.g = green;
                newParticle.b = blue;
                this.particles.push(newParticle);
            }, this);
        };

        this.update = function () {
            this.explosions.forEach(function (explosion) {
                explosion.particles.forEach(function (particle) {
                    particle.x += particle.dx;
                    particle.y += particle.dy;
                    particle.size -= 0.1;
                }, this);
                explosion.particles = explosion.particles.filter(function (particle) {
                    return (particle.size > 0.0);
                });
            }, this);
            this.explosions = this.explosions.filter(function (explosion) {
                return (explosion.particles.length > 0);
            });
        };
    }

    function View() {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = 640;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext("2d");

        this.render = function (explosions) {
            this.ctx.fillStyle = Config.background;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            explosions.forEach(function (explosion) {
                explosion.particles.forEach(function (particle) {
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, Math.PI * 2, 0, false);
                    this.ctx.closePath();
                    this.ctx.fillStyle = "rgb(" + particle.r + "," + particle.g + "," + particle.b + ")";
                    this.ctx.fill();
                }, this);
            }, this);
        };
    }

    function Controller() {
        this.clickHandler = function (event) {
            let xPos;
            let yPos;
            if (event.offsetX) {
                xPos = event.offsetX;  // MS
                yPos = event.offsetY;
            } else if (event.layerX) {
                xPos = event.layerX;   // Gecko (FF et. al.). Deprecated?
                yPos = event.layerY;
            }
            let newExplosion = new model.Explosion(xPos, yPos);
            model.explosions.push(newExplosion);
        };

        window.addEventListener("click", this.clickHandler);
    }

    // GAME ENGINE ----------------------------------------------------

    // options
    const Config = {
        fps: 60,
        background: "black",
        particles: {
            perExplosion: 24,
            minSpeed: -5,
            maxSpeed: 5,
            minSize: 2,
            maxSize: 5
        }
    };

    const INTERVAL = 1000 / Config.fps;

    const requestAnimationFrame = window.requestAnimationFrame ||
                                  window.mozRequestAnimationFrame ||
                                  window.webkitRequestAnimationFrame ||
                                  window.msRequestAnimationFrame;

    let then = 0;

    function mainloop(now) {
        let delta = now - then;
        if (delta >= INTERVAL) {
            model.update();
            view.render(model.explosions);
        }
        then = now - (delta % INTERVAL);
        requestAnimationFrame(mainloop);
    }

    let model = new Model();
    let view = new View();
    let controller = new Controller(); // ignore lint 'unused' warning

    mainloop(performance.now());
}());
