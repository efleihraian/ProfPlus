// CMake 3.31.6 e fixat doar pentru build-ul pe Windows (limita de 260 de caractere din căi). Serverele EAS nu au această versiune.
module.exports = ({ config }) => {
  if (process.platform === 'win32') return config;
  return { ...config, plugins: config.plugins.filter((plugin) => !(Array.isArray(plugin) && plugin[0] === 'expo-build-properties')) };
};
