global.mocks = {
    $cookies: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn()
    },
    $t: jest.fn((key) => key),
    $i18n: jest.fn(),
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
};
