const { parseSinoTrackMessage } = require('./parser');
const samples = [
  'imei:359587045671283,tracker,1,230504,134501,22.5483,-49.1170,0.00,84.3,1.510,;',
  '$GPRMC,134501,A,2254.8980,S,04906.4200,W,0.00,84.3,050423,,*1A'
];
for (const sample of samples) {
  const parsed = parseSinoTrackMessage(sample);
  console.log('---');
  console.log('sample:', sample);
  console.log('parsed:', JSON.stringify(parsed, null, 2));
}
