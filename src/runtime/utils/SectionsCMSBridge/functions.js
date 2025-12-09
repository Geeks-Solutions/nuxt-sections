import { sectionHeader, useCookie, useNuxtApp, getSectionProjectIdentity } from "#imports";
import { useFetch } from "#app";

export const createMedia = async (payload, external_call) => {
  const nuxtApp = useNuxtApp();
  const fileData = payload['files[1][file]']
  if (!payload['files[1][file]']) return

  const data = new FormData()

  data.append('files[1][platform_id]', '1')
  data.append('files[1][file]', fileData)
  data.append('type', fileData.type.includes('image') ? 'image' : 'document')
  data.append('title', payload['title'] || '')
  data.append('seo_tag', payload['seo_tag'] || '')
  data.append('private_status', payload['private_status'] || 'public')
  data.append('locked_status', payload['locked_status'] || 'unlocked')

  const token = useCookie("sections-auth-token").value

  try {
    const res = await $fetch(`${nuxtApp.$sections.serverUrl}/project/${nuxtApp.$sections.projectId}/media/`, {
      method: 'POST',
      headers: sectionHeader({ token: token }),
      body: data
    })
    return res
  } catch (e) {
    return e
  }
}
/**
 * @returns {Promise<any>}
 */
export const getUser = async () => {
  const nuxtApp = useNuxtApp()

  return useFetch(
    `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/user`,
    {
      method: 'GET',
      headers: sectionHeader({
        token: useCookie('sections-auth-token').value,
      })
    }
  )
}
/**
 * @returns {Promise<any>}
 */
export const requestVerification = async () => {
  const nuxtApp = useNuxtApp()

  return useFetch(
    `${nuxtApp.$sections.serverUrl}/request_verification?token=${useCookie('sections-auth-token').value}`,
    {
      method: 'POST',
      headers: sectionHeader({})
    }
  )
}
