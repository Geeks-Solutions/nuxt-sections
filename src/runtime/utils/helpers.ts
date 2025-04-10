import { useNuxtApp, useCookie } from "#app";

export function formatName(name: string): string {
  switch (name) {
    default:
      return (
        name.split(":")[name.split(":").length - 1].replace(/_/g, " ") ||
        "unlabeled"
      );
  }
}

export const formatTexts = (text: string, sep: string = " "): string => {
  let updatedText = text;
  const hooksJs = importJs(`/js/global-hooks`);
  if (hooksJs['update_section_name']) {
    if (hooksJs['update_section_name'](text)) {
      updatedText = hooksJs['update_section_name'](text);
    }
  }
  const result = updatedText.replace(/([A-Z])/g, `${sep}$1`);
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export const importJs = (path: string): any => {
  try {
    return require(`@/sections${path}.js`);
  } catch (e) {
    return '';
  }
}

export const importComp = (path: string): any => {
  try {
    const component = require(`../../../.././sections${path}.vue`);
    return component.default;
  } catch (e) {
    try {
      const component = require(`../configs${path}.vue`);
      return component.default;
    } catch (e) {
      return '';
    }
  }
}

export const sectionHeader = (header: Record<string, string>): Record<string, string> => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000 + 1);
  const header_key = `project-id-${timestamp}-${random}`;
  header[header_key] = "a3b2cd1";
  if (header.origin) {
    header['access-control-request-headers'] = header_key;
  }
  return header;
}

export async function globalFileUpload(file: File, oldMediaID?: string): Promise<{ data: any, success: boolean, error: any }> {
  const $nuxt : any = useNuxtApp();
  if (oldMediaID) {
    try {
      await deleteMedia(oldMediaID);
    } catch (e) {
      return { data: '', success: false, error: e };
    }
  }
  const token : any = useCookie("sections-auth-token").value;
  const data = new FormData();
  data.append('files[1][file]', file);
  data.append('type', "image");
  data.append('author', "Author");
  data.append('private_status', "public");
  data.append('locked_status', "unlocked");
  data.append('files[1][platform_id]', '611610df0a998615afb99c29');
  try {
    const config = {
      headers: sectionHeader({ token }),
    };
    const result = await $nuxt.$axios.post(
      $nuxt.$sections.serverUrl +
      `/project/${$nuxt.$sections.projectId}/media`,
      data,
      config
    );
    return { data: result.data, success: true, error: '' };
  } catch (e) {
    return { data: '', success: false, error: e };
  }
}

export async function deleteMedia(id: string): Promise<{ data: any, success: boolean, error: any }> {
  const $nuxt : any = useNuxtApp();
  const token : any = useCookie("sections-auth-token").value;
  try {
    const config = {
      headers: sectionHeader({ token }),
    };
    const result = await $nuxt.$axios.delete($nuxt.$sections.serverUrl + `/project/${$nuxt.$sections.projectId}/media/${id}`,
      config
    );
    return { data: result.data, success: true, error: '' };
  } catch (e) {
    return { data: '', success: false, error: e };
  }
}

export async function addNewStaticType(sectionTypeName: string): Promise<{ status: string, message: any }> {
  const $nuxt : any = useNuxtApp();
  if (sectionTypeName !== "") {
    const token : any = useCookie("sections-auth-token").value;
    const config = {
      headers: sectionHeader({ token })
    };
    const URL = $nuxt.$sections.serverUrl + `/project/${$nuxt.$sections.projectId}/section-types/${sectionTypeName}`;
    try {
      await $nuxt.$axios.post(URL, {}, config);
      return {
        status: 'success',
        message: undefined
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: "Couldn't create the new section type: " + error.response.data.message
      };
    }
  } else {
    return {
      status: 'error',
      message: "Couldn't create the new section type: "
    }
  }
}

export const parsePath = (path: string): string => {
  let decodedPath = decodeURIComponent(path);
  if (decodedPath && decodedPath.includes('=')) {
    let parsed0 = decodedPath.substring(0, decodedPath.indexOf('='));
    let parsed1 = parsed0.substring(0, parsed0.lastIndexOf('/'));
    if (parsed1) {
      return encodeURIComponent(parsed1);
    } else return encodeURIComponent('/');
  } else {
    return path;
  }
}

