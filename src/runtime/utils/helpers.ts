import { useCookie, useNuxtApp, useRequestHeaders, useRoute, useFetch } from '#app'
import { defineAsyncComponent } from 'vue'

export function formatName(name: string): string {
  switch (name) {
    default:
      return name.split(':')[name.split(':').length - 1].replace(/_/g, ' ') || 'unlabeled'
  }
}

export const formatTexts = (text: string, sep: string = ' '): string => {
  let updatedText = text
  const hooksJs = importJs(`/js/global-hooks`)
  if (hooksJs && hooksJs['update_section_name']) {
    if (hooksJs['update_section_name'](text)) {
      updatedText = hooksJs['update_section_name'](text)
    }
  }
  const result = updatedText.replace(/([A-Z])/g, `${sep}$1`)
  return result.charAt(0).toUpperCase() + result.slice(1)
}

export const importJs = (path: string): any => {
  // @ts-ignore
  const jsHooks = import.meta.glob(`/sections/**/!(*.spec).js`, { eager: true })
  try {
    return jsHooks[`/sections${path}.js`]
  } catch (e) {
    return ''
  }
}

// @ts-ignore
const sections = import.meta.glob('/sections/**/*.vue')
// @ts-ignore
const configs = import.meta.glob('../components/configs/**/*.vue')
const importCache: any = {}

export const importComp = (path: string) => {
  if (importCache[path]) {
    return importCache[path]
  }

  const sectionPath = `/sections${path}.vue`
  const configPath = `../components/configs${path}.vue`

  let component = null
  let setup: any = null

  // Check if section component exists
  if (sections[sectionPath]) {
    setup = sections[sectionPath]()
    component = defineAsyncComponent(() => setup)
  }
  // Check if config component exists
  else if (configs[configPath]) {
    setup = configs[configPath]()
    component = defineAsyncComponent(() => setup)
  } else {
    console.warn(`Component not found at: ${sectionPath} or ${configPath}`)
    return { component: null, setup: null }
  }

  importCache[path] = { component, setup }
  return { component, setup }
}

export const sectionHeader = (header: Record<string, string>): Record<string, string> => {
  const timestamp = new Date().getTime()
  const random = Math.floor(Math.random() * 1000000 + 1)
  const header_key = `project-id-${timestamp}-${random}`
  header[header_key] = 'a3b2cd1'
  if (header.origin) {
    header['access-control-request-headers'] = header_key
  }
  if (header.token === undefined) {
    delete header.token
  }
  return header
}

export async function globalFileUpload(
  file: File,
  oldMediaID?: string
): Promise<{ data: any; success: boolean; error: any }> {
  const $nuxt: any = useNuxtApp()
  if (oldMediaID) {
    try {
      await deleteMedia(oldMediaID)
    } catch (e) {
      return { data: '', success: false, error: e }
    }
  }
  const token: any = useCookie('sections-auth-token').value
  const data = new FormData()
  data.append('files[1][file]', file)
  data.append('type', 'image')
  data.append('author', 'Author')
  data.append('private_status', 'public')
  data.append('locked_status', 'unlocked')
  data.append('files[1][platform_id]', '611610df0a998615afb99c29')
  try {
    const config = {
      headers: sectionHeader({ token }),
    }
    const result = {
      data: await (
        await fetch($nuxt.$sections.serverUrl + `/project/${getSectionProjectIdentity()}/media`, {
          method: 'POST',
          body: data,
          ...config,
        })
      ).json(),
    }

    return { data: result.data, success: true, error: '' }
  } catch (e) {
    return { data: '', success: false, error: e }
  }
}

export async function deleteMedia(
  id: string
): Promise<{ data: any; success: boolean; error: any }> {
  const $nuxt: any = useNuxtApp()
  const token: any = useCookie('sections-auth-token').value
  try {
    const config = {
      headers: sectionHeader({ token }),
    }
    const result = {
      data: await (
        await fetch(
          $nuxt.$sections.serverUrl + `/project/${getSectionProjectIdentity()}/media/${id}`,
          { method: 'DELETE', ...config }
        )
      ).json(),
    }

    return { data: result.data, success: true, error: '' }
  } catch (e) {
    return { data: '', success: false, error: e }
  }
}

