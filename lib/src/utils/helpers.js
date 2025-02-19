export function formatName(name) {
  switch (name) {
    default:
      return (
        name.split(":")[name.split(":").length - 1].replace(/_/g, " ") ||
        "unlabled"
      );
  }
}

export const formatTexts = (text, sep = " ") => {
  let updatedText = text
  let hooksJs = importJs(`/js/global-hooks`)
  if (hooksJs['update_section_name']) {
    if (hooksJs['update_section_name'](text)) {
      updatedText = hooksJs['update_section_name'](text)
    }
  }
  const result = updatedText.replace(/([A-Z])/g, `${sep}$1`);
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
}

export const importJs = (path) => {
  try {
    return require(`@/sections${path}.js`)
  } catch (e) {
    return ''
  }
}

export const importComp = (path) => {
  try {
    const component = require(`../../../.././sections${path}.vue`)
    return component.default
  } catch (e) {
    try {
      const component = require(`../configs${path}.vue`)
      return component.default
    } catch (e) {
      return ''
    }
  }
}

export const sectionHeader = (header) => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000 + 1);
  const header_key = `project-id-${timestamp}-${random}`;
  header[header_key] = "a3b2cd1";
  if(header.origin){
    header['access-control-request-headers'] = header_key;
  }
  return header
}

export async function globalFileUpload(file, oldMediaID) {
  if(oldMediaID) {
    try {
      await deleteMedia(oldMediaID)
    } catch (e) {
      return {data: '', success: false, error: e}
    }
  }
  const token = window.$nuxt.$cookies.get("sections-auth-token")
  const data = new FormData()
  data.append('files[1][file]', file)
  data.append('type', "image")
  data.append('author', "Author")
  data.append('private_status', "public")
  data.append('locked_status', "unlocked")
  data.append('files[1][platform_id]', '611610df0a998615afb99c29')
  try {
    const config = {
      headers: sectionHeader({ token }),
    };
    const result = await window.$nuxt.$axios.post(
      window.$nuxt.$sections.serverUrl +
      `/project/${window.$nuxt.$sections.projectId}/media`,
      data,
      config
    )
    return {data: result.data, success: true, error: ''}
  } catch (e) {
    return {data: '', success: false, error: e}
  }
}

export async function deleteMedia(id) {
  const token = window.$nuxt.$cookies.get("sections-auth-token")
  try {
    const config = {
      headers: sectionHeader({ token }),
    };
    const result = await window.$nuxt.$axios.delete(window.$nuxt.$sections.serverUrl + `/project/${window.$nuxt.$sections.projectId}/media/${id}`,
      config
    )
    return {data: result.data, success: true, error: ''}
  } catch (e) {
    return {data: '', success: false, error: e}
  }
}

export async function addNewStaticType(sectionTypeName) {
  if (sectionTypeName !== "") {
    const token = window.$nuxt.$cookies.get("sections-auth-token");
    const config = {
      headers: sectionHeader({
        token
      })
    };
    const URL = window.$nuxt.$sections.serverUrl + `/project/${window.$nuxt.$sections.projectId}/section-types/${sectionTypeName}`;
    try {
      await window.$nuxt.$axios.post(URL, {}, config)
      return  {
        status: 'success'
      };
    } catch (error) {
      return {
        status: 'error',
        message: "Couldn't create the new section type: " + error.response.data.message
      };
    }
  }
}

export const parsePath = (path) => {
  let decodedPath = decodeURIComponent(path)
  if (decodedPath && decodedPath.includes('=')) {
    let parsed0 = decodedPath.substring(0, decodedPath.indexOf('='))
    let parsed1 = parsed0.substring(0, parsed0.lastIndexOf('/'))
    if (parsed1) {
      return encodeURIComponent(parsed1)
    } else return encodeURIComponent('/')
  } else {
    return path
  }
}

