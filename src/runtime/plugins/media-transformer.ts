import { defineNuxtPlugin } from '#app'
import { importJs } from '../utils/helpers'

export default defineNuxtPlugin(async (nuxtApp) => {
    try {
        // Import media_transform from the app's global-hooks module
        const globalHooks = importJs('/js/global-hooks')
        if (globalHooks && globalHooks.media_transform) {
            nuxtApp.vueApp.provide(Symbol.for('mediaURLTransformer'), globalHooks.media_transform)
        }
    } catch (e) {
        // Ignore error if global-hooks cannot be loaded 
    }
})