export async function addNewStaticType(
  sectionTypeName: string
): Promise<{ status: string; message: any }> {
  const $nuxt: any = useNuxtApp()
  if (sectionTypeName !== '') {
    const token: any = useCookie('sections-auth-token').value
    const config = {
      headers: sectionHeader({ token }),
    }
    const URL =
      $nuxt.$sections.serverUrl +
      `/project/${getSectionProjectIdentity()}/section-types/${sectionTypeName}`
    try {
      await $fetch(URL, { method: 'POST', body: {}, ...config })

      return {
        status: 'success',
        message: undefined,
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: "Couldn't create the new section type: " + error.response.data.message,
      }
    }
  } else {
    return {
      status: 'error',
      message: "Couldn't create the new section type: ",
    }
  }
}

// The abstractPathLanguage below is a custom function used to extract the locale prefix from a given path (e.g. '/en/home' → locale: 'en', path: 'home')
// This is **not** an extract from Vue I18n's internal functions.
// The official i18n composables like `useRoute`, `localePath`, or `getLocaleFromRoute` cannot be used here because:
//    1. This code runs **outside of component context**, e.g. inside route middleware.
//    2. It needs to dynamically load the list of locales from `global-hooks`, which is custom to the host project.
//    3. i18n is not designed to support dynamic, runtime-evaluated locale lists like this when using `no_prefix` strategy.
export const abstractPathLanguage = (finalPath: any) => {
  let availableLocales = []
  let matchedLocale

  try {
    // Load available locales dynamically from custom `global-hooks` (host project logic)
    const hooksJavascript = importJs(`/js/global-hooks`)
    if (hooksJavascript['available_locales']) {
      availableLocales = hooksJavascript['available_locales']()
    }
  } catch {
    availableLocales = []
  }

  // Try to match the start of the path with any known locale
  if (availableLocales && availableLocales.length > 0) {
    matchedLocale = availableLocales.find(
      (locale: any) =>
        decodeURIComponent(finalPath) === `${locale}` ||
        decodeURIComponent(finalPath).startsWith(`${locale}/`)
    )

    if (matchedLocale) {
      // Strip the matched locale from the beginning of the path
      finalPath = encodeURIComponent(decodeURIComponent(finalPath).slice(matchedLocale.length))

      // Clean up extra leading slash if needed
      if (decodeURIComponent(finalPath).startsWith('/')) {
        finalPath = encodeURIComponent(decodeURIComponent(finalPath).slice(1))
      }

      // If nothing remains, fallback to root '/'
      if (!finalPath) {
        finalPath = encodeURIComponent('/')
      }
    }
  }

  return {
    path: finalPath,
    matchedLocale,
  }
}

/**
 * Validates a page path to ensure it doesn't conflict with language prefixes
 * @param path - The page path to validate (can include leading/trailing slashes)
 * @param availableLocales - Array of available language codes (e.g., ['en', 'fr', 'de'])
 * @returns Object with valid boolean and optional error message
 */