export const parseQS = (path, routeQueries, queries) => {
  let queryStringObject = {}
  if (routeQueries === true) {
    Object.keys(queries).map((queryKey) => {
      if (queryKey.includes('[]')) {
        queryStringObject[queryKey.substring(0, queryKey.indexOf('['))] = queries[queryKey] ? queries[queryKey].split(',') : [""]
        if (queryStringObject[queryKey.substring(0, queryKey.indexOf('['))].length === 1 && queryStringObject[queryKey.substring(0, queryKey.indexOf('['))][0] === "") {
          queryStringObject[queryKey.substring(0, queryKey.indexOf('['))] = []
        }
      } else if (queryKey.includes('{}')) {
        try {
          queryStringObject[queryKey.substring(0, queryKey.indexOf('{'))] = queries[queryKey] ? JSON.parse(queries[queryKey]) : {}
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

    let query_string = {};
    let parsedArray = [];

    fullQS = fullQS.substring(1) + "/";
    let parsedStr = fullQS.split('=');

    parsedStr.forEach((item) => {
      if(item.includes('/')) {
        var split1 = item.substring(0, item.lastIndexOf('/'));
        var split2 = item.substring(item.lastIndexOf('/') + 1);
        parsedArray.push(split1);
        if(split2) parsedArray.push(split2);
      } else parsedArray.push(item);
    });

    for (let i = 0; i < parsedArray.length; i += 2) {
      const key = parsedArray[i];
      const value = parsedArray[i + 1];
      if(key.includes("[]")) {
        query_string[key.split('[')[0]] = value.split(",");
        if (query_string[key.split('[')[0]].length === 1 && query_string[key.split('[')[0]][0] === "") {
          query_string[key.split('[')[0]] = []
        }
      } else if(key.includes("{}")) {
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
    }
  } catch {
    return {
      page_path: decodeURIComponent(parsePath(path)),
      ...queryStringObject
    };
  }
}

export async function getGlobalTypeData(linked_to) {
  const token = window.$nuxt.$cookies.get("sections-auth-token");
  const config = {
    headers: sectionHeader({ token }),
  };
  const URL =
    `${window.$nuxt.$sections.serverUrl}/project/${window.$nuxt.$sections.projectId}/global-instances/${linked_to}`;

  const result = {
    res: null,
    error: null
  }

  try {
    result.res = await window.$nuxt.$axios.get(URL, config)
    return result
  } catch (error) {
    result.error = error
    return result
  }
}

export const validateQS = (qsObject, qsKeys, editMode) => {
  if (editMode === true) {
    let qsObjectNA = {}
    qsKeys.forEach(qsKey => {
      if (qsObject[qsKey] === null || qsObject[qsKey] === undefined) {
        qsObjectNA[qsKey] = 'n/a'
      }
    })
    return qsObjectNA
  } else return undefined
}

// Dummy data presets with multiple values for each data type
export const dummyDataPresets = {
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
export const getRandomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Function to recursively populate an object with random dummy values
export const populateWithDummyValues = (obj, presets) => {
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
    return Object.keys(obj).reduce((acc, key) => {
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

export const renderPageData = async (app, pageName) => {
  let websiteDomain = ""
  const scheme = window.location.protocol.replace(':', '');

  websiteDomain = window.location.host

  const config = {
    headers: sectionHeader({}),
  };

  let URL = `${app.context.$sections.serverUrl}/project/${app.context.$sections.projectId}/page/${parsePath(encodeURIComponent(pageName ? pageName : app.context.route.params.pathMatch ? app.context.route.params.pathMatch : '/'))}`;

  if (app.context.$sections.cname === "active") {
    URL = `${app.context.$sections.serverUrl}/project/${websiteDomain}/page/${parsePath(encodeURIComponent(pageName ? pageName : app.context.route.params.pathMatch ? app.context.route.params.pathMatch : '/'))}`;
  }
  let payload = {}

  let language = undefined
  try {
    language = app.context.i18n.locale
  } catch {}

  if (app.context.$sections.queryStringSupport && app.context.$sections.queryStringSupport === "enabled") {
    let query_string = parseQS(encodeURIComponent(app.context.route.params.pathMatch ? app.context.route.params.pathMatch : '/'), Object.keys(app.context.route.query).length !== 0, app.context.route.query)
    payload = {
      query_string: {
        ...query_string,
        language
      }
    }
  }

  let hooksJs = importJs(`/js/global-hooks`)
  if (hooksJs['page_pre_load']) {
    if (hooksJs['page_pre_load'](payload)) {
      payload = hooksJs['page_pre_load'](payload)
    }
  }

  try {
    const res = await app.context.$axios.post(URL, payload, config)
    return { res, error: null }
  } catch (error) {
    return { res: null, error }
  }

}
