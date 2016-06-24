/* eslint no-unused-vars: 0 */
// config contains gkobal canvas configuration, like width, height and padding
import config from './config';
import BarChart from './components/BarChart';

const barChart = new BarChart('.barGraph', config, (b) => {
  console.log('BarChart constructed');
  b.showData('datasets/GDP-data.json',
    (d) => {
      return d.data;
    },
    (err) => {
      if (err) {
        console.error('Error loading data: ', err);
        d3.select('h1').text('Sorry, there was an error loading the data!');
      }
      else {
        console.log('ShowData finished');
      }
  });
});
