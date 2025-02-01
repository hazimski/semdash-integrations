export function getBasicAuth() {
  const username = 'hazem@influencify.co';
  const password = 'eabe59c4f8c3dfd8';
  return `Basic ${btoa(`${username}:${password}`)}`;
}
