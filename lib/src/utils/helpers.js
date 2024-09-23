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
  const result = text.replace(/([A-Z])/g, `${sep}$1`);
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
