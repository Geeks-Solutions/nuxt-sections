<template>
  <gWysiwyg :html="html" :auth-token="$cookies.get('sections-auth-token')" :project-id-prop="$sections.projectId" :sections-user-id="null" :server-url="$sections.serverUrl" :selected-media-id="$route.query.id" :media-translation-prefix="'mediaComponent.'" @settingsUpdate="(content) => $emit('settingsUpdate', content)"/>
</template>
<script>

export default {
  props: {
    html: {
      type: String,
      default: ""
    }
  }
};
</script>
