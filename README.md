# Sections

Sections is an efficient serverless app relying on modern technologies to increase page render speed and facilitate the work of frontend developers. This package provide a VueJS Component to use right off the bat to interface with Sections' server

In order to benefit from this service you should register for free on the following [link](https://sections.geeks.solutions/admin/register)

# Nuxt Sections

> Is a Nuxtjs 2 module for sections supporting SSR and migrated from [Vue Sections library](https://www.npmjs.com/package/@geeks.solutions/vue-sections)


[📖 **Release Notes**](./CHANGELOG.md)

## Setup

1. Make sure to have your projectID, then install the library on your project

```npm
npm install @geeks.solutions/nuxt-sections
```

2. Add `@geeks.solutions/nuxt-sections` to the `modules` section of `nuxt.config.js`

And configure the library, the possible configurations are as follow:

- `projectId`: The ID of you project, you get it from your project interface after your register to sections
- `environment`: _to use only for development purposes_ set it to "testing" if you want your requests to be directed to sections test server
- `projectUrl`: _to use only if you intend to run sections in SSR_ set it to the project url you defined in your project interface on sections back office.
- `queryStringSupport`: _to use only if you intend to use query strings on your project_ set it to `enabled`. Enabling it on a project that does not have access to query strings will return errors when getting pages.

> The following packages are installed by the module:
`cookie-universal-nuxt`
`@nuxtjs/axios`
`@nuxtjs/i18n`
`vue-toastification/nuxt` 
>
> For the module to work properly, they should be added to the modules inside `nuxt.config.js` like below:

```js
{
  modules: [
    [
      '@geeks.solutions/nuxt-sections',
      {
        projectId: '',
        projectUrl: '',
        environment: '',
        queryStringSupport: ''
      }
    ],
    'cookie-universal-nuxt',
    '@nuxtjs/axios',
    [
      "@nuxtjs/i18n",
      {
        lazy: true,
        locales: [
          {
            name: "French",
            code: "fr",
            iso: "fr",
            file: "fr.js"
          },
          {
            name: "English",
            code: "en",
            iso: "en",
            file: "en.js"
          }
        ],
        loadLanguagesAsync: true,
        langDir: "lang/",
        defaultLocale: "en",
        vueI18n: {
          silentTranslationWarn: true,
          silentFallbackWarn: true
        }
      }
    ],
    [
      "vue-toastification/nuxt",
      {
        transition: "Vue-Toastification__fade",
        maxToasts: 20,
        newestOnTop: true
      }
    ]
  ]
}
```

To use module with nuxt `publicRuntimeConfig` use the below:

````js
modules: [
    '@geeks.solutions/nuxt-sections',
    ...
],

publicRuntimeConfig: {
    sections: {
      projectId: '62ff7827628cfa00099de9e1',
      projectUrl: 'http://localhost:3000',
      environment: 'testing',
      queryStringSupport: "enabled"
    }
}
````

3. Add the sections component on the page(s) of your choice

````vue
<template>
  <Sections
    :admin="admin"
    :page-name="pageName"
    :lang="lang"
    :variations="[]"
  />
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      pageName: "Home"
    };
  },
  computed: {
    lang() {
      return this.$i18n.locale.toString()
    },
    admin() {
      return !!this.$cookies.get("sections-auth-token")
    }
  }
}
</script>

````

Here we load props from data on the page, the admin prop is used to indicate if the edit interface for the page should display or not. Sections uses a cookie named `sections-auth-token` to store a user token to secure communications for page editing actions, if the cookie is found it assumes the edit button should show. In case you want to know whether the sections are loaded, You can use @finishLoad in your Sections component with a method name. Don't forget to add the method in the methods object.

