export const environment = {
  production: true,
  landingPage: 'home',
  dashboardPage: 'dashboard',
  baseUrl: 'https://www.ttvn.nl/api',
  loginUrl: 'https://www.ttvn.nl/api/login',
  databaseName: 'ttvn',

    // De mail url wijst naar mijn rasp pi. waar een python flask server draait. Deze handelt de mail requests af. Tevens notifications requests.
  mailUrl: 'http://84.104.233.194:5001',

  // de proxy url stuurt requests door naar de Rasp.Pi. Dit kan ook direct natuurlijk maar we gebruiken deze proxy om de https te ontwijken op de Pi
  // de service worker wil namelijk alleen via https en de pi heeft dit niet. 
  proxyUrl: 'https://www.ttvn.nl/api/proxy/'


};