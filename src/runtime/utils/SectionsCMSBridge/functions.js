import {sectionHeader, useCookie, useNuxtApp} from "#imports";

export const createMedia = async (payload, external_call) => {
  const nuxtApp = useNuxtApp();
  const fileData = payload['files[1][file]']
  if (!payload['files[1][file]']) return

  const data = new FormData()

  data.append('files[1][platform_id]', '1')
  data.append('files[1][file]', fileData)
  data.append('type', fileData.type.includes('image') ? 'image' : 'document')
  data.append('title', payload['title'] || '')
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
