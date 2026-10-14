/**
 * AtmosIQ - React Native mock for Node Jest environment
 */

module.exports = {
  Platform: {
    OS: 'web',
    select: (objs) => objs.web || objs.default || objs.ios || objs.android,
  },
  StyleSheet: {
    create: (styles) => styles,
    absoluteFill: {},
  },
};
