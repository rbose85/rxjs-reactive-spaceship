const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const paintStars = stars => {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';

  stars.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));
};

const drawTriangle = (x, y, width, colour, direction) => {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x - width, y);
  ctx.lineTo(x, direction === 'up' ? y - width : y + width);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x - width, y);
  ctx.fill();
};

const paintSpaceship = (x, y) => drawTriangle(x, y, 20, '#ff0000', 'up');

const getRandom = (min, max) => Math.random() * (max - min + 1) + min;

const getRandomInt = (min, max) => Math.floor(getRandom(min, max));

const paintEnemies = enemies => enemies.forEach((enemy) => {
  enemy.y += 5;
  enemy.x += getRandomInt(-15, 15);

  drawTriangle(enemy.x, enemy.y, 20, '#00ff00', 'down');
});


const SPEED = 40;
const STAR_NUMBER = 250;

const getStar = () => ({
  x: parseInt(Math.random() * canvas.width),
  y: parseInt(Math.random() * canvas.height),
  size: getRandom(1, 3),
  isFast: getRandomInt(1, 4) % 4 === 0
});

const Stars = Rx.Observable.range(1, STAR_NUMBER)
    .map(() => getStar())
    .toArray()
    .flatMap(stars => Rx.Observable.interval(SPEED)
        .map(() => {
          stars.forEach(star => {
            if (star.y >= canvas.height) {
              Object.assign(star, getStar(), { y: 0 });
            }

            star.y += star.isFast ? 3 : 2; // star 'velocity'
          });

          return stars;
        })
    );


const HERO_Y = canvas.height - 30;

const Spaceship = Rx.Observable.fromEvent(canvas, 'mousemove')
    .map(e => ({ x: e.clientX, y: HERO_Y }))
    .startWith({ x: canvas.width / 2, y: HERO_Y });


const ENEMY_FREQ = 1500;

const Enemies = Rx.Observable.interval(ENEMY_FREQ)
    .scan(enemies => {
      enemies.push({
        x: parseInt(Math.random() * canvas.width),
        y: -30
      });

      return enemies;
    }, []);

const FiringShots = Rx.Observable.merge(
    Rx.Observable.fromEvent(canvas, 'click'),
    Rx.Observable.fromEvent(document, 'keydown')
        .filter(e => e.keyCode === 32)
    )
    .sample(200)
    .timestamp()
    .startWith({ timestamp: null });

const HeroShots = Rx.Observable.combineLatest(FiringShots, Spaceship, (heroShots, spaceship) => ({
      timestamp: heroShots.timestamp,
      x: spaceship.x
    }))
    .distinctUntilChanged(shot => shot.timestamp)
    .scan((shotArray, shot) => {
      shotArray.push(shot.timestamp ? { x: shot.x, y: HERO_Y } : undefined);
      return shotArray;
    }, []);


const render = actors => {
  paintStars(actors.stars);
  paintSpaceship(actors.spaceship.x, actors.spaceship.y);
  paintEnemies(actors.enemies);
};

Rx.Observable.combineLatest(Stars, Spaceship, Enemies,
    (stars, spaceship, enemies) => ({
      stars,
      spaceship,
      enemies
    }))
    .sample(SPEED)
    .subscribe(render);
