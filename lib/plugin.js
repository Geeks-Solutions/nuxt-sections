import Vue from "vue";
import fs from "fs";
import {sectionHeader} from "./src/utils/helpers.js";

// try {
//   const figma = await ctx.$axios.get("https://api.figma.com/v1/files/O7Gf8hDhK5Ja6scomONsdC/nodes?ids=0:0",
//     {
//       headers: {
//         'X-Figma-Token': 'figd_ZCr0ODxoruMAy1hJuGNUjH5BXIqcqhwrSPbzv8ez'
//       }
//     });
//   let figmaTexts = [];
//   let styleClasses = {};
//   let finalTextObjects = [];
//   const figmaFrames = figma.data.nodes['0:0'].document.children[0].children;
//   figmaFrames.forEach(frame => {
//     figmaTexts.push(...frame.children.filter(node => {
//       return node.type === 'TEXT';
//     }));
//     // OR:
//     // frame.children.forEach(element => {
//     //   if (element.type === 'TEXT') {
//     //     figmaTexts.push(element);
//     //   }
//     // })
//   });
//   figmaTexts.forEach(text => {
//     let textClasses = [];
//     Object.keys(text.style).forEach(styleKey => {
//       if (typeof text.style[styleKey] !== 'object' && !styleClasses[`${styleKey}-${text.style[styleKey].toString()}`]) {
//         styleClasses[`${styleKey}-${text.style[styleKey].toString()}`] = {
//           [styleKey]: text.style[styleKey]
//         }
//       }
//       textClasses.push(`${styleKey}-${text.style[styleKey].toString()}`)
//     })
//     finalTextObjects.push({
//       id: text.id,
//       text: text.name,
//       classes: textClasses
//     })
//   })
//   console.log(finalTextObjects);
// } catch (e) {
//   console.log(e);
// }

export default async function (ctx) {
  const sectionsConfig = ctx.$config.sections
  Vue.prototype.$sections = {
    projectId: sectionsConfig.projectId,
    projectUrl: sectionsConfig.projectUrl,
    serverUrl: (sectionsConfig.environment === "testing" ? "https://api.sections-saas.k8s-dev.geeks.solutions/api/v1" : "https://sections.geeks.solutions/api/v1"),
    projectLocales: sectionsConfig.projectLocales,
    queryStringSupport: sectionsConfig.queryStringSupport,
    cname: sectionsConfig.cname
  }

  if (sectionsConfig.cname === 'active' && process.server) {

    const fs = require('fs');

    // The below commented code must be used to replace call1 value, so to use nuxt server get page API instead of the mocked server api
    // const websiteDomain = ctx.req.headers.host;
    //
    // const scheme = ctx.req.headers['x-forwarded-proto'] || 'http';
    //
    // const pageName = ctx.route.params.pathMatch ? ctx.route.params.pathMatch : '/'
    //
    // const config = {
    //   headers: sectionHeader({origin: `${scheme}://${websiteDomain}`}),
    // };
    //
    // const URL = `${Vue.prototype.$sections.serverUrl}/project/${websiteDomain}/page/${encodeURIComponent(pageName)}`;
    //
    // const payload = {}
    //
    // const optionsRes = await ctx.$axios.options(URL, config)
    // if (optionsRes.status === 200) {
    //   const res = await ctx.$axios.post(URL, payload, config)
    //   console.log(res.data.sections);
    // }
    const call1 = await ctx.$axios.get("https://a6512645-ccc3-4216-a09d-22ed95f97389.mock.pstmn.io/sections/types");

    const sectionsTypes = call1.data.sections;

    sectionsTypes.forEach(async (sectionType) => {
      try {
        const component = require(`../.././sections/views/${sectionType.name}_${sectionType.type}.vue`);
        Vue.component(`${sectionType.name}_${sectionType.type}`, {
          extends: component.default
        })
      } catch (e) {
        console.error(e)
        try {
          let call2 = await ctx.$axios.get(`https://a6512645-ccc3-4216-a09d-22ed95f97389.mock.pstmn.io/sections/views/${sectionType.name}`);
          fs.writeFile(`./sections/views/${sectionType.name}_${sectionType.type}.vue`, call2.data, 'utf-8', () => {
            try {
              const component = require(`../.././sections/views/${sectionType.name}_${sectionType.type}.vue`);
              Vue.component(`${sectionType.name}_${sectionType.type}`, {
                extends: component.default
              })
            } catch (e) {
              console.error(e)
            }
          });
        } catch (e) {
          console.error(e)
        }
      }
    })

  }

}
