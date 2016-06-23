/* eslint no-unused-vars: 0 */

import config from './config';
import BarChart from './components/BarChart';

const barChart = new BarChart('body', config, (b) => {
  console.log('BarChart constructed');
  b.getData('datasets/GDP-data.json', (d) => {
    console.log('getData finished');
    b.setData(d.data);
    b.showData();
    console.log('ShowData finished');
  });
});
