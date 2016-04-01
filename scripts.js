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


const SPEED = 40;
const STAR_NUMBER = 250;

const getStar = () => ({
  x: parseInt(Math.random() * canvas.width),
  y: parseInt(Math.random() * canvas.height),
  size: Math.random() * 3 + 1
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

            star.y += 3;  // move star
          });

          return stars;
        })
    )
    .subscribe(stars => paintStars(stars));
