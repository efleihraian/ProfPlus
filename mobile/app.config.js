// CMake 3.31.6 e fixat doar pentru build-ul pe Windows (limita de 260 de caractere din căi). Serverele EAS nu au această versiune.
// P-230: actualizările prin aer (EAS Update). Build-urile EAS primesc canalul din eas.json (preview / production);
// un APK construit pe PC (fără EAS_BUILD) ascultă de canalul „preview”, ca APK-urile pentru testeri.
module.exports = ({ config }) => {
  const local = !process.env.EAS_BUILD;
  const withChannel = local ? { ...config, updates: { ...config.updates, requestHeaders: { 'expo-channel-name': 'preview' } } } : config;
  if (process.platform === 'win32') return withChannel;
  return { ...withChannel, plugins: withChannel.plugins.filter((plugin) => !(Array.isArray(plugin) && plugin[0] === 'expo-build-properties')) };
};