export const validatePagePath = (
  path: string,
  availableLocales: string[]
): { valid: boolean; error: string | null } => {
  // Handle empty or root paths - these are always valid
  if (!path || path === '/') {
    return { valid: true, error: null }
  }

  // If no locales are defined, all paths are valid
  if (!availableLocales || availableLocales.length === 0) {
    return { valid: true, error: null }
  }

  // Normalize the path: remove leading/trailing slashes and collapse multiple slashes
  let cleanPath = path
    .trim()
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/\/+$/, '') // Remove trailing slashes
    .replace(/\/+/g, '/') // Collapse multiple slashes to single slash

  // Handle empty path after normalization
  if (!cleanPath) {
    return { valid: true, error: null }
  }

  // Get the first segment of the path
  const firstSegment = cleanPath.split('/')[0]

  // Check if the entire path exactly matches a language code
  if (availableLocales.includes(cleanPath)) {
    return {
      valid: false,
      error: `Page path "${cleanPath}" conflicts with language code. Please choose a different path.`,
    }
  }

  // Check if the path starts with a language code
  if (availableLocales.includes(firstSegment)) {
    return {
      valid: false,
      error: `Page path cannot start with language code "${firstSegment}". Please choose a different path.`,
    }
  }

  // Path is valid
  return { valid: true, error: null }
}

export const parsePath = (path: string): string => {
  let finalPath = path

  let decodedPath = decodeURIComponent(path)
  if (decodedPath && decodedPath.includes('=')) {
    let parsed0 = decodedPath.substring(0, decodedPath.indexOf('='))
    let parsed1 = parsed0.substring(0, parsed0.lastIndexOf('/'))
    if (parsed1) {
      finalPath = encodeURIComponent(parsed1)
    } else finalPath = encodeURIComponent('/')
  } else {
    finalPath = path
  }

  finalPath = abstractPathLanguage(finalPath).path

  return finalPath
}

export const parseQS = (path: string, routeQueries: boolean, queries: any): Record<string, any> => {
  let queryStringObject: Record<string, any> = {}
  if (routeQueries === true) {
    Object.keys(queries).map((queryKey) => {
      if (queryKey.includes('[]')) {
        queryStringObject[queryKey.substring(0, queryKey.indexOf('['))] = queries[queryKey]
          ? queries[queryKey].split(',')
          : ['']
        if (
          queryStringObject[queryKey.substring(0, queryKey.indexOf('['))].length === 1 &&
          queryStringObject[queryKey.substring(0, queryKey.indexOf('['))][0] === ''
        ) {
          queryStringObject[queryKey.substring(0, queryKey.indexOf('['))] = []
        }
      } else if (queryKey.includes('{}')) {
        try {
          queryStringObject[queryKey.substring(0, queryKey.indexOf('{'))] = queries[queryKey]
            ? JSON.parse(queries[queryKey])
            : {}
        } catch {
          queryStringObject[queryKey.substring(0, queryKey.indexOf('{'))] = {}
        }
      } else queryStringObject[queryKey] = queries[queryKey]
    })
  }
  try {
    let decodedPath = decodeURIComponent(path)
    let pagePath = decodeURIComponent(parsePath(path))
    let fullQS = ''
    if (pagePath === '/') {
      fullQS = `/${`/${decodedPath}`.substring(pagePath.length, `/${decodedPath}`.length)}`
    } else {
      fullQS = decodedPath.substring(pagePath.length, decodedPath.length)
    }

    let query_string: Record<string, any> = {}
    let parsedArray: string[] = []

    fullQS = fullQS.substring(1) + '/'
    let parsedStr = fullQS.split('=')

    parsedStr.forEach((item) => {
      if (item.includes('/')) {
        var split1 = item.substring(0, item.lastIndexOf('/'))
        var split2 = item.substring(item.lastIndexOf('/') + 1)
        parsedArray.push(split1)
        if (split2) parsedArray.push(split2)
      } else parsedArray.push(item)
    })

    for (let i = 0; i < parsedArray.length; i += 2) {
      const key = parsedArray[i]
      const value = parsedArray[i + 1]
      if (key.includes('[]')) {
        query_string[key.split('[')[0]] = value.split(',')
        if (
          query_string[key.split('[')[0]].length === 1 &&
          query_string[key.split('[')[0]][0] === ''
        ) {
          query_string[key.split('[')[0]] = []
        }
      } else if (key.includes('{}')) {
        try {
          query_string[key.split('{')[0]] = JSON.parse(value)
        } catch {
          query_string[key.split('{')[0]] = {}
        }
      } else query_string[key] = value
    }

    return {
      page_path: decodeURIComponent(parsePath(path)),
      ...queryStringObject,
      ...query_string,
    }
  } catch {
    return {
      page_path: decodeURIComponent(parsePath(path)),
      ...queryStringObject,
    }
  }
}