export const parseQS = (path: string, routeQueries: boolean, queries: Record<string, string>): Record<string, any> => {
  let queryStringObject: Record<string, any> = {};
  if (routeQueries === true) {
    Object.keys(queries).map((queryKey) => {
      if (queryKey.includes('[]')) {
        queryStringObject[queryKey.substring(0, queryKey.indexOf('['))] = queries[queryKey] ? queries[queryKey].split(',') : [""];
        if (queryStringObject[queryKey.substring(0, queryKey.indexOf('['))].length === 1 && queryStringObject[queryKey.substring(0, queryKey.indexOf('['))][0] === "") {
          queryStringObject[queryKey.substring(0, queryKey.indexOf('['))] = [];
        }
      } else if (queryKey.includes('{}')) {
        try {
          queryStringObject[queryKey.substring(0, queryKey.indexOf('{'))] = queries[queryKey] ? JSON.parse(queries[queryKey]) : {};
        } catch {
          queryStringObject[queryKey.substring(0, queryKey.indexOf('{'))] = {};
        }
      } else queryStringObject[queryKey] = queries[queryKey];
    });
  }
  try {
    let decodedPath = decodeURIComponent(path);
    let pagePath = decodeURIComponent(parsePath(path));
    let fullQS = '';
    if (pagePath === '/') {
      fullQS = `/${`/${decodedPath}`.substring(pagePath.length, `/${decodedPath}`.length)}`;
    } else {
      fullQS = decodedPath.substring(pagePath.length, decodedPath.length);
    }

    let query_string: Record<string, any> = {};
    let parsedArray: string[] = [];

    fullQS = fullQS.substring(1) + "/";
    let parsedStr = fullQS.split('=');

    parsedStr.forEach((item) => {
      if (item.includes('/')) {
        var split1 = item.substring(0, item.lastIndexOf('/'));
        var split2 = item.substring(item.lastIndexOf('/') + 1);
        parsedArray.push(split1);
        if (split2) parsedArray.push(split2);
      } else parsedArray.push(item);
    });

    for (let i = 0; i < parsedArray.length; i += 2) {
      const key = parsedArray[i];
      const value = parsedArray[i + 1];
      if (key.includes("[]")) {
        query_string[key.split('[')[0]] = value.split(",");
        if (query_string[key.split('[')[0]].length === 1 && query_string[key.split('[')[0]][0] === "") {
          query_string[key.split('[')[0]] = [];
        }
      } else if (key.includes("{}")) {
        try {
          query_string[key.split('{')[0]] = JSON.parse(value);
        } catch {
          query_string[key.split('{')[0]] = {};
        }
      } else query_string[key] = value;
    }

    return {
      page_path: decodeURIComponent(parsePath(path)),
      ...queryStringObject,
      ...query_string
    };
  } catch {
    return {
      page_path: decodeURIComponent(parsePath(path)),
      ...queryStringObject
    };
  }
}

export async function getGlobalTypeData(linked_to: string): Promise<{ res: any, error: any }> {
  const $nuxt : any = useNuxtApp();
  const token : any = useCookie("sections-auth-token").value;
  const config = {
    headers: sectionHeader({ token }),
  };
  const URL =
    `${$nuxt.$sections.serverUrl}/project/${$nuxt.$sections.projectId}/global-instances/${linked_to}`;

  const result = {
    res: null,
    error: null
  };

  try {
    result.res = await $nuxt.$axios.get(URL, config);
    return result;
  } catch (error: any) {
    result.error = error;
    return result;
  }
}

