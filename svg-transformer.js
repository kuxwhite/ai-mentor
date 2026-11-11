// Превращает SVG-файлы в React-компоненты, остальное отдаёт штатному трансформеру Expo.
const path = require('path');
const { createTransformer } = require('react-native-svg-transformer');

const expoDir = path.dirname(require.resolve('expo/package.json'));
const expoTransformer = require(
  require.resolve('@expo/metro-config/babel-transformer', { paths: [expoDir] }),
);

module.exports.transform = createTransformer(expoTransformer);
