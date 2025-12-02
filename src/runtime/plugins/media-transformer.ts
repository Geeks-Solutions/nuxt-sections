import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
    try {
        // Import media_transform from the app's media-transform module
        const mediaTransformModule = await import('/sections/js/media-transform.js')
        if (mediaTransformModule && mediaTransformModule.media_transform) {
            nuxtApp.vueApp.provide(Symbol.for('mediaURLTransformer'), mediaTransformModule.media_transform)
        }
    } catch (e) {
        // Ignore error if media-transform cannot be loaded
    }
})
