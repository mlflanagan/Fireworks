/*jslint long:true, this:true, browser:true, unordered:true, devel:true, for: true */
/*jshint esversion: 6 */

/*
2022-01-03
Inspired by https://stackoverflow.com/q/43498923
TODO: Use Array.prototype.filter in model update method
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

            // varying dx and dy sets particle direction
            this.dx = randBetween(Config.particles.minSpeed, Config.particles.maxSpeed);
            this.dy = randBetween(Config.particles.minSpeed, Config.particles.maxSpeed);

            this.size = randBetween(Config.particles.minSize, Config.particles.maxSize);

            this.r = randBetween(0, 256);
            this.g = randBetween(0, 256);
            this.b = randBetween(0, 256);
        }

        this.Explosion = function (x, y) {
            this.particles = [];
            /* Note: could also use the ES6 spread operator ("..."), like this:
               [...new Array(Config.particles.perExplosion).keys()].forEach(function () { */
            Array.from(new Array(Config.particles.perExplosion).keys()).forEach(function () {
                let newParticle = new Particle(x, y);
                this.particles.push(newParticle);
            }, this);
        };

        this.update = function () {
            for (let i = 0; i < this.explosions.length; i += 1) {
                let explosion = this.explosions[i];
                for (let j = 0; j < explosion.particles.length; j += 1) {
                    let particle = explosion.particles[j];
                    particle.x += particle.dx;
                    particle.y += particle.dy;
                    particle.size -= 0.1;
                    if (particle.size <= 0.0) {
                        explosion.particles.splice(j, 1);
                        j -= 1;
                    }
                }

                if (explosion.particles.length === 0) {
                    this.explosions.splice(i, 1);
                    i -= 1;
                }
            }
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

        // maintain binding for event listener
        // this.clickHandler = this.clickHandler.bind(this);
        window.addEventListener("click", this.clickHandler);
    }

    // GAME ENGINE ----------------------------------------------------

    // config options
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

    // pass high precision time for the first call to mainloop
    // (this is what requestAnimationFrame uses instead of Date.now())
    mainloop(performance.now());
}());