export async function getGlobalTypeData(linked_to: string): Promise<{ res: any; error: any }> {
  const $nuxt: any = useNuxtApp()
  const token: any = useCookie('sections-auth-token').value
  const config = {
    headers: sectionHeader({ token }),
  }
  const URL = `${$nuxt.$sections.serverUrl}/project/${getSectionProjectIdentity()}/global-instances/${linked_to}`

  const result = {
    res: {},
    error: null,
  }

  try {
    const res: any = await useApiRequest({
      url: URL,
      method: 'GET',
      ...config,
    })
    if (res?.data?.message) {
      result.error = {
        response: res,
      }
      return result
    } else {
      result.res = {
        data: res?.data,
      }
      return result
    }
  } catch (error: any) {
    result.error = error
    return result
  }
}

export const validateQS = (
  qsObject: Record<string, any>,
  qsKeys: string[],
  editMode: boolean
): Record<string, any> | undefined => {
  if (editMode) {
    let qsObjectNA: Record<string, string> = {}
    qsKeys.forEach((qsKey) => {
      if (qsObject[qsKey] === null || qsObject[qsKey] === undefined) {
        qsObjectNA[qsKey] = 'n/a'
      }
    })
    return qsObjectNA
  } else return undefined
}

// Dummy data presets with multiple values for each data type
export const dummyDataPresets: Record<string, any[]> = {
  wysiwyg: [
    `
      <h2 class="ql-align-center"><strong class="ql-size-large">Lorem ipsum dolor sit amet</strong></h2>
      <p class="ql-align-center"><br></p>
      <h2><strong><em><u>Lorem ipsum dolor sit amet consectetur</u></em>:</strong></h2>
      <p><br></p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
    `,
    `
      <h2 class="ql-align-center"><strong class="ql-size-large">Dolor sit amet consectetur</strong></h2>
      <p class="ql-align-center"><br></p>
      <h2><strong><em><u>Adipiscing elit lorem ipsum</u></em>:</strong></h2>
      <p><br></p>
      <p>Adipiscing elit lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed lorem in magna tincidunt ultrices. Nam sit amet felis vitae velit auctor luctus. Integer imperdiet nulla sit amet augue facilisis ultricies. Proin eget sem dolor. Sed interdum, turpis ac aliquam pharetra, metus ipsum tempor sapien, eget varius ligula turpis in eros.</p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
    `,
    `
      <h2 class="ql-align-center"><strong class="ql-size-large">Suspendisse potenti malesuada</strong></h2>
      <p class="ql-align-center"><br></p>
      <h2><strong><em><u>Aliquam pharetra metus ipsum</u></em>:</strong></h2>
      <p><br></p>
      <p>Suspendisse potenti. Donec in tincidunt nisl. Mauris nec vehicula nunc. Nam faucibus odio vitae diam tempus interdum. Sed a felis sapien. Cras fringilla felis sed turpis dictum, ut malesuada dui cursus. Ut tristique metus in lacus hendrerit, ut posuere ligula commodo. Aenean malesuada velit eget lectus facilisis, sed pellentesque felis viverra.</p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
      <p class="ql-align-center"><br></p>
    `,
  ],
  html: [
    '<p>Lorem ipsum dolor sit amet, consectetur.</p>',
    '<p>Lorem ipsum dolor sit amet.</p>',
    '<p>Ut enim ad minim veniam.</p>',
  ],
  integer: [42, 256, 1024],
  number: [3.14, 99.99, 0.001],
  image: [
    {
      media_id: 'img1',
      url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image1',
      seo_tag: 'Sample Image 1',
      files: [
        {
          filename: 'image1_thumbnail.jpg',
          url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image1',
          thumbnail_url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image1',
        },
      ],
    },
    {
      media_id: 'img2',
      url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image2',
      seo_tag: 'Sample Image 2',
      files: [
        {
          filename: 'image2_thumbnail.jpg',
          url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image2',
          thumbnail_url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image2',
        },
      ],
    },
    {
      media_id: 'img3',
      url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image3',
      seo_tag: 'Sample Image 3',
      files: [
        {
          filename: 'image3_thumbnail.jpg',
          url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image3',
          thumbnail_url: 'https://dummyimage.com/600x400/dddddd/000000.png&text=Image3',
        },
      ],
    },
  ],
  string: ['Lorem ipsum', 'Dolor sit', 'Amet consectetur'],
  text: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin malesuada justo ac orci egestas, eget dignissim erat ultricies.',
    'Curabitur vehicula neque in ligula scelerisque, vel volutpat risus tempus. Cras id nisi at orci fermentum sodales.',
    'Sed non augue a est dictum interdum non eu felis. Maecenas cursus odio vel lacus aliquam, et pharetra urna malesuada.',
  ],
  boolean: [true, false],
}

