jest.mock('axios', () => ({
  post: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  options: jest.fn(),
}));

global.mocks = {
    $cookies: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn()
    },
    $t: jest.fn((key) => key),
    $i18n: {
      locale: jest.fn()
    },
    $route: {
        query: jest.fn()
    },
    $router: {
        push: jest.fn()
    },
    $nuxt: {
        $emit: jest.fn()
    },
    $toast: { info: jest.fn() },
    $axios: {
        put: require('axios').put,
        post: require('axios').post,
        get: require('axios').get,
        options: require('axios').options,
    }
};
