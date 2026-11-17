module.exports = ({ config }) => {
  const local = !process.env.EAS_BUILD;
  const withChannel = local ? { ...config, updates: { ...config.updates, requestHeaders: { 'expo-channel-name': 'preview' } } } : config;
  if (process.platform === 'win32') return withChannel;
  return { ...withChannel, plugins: withChannel.plugins.filter((plugin) => !(Array.isArray(plugin) && plugin[0] === 'expo-build-properties')) };
};