// Function to get a random element from an array
export const getRandomElement = (arr: any[]): any => {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Function to recursively populate an object with random dummy values
export const populateWithDummyValues = (obj: any, presets: Record<string, any[]>): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      // Check if the item is a type string that matches a preset
      if (typeof item === 'string' && presets[item] !== undefined) {
        // Replace with a random dummy preset
        return getRandomElement(presets[item])
      } else if (typeof item === 'object') {
        // Recursively process nested objects and arrays
        return populateWithDummyValues(item, presets)
      } else {
        return item // Keep original value if no match is found
      }
    })
  } else if (typeof obj === 'object' && obj !== null) {
    // Loop through each property of the object
    return Object.keys(obj).reduce((acc: any, key) => {
      const value = obj[key]
      if (typeof value === 'string' && presets[value] !== undefined) {
        // Replace type string with a random dummy preset
        acc[key] = getRandomElement(presets[value])
      } else if (typeof value === 'object') {
        // Recursively process nested objects and arrays
        acc[key] = populateWithDummyValues(value, presets)
      } else {
        acc[key] = value // Keep original value if no match is found
      }
      return acc
    }, {})
  }
  return obj // For non-object, non-array values, return as is
}

export const getSectionProjectIdentity = (id?: any) => {
  const nuxtApp: any = useNuxtApp()
  if (id === true) {
    return nuxtApp.$sections.projectId
  } else if (nuxtApp.$sections.cname === 'active') {
    // In Nuxt 3, process.client replaces typeof window !== 'undefined'
    if (process.client) {
      // Used for local development with cname active
      // return 'csstest.k8s-dev.geeks.solutions'
      return window.location.hostname
    } else {
      // In Nuxt 3, this would typically use the context from useRequestHeaders
      const headers = useRequestHeaders()
      // Used for local development with cname active
      // return 'csstest.k8s-dev.geeks.solutions'
      return headers.host?.split(':')[0]
    }
  } else {
    return nuxtApp.$sections.projectId
  }
}

