import Constants from 'expo-constants';
import { Platform } from 'react-native';
if (
  Platform.OS === 'android' &&
  Constants.executionEnvironment !== 'storeClient'
) {
  require('./src/forecast/widget').registerWidget();
}
require('expo-router/entry');
