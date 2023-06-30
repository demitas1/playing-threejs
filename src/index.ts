import * as _ from 'lodash';

import style from './assets/style.css';
import imageIcon from './assets/images/icon.jpg';

console.log(style);
console.log(imageIcon);

// appned <div>
const e = document.createElement('div');
// test lodash
e.innerHTML = _.join(['Hello', 'webpack'], ' ');
e.classList.add(style.hello);
document.body.appendChild(e);

// append <img>
const img = document.createElement('img');
img.src = imageIcon;
document.body.appendChild(img);

console.log('done.');
