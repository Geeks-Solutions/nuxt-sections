import Vue from 'vue'
import components from './Sections'
// get options passed from module.js
const options = JSON.parse(`<%= JSON.stringify(options) %>`)
// loop through components and register them
import Draggable from 'vuedraggable';

Vue.prototype.$sections =  {
  projectId: options.projectId,
  projectUrl: options.projectUrl,
  serverUrl: (options.environment === "testing" ? "https://api.sections-saas.k8s-dev.geeks.solutions/api/v1" : "https://sections.geeks.solutions/api/v1"),
  queryStringSupport: options.queryStringSupport
}

for (const name in components) {
  Vue.component(name, {
    // extend the original component
    extends: components[name],
    // add a _customCounterOptions prop to gain access to the options in the component
    props: {
      _customCounterOptions: {
        type: Object,
        default: () => ({ ...options })
      }
    }
  })
}

Vue.component('draggable', Draggable);