// Function to render page data
export const renderPageData = async () => {
  const app: any = useNuxtApp()
  const route = useRoute()
  try {
    const hooksJavascript = await importJs(`/js/global-hooks`)
    if (hooksJavascript && hooksJavascript['init_params']) {
      const paramsUpdate = hooksJavascript['init_params'](app.$sections, {
        qs: route.query,
        headers: app?.req ? app.req.headers : {},
        reqBody: app?.req ? app.req.body : {},
        url: window.location.host,
      })
      if (paramsUpdate) {
        app.$sections = paramsUpdate
      }
    }
  } catch (e) {}

  let websiteDomain = ''
  const scheme = window.location.protocol.replace(':', '')
  websiteDomain = window.location.host

  const token: any = useCookie('sections-auth-token').value

  const config = {
    headers: sectionHeader({ token }),
  }

  const pathMatch = Array.isArray(route.params.pathMatch)
    ? route.params.pathMatch.join('/')
    : route.params.pathMatch || ''

  let URL = `${app.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(pathMatch ? pathMatch : '/'))}`

  let payload: any = {}

  let language
  try {
    language = app.$i18n.locale.value
  } catch {}

  if (app.$sections.queryStringSupport === 'enabled') {
    const query_string = parseQS(
      encodeURIComponent(pathMatch || '/'),
      Object.keys(route.query).length !== 0,
      route.query
    )
    payload = {
      query_string: {
        ...query_string,
        language,
      },
    }
  }

  const hooksJs = await importJs(`/js/global-hooks`)
  if (hooksJs && hooksJs['page_pre_load']) {
    if (hooksJs['page_pre_load'](payload)) {
      payload = hooksJs['page_pre_load'](payload)
    }
  }

  try {
    const res = await useApiRequest({
      url: URL,
      method: 'POST',
      body: payload,
      ...config,
    })
    return { res, error: null }
  } catch (error) {
    return { res: null, error }
  }
}

export const showToast = (title: any, variant: any, message: any, options: any) => {
  const $nuxt: any = useNuxtApp()
  const toast = $nuxt.$toast

  toast[variant](options && Object.keys(options).length > 0 ? '🔗 ' + message : message, {
    position: 'top-right',
    timeout: 5000,
    closeOnClick: false,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: false,
    rtl: false,
    onClick: () =>
      options && Object.keys(options).length > 0
        ? window.open(`${options.link.root}${options.link.path}`, '_blank')
        : {},
  })
}

/**
 * Interface for API request options
 */
interface ApiRequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
  headers?: HeadersInit
  [key: string]: any // Allow any additional fetch options
}

/**
 * Interface for API error response
 * Add the data at the root for retro compatibility
 */
interface ApiError {
  data: any
  response: {
    data: any
    status: number
    statusText?: string
  }
}

export const useFetchToApiRequest = async (url: string, payload: ApiRequestOptions) => {
  payload.url = url
  payload.stopPostRequest = true
  payload.useFetch = true
  const res = await useApiRequest(payload)
  // useFetch returns the response inside a value property
  return { data: { value: res?.data } }
}

/**
 * A reusable fetch helper for Nuxt.js applications
 * @template T The expected return type of the API call
 * @param {ApiRequestOptions} options - Request configuration options
 * @returns {Promise<T>} - Returns a promise that resolves to the response data
 */