To get the UserToken and have it stored in the above cookie, simply set sections on a page of your website, then head to your Sections project page (where you have your projectID) and set the login redirect url properly, then hit connect sections to my app. This library will receive and process the request to generate the UserToken and store it in the cookie for further use. for more information check the [docs](https://sections.geeks.solutions/docs/frontend/index.html)

If you now want to move on and start providing local and static sections for your website editor, or customize the display of dynamic or configurable ones, read below.

# How it works

Sections server comes with a Wysiwyg and any public sections out of the box.
The Wysiwg can be added to any page and will display of the box thanks to internal components, yet if you wish to override anything (the view, the icon or the form) you can do so by redeclaring any (or all) component(s) in your project.

You can also define your own local and static section types and you have the ability to control the way any section will display on your website.

You do this by creating custom VueJS components and placing them in the right configurations folder.
For now this is not configurable and you should have a `@/sections` folder where to put your components (@ pointing to any folder declaration you have defined in your project, i.e @ -> `/src` on a vueJs project. @ -> `/` on a NuxtJs project etc..).

The configurations folder follows the following structure:

```
@/sections
    |_ views
        |_ {your-component}_{section-type}.vue
    |_ type-icons
        |_ {your-component}.vue
    |_ forms
        |_ {your-component}.vue
```

- `views` folder will contain the design of your component that will be displayed on the page to your visitors (and during preview)
- `type-icons` folder will contain the icons that will illustrate your section in the add a new section box for content editors.
- `forms` is the folder where you create the form that will help you fill the data while adding or editing `your-component` to your page. This is only for static section types, local and dynamic ones persist no data and configurable ones have their data entry form automatically built by the library as this comes from the third party developer providing this section.


In case you are trying to use a section that you haven't properly declared on your project, a warning will display in the console indicating where sections is epxecting the component to be located according to your configuration.


- `addNewStaticType(sectionTypeName)` a helper function that takes a string of sectionTypeName that matches your component name created inside the configurations folder mentioned above which will be used then to add this section type to your page

###Example on how to use the function:

````js
import {addNewStaticType} from "@geeks.solutions/nuxt-sections/lib/src/utils";

async addStaticType(sectionTypeName) { // where sectionTypeName is the name of the sectionType to be added of type String, example: const sectionTypeName = "newSection"

await addNewStaticType(sectionTypeName).then((res) => {
       // res is {status: 'success'} on successful request
       // res is {status: 'error', message: errorMessage} on failed request
      })
 
},
````
---

# Media sections

- `globalFileUpload` A function that uses media to upload images replacing the base64 format and removing old media.
- The static wysiwyg component uses the globalFileUpload function of media by default.
- To use the globalFileUpload function of media, you need to call the function and pass the base64 file to it and the old media ID.
- Import globalFileUpload from "@geeks.solutions/nuxt-sections/lib/src/utils"

````js
import {globalFileUpload} from "@geeks.solutions/nuxt-sections/lib/src/utils";
````

It is an async function that returns an object of the function result.
###Example on how to use the function:

````js
async onFileSelected(e) {

this.file = this.$refs.imagePick.files[0] //your uploaded file

await globalFileUpload(this.file, oldMediaID).then(
   (result) => {
     this.settings.url = result.data.files[0].url //assign the result url to the settings object to be able to read that value in $section.settings in you static component
   }
 )
 
},
````

- `deleteMedia` A function helper to remove media.
- To use the deleteMedia function of media, you need to call the function and pass the media ID to it.
- Import deleteMedia from "@geeks.solutions/nuxt-sections/lib/src/utils"

````js
import {deleteMedia} from "@geeks.solutions/nuxt-sections/lib/src/utils";
````

It is an async function that returns an object of the function result.
###Example on how to use the function:

````js
async removeImage() {
      const id = this.settings.image.id
      await deleteMedia(id).then(
        (result) => {
          console.log(result)
        }
      )
    },
````


## Development

1. Clone this repository
2. Install dependencies using `npm install`
3. Start development server using `npm run dev`

## For Contributors

If you wish to contribute to this project, head to this [wiki](https://github.com/Geeks-Solutions/nuxt-sections/wiki/Contributions) and follow the instructions there.
