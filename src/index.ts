import * as _ from 'lodash';

import style from './assets/style.css';
import imageIcon from './assets/images/icon.jpg';

console.log(style);
console.log(imageIcon);

function component() {
  const element = document.createElement('div');

  // test lodash
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  element.classList.add(style.hello);

  console.log('done.');

  return element;
}

document.body.appendChild(component());

const e = document.createElement('img');
e.src = imageIcon;
document.body.appendChild(e);

