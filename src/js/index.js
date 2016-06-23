/* eslint no-unused-vars: 0 */
// config contains gkobal canvas configuration, like width, height and padding
import config from './config';
import BarChart from './components/BarChart';

const barChart = new BarChart('.barGraph', config, (b) => {
  console.log('BarChart constructed');
  b.getData('datasets/GDP-data.json', (d) => {
    console.log('getData finished');
    b.setData(d.data);
    b.showData();
    console.log('ShowData finished');
  });
});
