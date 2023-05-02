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
