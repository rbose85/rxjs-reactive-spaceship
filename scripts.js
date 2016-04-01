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


const SPEED = 40;
const STAR_NUMBER = 250;

const getStar = () => ({
  x: parseInt(Math.random() * canvas.width),
  y: parseInt(Math.random() * canvas.height),
  size: Math.random() * 3 + 1,
  isFast: Math.floor(Math.random() * 4 + 1) % 4 === 0
});

Rx.Observable.range(1, STAR_NUMBER)
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
    )
    .subscribe(stars => paintStars(stars));


const HERO_Y = canvas.height - 30;

Rx.Observable.fromEvent(canvas, 'mousemove')
    .map(e => ({ x: e.clientX, y: HERO_Y }))
    .startWith({ x: canvas.width / 2, y: HERO_Y });