export const validateQS = (qsObject: Record<string, any>, qsKeys: string[], editMode: boolean): Record<string, any> | undefined => {
  if (editMode === true) {
    let qsObjectNA: Record<string, string> = {};
    qsKeys.forEach(qsKey => {
      if (qsObject[qsKey] === null || qsObject[qsKey] === undefined) {
        qsObjectNA[qsKey] = 'n/a';
      }
    });
    return qsObjectNA;
  } else return undefined;
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
    `
  ],
  html: [
    "<p>Lorem ipsum dolor sit amet, consectetur.</p>",
    "<p>Lorem ipsum dolor sit amet.</p>",
    "<p>Ut enim ad minim veniam.</p>"
  ],
  integer: [42, 256, 1024],
  number: [3.14, 99.99, 0.001],
  image: [
    {
      media_id: "img1",
      url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image1",
      seo_tag: "Sample Image 1",
      files: [
        { filename: "image1_thumbnail.jpg", url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image1", thumbnail_url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image1" }
      ]
    },
    {
      media_id: "img2",
      url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image2",
      seo_tag: "Sample Image 2",
      files: [
        { filename: "image2_thumbnail.jpg", url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image2", thumbnail_url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image2" }
      ]
    },
    {
      media_id: "img3",
      url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image3",
      seo_tag: "Sample Image 3",
      files: [
        { filename: "image3_thumbnail.jpg", url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image3", thumbnail_url: "https://dummyimage.com/600x400/dddddd/000000.png&text=Image3" }
      ]
    }
  ],
  string: ["Lorem ipsum", "Dolor sit", "Amet consectetur"],
  text: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin malesuada justo ac orci egestas, eget dignissim erat ultricies.",
    "Curabitur vehicula neque in ligula scelerisque, vel volutpat risus tempus. Cras id nisi at orci fermentum sodales.",
    "Sed non augue a est dictum interdum non eu felis. Maecenas cursus odio vel lacus aliquam, et pharetra urna malesuada."
  ],
  boolean: [true, false]
}

// Function to get a random element from an array
export const getRandomElement = (arr: any[]): any => {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Function to recursively populate an object with random dummy values
export const populateWithDummyValues = (obj: any, presets: Record<string, any[]>): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      // Check if the item is a type string that matches a preset
      if (typeof item === 'string' && presets[item] !== undefined) {
        // Replace with a random dummy preset
        return getRandomElement(presets[item]);
      } else if (typeof item === 'object') {
        // Recursively process nested objects and arrays
        return populateWithDummyValues(item, presets);
      } else {
        return item; // Keep original value if no match is found
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    // Loop through each property of the object
    return Object.keys(obj).reduce((acc: any, key) => {
      const value = obj[key];
      if (typeof value === 'string' && presets[value] !== undefined) {
        // Replace type string with a random dummy preset
        acc[key] = getRandomElement(presets[value]);
      } else if (typeof value === 'object') {
        // Recursively process nested objects and arrays
        acc[key] = populateWithDummyValues(value, presets);
      } else {
        acc[key] = value; // Keep original value if no match is found
      }
      return acc;
    }, {});
  }
  return obj; // For non-object, non-array values, return as is
}

interface RenderPageDataParams {
  app: any;
  pageName: string;
}

// Function to render page data
export const renderPageData = async ({ app, pageName }: RenderPageDataParams) => {
  try {
    const hooksJavascript = await importJs(`/js/global-hooks`);
    if (hooksJavascript['init_params']) {
      const paramsUpdate = hooksJavascript['init_params'](app.context.$sections, {
        qs: app.context.route.query,
        headers: app.context?.req ? app.context.req.headers : {},
        reqBody: app.context?.req ? app.context.req.body : {},
        url: window.location.host
      });
      if (paramsUpdate) {
        app.context.$sections = paramsUpdate;
      }
    }
  } catch (e) {}

  let websiteDomain = "";
  const scheme = window.location.protocol.replace(':', '');
  websiteDomain = window.location.host;

  const config = {
    headers: sectionHeader({})
  };

  let URL = `${app.context.$sections.serverUrl}/project/${app.context.$sections.projectId}/page/${parsePath(encodeURIComponent(pageName ? pageName : app.context.route.params.pathMatch ? app.context.route.params.pathMatch : '/'))}`;

  if (app.context.$sections.cname === "active") {
    URL = `${app.context.$sections.serverUrl}/project/${websiteDomain}/page/${parsePath(encodeURIComponent(pageName ? pageName : app.context.route.params.pathMatch ? app.context.route.params.pathMatch : '/'))}`;
  }

  let payload = {};

  let language;
  try {
    language = app.context.i18n.locale;
  } catch {}

  if (app.context.$sections.queryStringSupport === "enabled") {
    const query_string = parseQS(encodeURIComponent(app.context.route.params.pathMatch || '/'), Object.keys(app.context.route.query).length !== 0, app.context.route.query);
    payload = {
      query_string: {
        ...query_string,
        language
      }
    };
  }

  const hooksJs = await importJs(`/js/global-hooks`);
  if (hooksJs['page_pre_load']) {
    if (hooksJs['page_pre_load'](payload)) {
      payload = hooksJs['page_pre_load'](payload);
    }
  }

  try {
    const res = await app.context.$axios.post(URL, payload, config);
    return { res, error: null };
  } catch (error) {
    return { res: null, error };
  }
};