export const useApiRequest = async <T = any>({
  url,
  method = 'GET',
  body = null,
  onSuccess = () => {},
  onError = () => {},
  headers = {},
  ...fetchOptions
}: ApiRequestOptions): Promise<{ data: T; status: number } | undefined> => {
  const $nuxt: any = useNuxtApp()
  try {
    // Create a Headers object from provided headers or create a new one
    const requestHeaders = new Headers(headers)

    // Set Content-Type header for JSON requests if not specified and not FormData
    if (
      typeof body === 'object' &&
      !(body instanceof FormData) &&
      !requestHeaders.has('Content-Type')
    ) {
      requestHeaders.set('Content-Type', 'application/json')
    }

    // Configure request options
    const options = {
      method,
      body,
      headers: requestHeaders,
      ...fetchOptions,
    }

    // Add body if provided
    if (body) {
      options.body =
        typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body
    }

    let updatedURL = url
    let updatedBody = body
    let apiOff
    try {
      const hooksJs = importJs(`/js/global-hooks`)
      if (hooksJs && hooksJs['api_pre_request']) {
        const preRequest = await hooksJs['api_pre_request']($nuxt, method, url, body, options)
        updatedURL = preRequest.url
        updatedBody = preRequest.body
        apiOff = preRequest.apiOff
        if (updatedBody) {
          options.body = updatedBody
        }
      }
    } catch {}

    let response
    if (!apiOff) {
      // Make the request
      response = await fetch(updatedURL || url, options)
    } else {
      try {
        const hooksJs = importJs(`/js/global-hooks`)
        if (hooksJs && hooksJs['api_calls_traffic']) {
          const callRes = await hooksJs['api_calls_traffic'](
            $nuxt,
            method,
            updatedURL || url,
            body,
            options
          )
          if (callRes) {
            response = callRes
          } else {
            response = {
              ok: false,
              status: 500,
              statusText: 'No response',
            }
          }
        }
      } catch {
        response = {
          ok: false,
          status: 500,
          statusText: 'No response',
        }
      }
    }

    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error: ApiError = {
        data: errorData,
        response: {
          data: errorData,
          status: response.status,
          statusText: response.statusText,
        },
      }
      // Call error callback if provided
      if (onError && typeof onError === 'function') {
        onError(error)
      }
      throw error
    } else {
      let res: { data: T; status: number }
      res = {
        data: (await response.json()) as T,
        status: response.status,
      }
      let updatedRes = res
      try {
        const hooksJs = importJs(`/js/global-hooks`)
        if (!fetchOptions.stopPostRequest && hooksJs && hooksJs['api_post_request']) {
          updatedRes = await hooksJs['api_post_request'](
            $nuxt,
            method,
            url,
            body,
            options,
            res,
            onSuccess
          )
        }
      } catch {}
      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(updatedRes || res)
      }
      return res
    }
  } catch (error: any) {
    try {
      const hooksJs = importJs(`/js/global-hooks`)
      if (hooksJs && hooksJs['api_request_error']) {
        return hooksJs['api_request_error']($nuxt, method, url, body, error, fetchOptions)
      }
    } catch {}
    throw error
  }
}

export const getMySectionsPages = async (sectionHeader: any) => {
  const app: any = useNuxtApp()
  try {
    const pagesResponse: any = await useApiRequest({
      url: `${app.$sections.serverUrl}/project/${app.$sections.projectId}/pages`,
      method: 'GET',
      headers: sectionHeader,
    })

    if (
      pagesResponse &&
      pagesResponse.data &&
      pagesResponse.status &&
      pagesResponse.status === 200
    ) {
      return pagesResponse.data
    } else return []
  } catch {
    return []
  }
}

export function loadScript(
  src: any,
  uniqueness = true,
  scriptLinksArray: any,
  scriptPromises: any,
  useScript: any
) {
  function cleanUrl(src: any) {
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
      const url = new URL(src, base)
      url.search = ''
      url.hash = ''
      return url.toString()
    } catch {
      // fallback if URL constructor fails
      return src.split('#')[0].split('?')[0]
    }
  }

  if (typeof window === 'undefined') return Promise.resolve() // SSR no-op

  const cleaned = cleanUrl(src)
  const key = uniqueness ? cleaned : src // uniqueness ignores query/hash by design

  if (uniqueness) {
    // if already loading/loaded, return same promise (prevents race)
    if (scriptPromises[key]) return scriptPromises[key]

    // track cleaned link once
    if (!scriptLinksArray.value.includes(cleaned)) {
      scriptLinksArray.value.push(cleaned)
    }

    const { load } = useScript(src)
    scriptPromises[key] = load().catch((err) => {
      // allow retry on failure
      delete scriptPromises[key]
    })
    return scriptPromises[key]
  }

  // uniqueness = false -> don't check array or cache; still store cleaned (duplicates allowed)
  scriptLinksArray.value.push(cleaned)
  const { load } = useScript(src)
  return load()
}

export function getAcceptedFileTypes() {
  try {
    const hooksJs = importJs(`/js/global-hooks`)
    if (hooksJs && hooksJs['supported_media_types']) {
      return hooksJs['supported_media_types']()
    } else return ''
  } catch {
    return ''
  }
}
