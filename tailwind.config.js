// បង្កើត css/app.css ឡើងវិញ៖ npx tailwindcss@3 -i css/app.input.css -o css/app.css --minify
module.exports = {
  content: ['./index.html', './js/*.js'],
  theme: { extend: { fontFamily: { khmer: ['"Kantumruy Pro"', '"Plus Jakarta Sans"', 'sans-serif'] } } }
};
