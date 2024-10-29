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
- `queryStringSupport`: _to use only if you intend to use query strings on your project_ set it to `enabled`. Enabling it on a project that does not have access to query strings will return errors when getting pages. (query string example: `/blogs1/blogs2/path=/blogs/article_path/categories_titles[]=Science,People/sort{}={"updated_at": "DSC""}` where pagePath is `/blogs1/blogs2` and query strings are `path1=/blogs/article_path` and `categories_titles[]=Science,People`). It is important to add `[]` after the QS key if the value of the QS should be an array like `categories_titles[]=Science,People`. You can as well use query strings in the following way (`?path=` instead of `/path=`): `/blogs1/blogs2?path=/blogs/article_path&categories_titles[]=Science,People&sort{}={"updated_at": "DSC""}`. Note that you can not use both ways together
- `projectLocales`: _to use only if you intend to have multiple supported languages for your website. Its value must be a string of language code separated by comma and with no spaces ex.: `en,fr,it,es`. See Language Support section below for more details on how to use this feature

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
      queryStringSupport: "enabled", 
      projectLocales: 'en,fr'
    }
}
````

3. The library comes with a default dynamic Sections page support (which you can specify its path from the url) but you can also add the sections component on the page(s) of your choice

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

When using the default dynamic Sections page, the library expose the mounted, created and fetch hooks of the pages. In order to use these hooks, your sections folder must have `js` folder and the `js` folder must have a `hooks.js` file containing the hooks **(Make sure to follow the same structure as showing below)**:   

```js
// sections/js/hooks.js

const mounted = () => {
  // mounted code goes here
}

const created = () => {
  // created code goes here
}

const fetch = () => {
  // fetch code goes here
}

module.exports = {
  mounted,
  created,
  fetch
};
```

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

### Example on how to use the function:

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

### When using the configurable sections:

- The configurable section currently supports the following types: 
```json
[
  "file",
  "media",
  "string",
  "integer",
  "textfield",
  "textarea",
  "hidden",
  "wysiwyg"
]
```

- If a new field type is needed, you can create your custom vue component for it inside `@sections/configurable_components` and the name of the component should match `${fieldKey}-${fieldName}` so the library can load it correctly

- You can also override an existing field type component by also created a component for it like the step above  

- The library exposes the following props of the configurable section types giving you more control on the component:

```json
["options", "optionsData", "field", "customFormData", "sectionsUserId", "reference"]
```

Note that the reference props gives you full access to the configurable form code as it uses $refs that returns the configurable form vue form component

- The library also expose the mounted hook of the configurable section type form. In order to use this hook, your sections folder must have `js` folder and the `js` folder must have a `configurable-hooks` file containing the hook:

```js
// sections/js/configurable-hooks.js

const mounted = () => {
    // mounted code goes here
}

module.exports = {
  mounted
};
```

# Media sections

- `globalFileUpload` A function that uses media to upload images replacing the base64 format and removing old media.
- The static wysiwyg component uses the globalFileUpload function of media by default.
- To use the globalFileUpload function of media, you need to call the function and pass the base64 file to it and the old media ID.
- Import globalFileUpload from "@geeks.solutions/nuxt-sections/lib/src/utils"
- To link the uploaded media to your content settings must be sent as an array and the media key which is `media` in the below example should match the field name that is set when creating your static section type
- media should also be sent as an array, and it is required to have `media_id` key and its value coming from id returned by the globalFileUpload function
- The form component having your media must have a prop named `mediaFields` that is an array of object having the type and name of the medias used in the section:

````
props: {
    ...
    mediaFields: [
      {
        type: 'image',
        name: 'media1'
      },
      {
        type: 'image',
        name: 'media2'
      }
    ]
  }
````

````js
import {globalFileUpload} from "@geeks.solutions/nuxt-sections/lib/src/utils";
````

It is an async function that returns an object of the function result.
###Example on how to use the function:

````js

data() {
  return {
    settings: [
      {
        en: {
          title: '',
          text: '',
        },
        fr: {
          title: '',
          text: '',
        },
        media: [
          {
            media_id: "",
            url: "",
            files: [
              {
                filename: "",
                url: ""
              }
            ]
          }
        ],
      }
    ],
    previewMedia: '',
    file: '',
  }
},

async onFileSelected(e) {
    
  this.file = this.$refs.imagePick.files[0] //your uploaded file

  const media = {
    media_id: "",
    files: [
      {
        filename: "",
        url: ""
      }
    ]
  };

  await globalFileUpload(this.file).then(
    (result) => {
      media.files[0].url = result.data.files[0].url;
      media.files[0].filename = result.data.files[0].filename;
      media.media_id = result.data.id;
      this.settings[0].media = []
      this.settings[0].media.push(media);
      this.previewImage = result.data.files[0].url
    }
  )
  
}
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



# Language Support

This feature is enabled by adding the supported languages as a string separated by comma with no spaces `en,fr,it,es` to the sections object inside publicRuntimeConfig as mentioned in a previous section. 

#### How it works ?

Setting the supported languages above will enable by default a Translation Component that will show on each section form you have (the ones you create inside sections/forms directory).
In order to track the update of language selected from the Translation Component, you should add a `selectedLang` prop with a default value and an empty `locales` prop Array ie.: 

````js
    props: {
      selectedLang: {
        type: String,
        default: 'en'
      },
      locales: {
        type: Array,
        default() {
          return []
        }
      }
    }   
````

* The `selectedLang` prop will hold the value of the selected language inside the Translation Component which will allow you to set the correct translation of your content inside your settings object.

* The `locales` Array will have the value of the supported languages allowing you to have more control on the feature

# Media Meta Component

* The module expose the media management component and show it as a mini BO that allow the user to create/edit/delete and select Medias from within the section forms.

* The meta component is exposed by default and to show it, you just need to call this function `this.$emit('openMediaModal', settings[0].media.length > 0 ? settings[0].media[0].media_id : null)` which will open the media meta component in a popup where you can do all the management of your medias.

* You can benefit from the UploadMedia component provided by Sections module:

````html
<template>
  <UploadMedia :media-label="$t('Media')" :upload-text="$t('Upload')" :change-text="$t('Change')" :seo-tag="$t('seoTag')" :media="settings[0].media" @uploadContainerClicked="$emit('openMediaModal', settings[0].media.length > 0 ? settings[0].media[0].media_id : null)" @removeUploadedImage="removeImage" />
</template>

<script>
  import UploadMedia from "@geeks.solutions/nuxt-sections/lib/src/components/Medias/UploadMedia.vue";
  export default {
    components: {
      UploadMedia
    },
    methods: {
      removeImage() {
        this.settings[0].media = []
        this.previewMedia = ''
        this.file = ''
      },
    }
    ...
}
</script>
````

* To select a media from the meta component, a `Select media` button is displayed next to `Save` media button in the media details section.
When selecting a media, the data of it are emitted to a `selectedMedia` prop that you should define inside props of your form section ie:
````js
props: {
  selectedMedia: {}
}
````

Then you can watch for the changes of this prop and handle the data returned:
````js
settings: [
  {
    en: {
      title: '',
      text: '',
    },
    fr: {
      title: '',
      text: '',
    },
    media: [
      {
        media_id: "",
        url: "",
        files: [
          {
            filename: "",
            url: ""
          }
        ]
      }
    ],
  }
],
watch: {
  selectedMedia(mediaObject) {
    const media = {
      media_id: "",
      url: "",
      files: [
        {
          filename: "",
          url: ""
        }
      ],
      headers: {}
    };
    media.files[0].url = mediaObject.files[0].url;
    media.files[0].filename = mediaObject.files[0].filename;
    media.media_id = mediaObject.id;
    media.url = mediaObject.files[0].url;
    if (mediaObject.files[0].headers) {
      media.headers = mediaObject.files[0].headers
    }
    this.settings[0].media = []
    this.settings[0].media.push(media);
    this.$emit('closeMediaModal')
  }
}
````

* Example of the complete mediaObject that you will have when watching the selectedMedia prop above: 

````js
{
  "type": "image",
  "title": "title",
  "tags": null,
  "seo_tag": "seo tag",
  "private_status": "public",
  "number_of_contents": 0,
  "namespace": "6489123456e624000881676f",
  "meta": {
    "content": [],
    "author": "Admin"
  },
  "locked_status": "unlocked",
  "id": "6489c71234564800073f0241",
  "files": [
    {
      "url": "https://s3.amazonaws.com/eweevtestbucketprivate/sections%2FJacool_Create_a_square_icon_for_a_recurring_billing_software._T_76460ddc-9a5a-4619-b817-6cfb6bf77c69b6fa613c624042c789c90d8be6a6432a.png",
      "type": "image/png",
      "thumbnail_url": "https://s3.amazonaws.com/eweevtestbucketprivate/sections%2FJacool_Create_a_square_icon_for_a_recurring_billing_software._T_76460ddc-9a5a-4619-b817-6cfb6bf77c69b6fa613c624042c789c90d8be6a6432a_thumbnail.png",
      "size": 405812,
      "platform_id": "6116112345998615afb99c29",
      "platform": {
        "width": 1000,
        "updated_at": 1628836063,
        "number_of_medias": 0,
        "namespace": "sections_app",
        "name": "Global Platform",
        "inserted_at": 1628836063,
        "id": "6116112345998615afb99c29",
        "height": 1000,
        "description": "This is the only platform used for sections"
      },
      "metadata": {
        "width": 1024,
        "height": 1024
      },
      "filename": "sections/Jacool_Create_a_square_icon_for_a_recurring_billing_software._T_76460ddc-9a5a-4619-b817-6cfb6bf77c69b6fa613c624042c789c90d8be6a6432a.png",
      "file_id": "a0a538123453f74786c2579610a1b80b-12fbc2"
    }
  ],
  "creation_date": 1686751251,
  "author": "648912345821000007cfe256"
}
````

* Keep in mind that `media` of `this.settings[0].media` in the above example should be the value set for the media field when creating the section type in use.
So for the example used, media is the media filed value that was set when creating the section type

* To close the component popup after selection, you can call this method `this.$emit('closeMediaModal')` which is also used in the example above

* To unlink a media from the content, if your media field is an array, then send it empty in your settings and if it is an object, remove media field from your settings

### How to display an already selected media in the sections edit form ?

* After selecting your media, as shown in the example above your media Object/Array inside your settings will have the URL of the selected media.
So it will be displayed automatically if you are using the UploadMedia component or you can use `this.settings[0].media.url` inside an img tag in your form to preview it `<img :src="this.settings[0].media.url" :alt="this.settings[0].media.files[0].filename" />`

### How to edit an already selected media from the sections edit form ?

* In the img tag you added above, add `@click` event on it that will that will call the function to open the media meta component popup and provide it with the media_id value `@click="$emit('openMediaModal', settings[0].media.length > 0 ? settings[0].media[0].media_id : null)"`. This way the media meta component will directly open the media for the id you sent, 
so you can make the updates press on the save button and the changes will directly show in your sections form.
Or if you are using the UploadMedia component just click in the image preview and the media meta component will open.
Then from the media meta component, select the media you want to edit, apply your changes and save the form

## Layouts

* You can create different layouts for your Sections pages by adding layout Vue js components to `layouts` folder that you should create inside `sections` directory. 

* As Admin, in edit mode you can select your layout from the drop-down that will contain the list of layouts Vue js components that you added to the `sections/layouts` folder.

* Layout component example that must be placed inside `sections/layouts` folder of your project:
The below example creates a layout of 4 regions in a sections page (top, right, left and bottom).
Keep in mind that the below structure of slots (which represents the different regions in your layout) like: `<slot name="top"></slot>` and the `slotNames` prop 
are mandatory for the layout to work properly. 

```html
<template>
  <div>
    <div>
      <slot name="top"></slot>
    </div>
    <div class="grid grid-cols-2">
      <div class="col-span-1">
        <slot name="right"></slot>
      </div>
      <div class="col-span-1">
        <slot name="left"></slot>
      </div>
    </div>
    <div>
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    slotNames: {
      type: Array,
      default() {
        return ['left', 'right', 'top', 'bottom']
      },
    },
  },
}
</script>
```

## Global Sections

### Create a Global section:

* You can create a global section using `Add a global instance` button available as Admin in the page edit mode that will open a list popup

* You can select one of the existing section types from the list, which will open the section in edit mode, give the global instance a name and fill the form required data for the section
In the form you also have an option `Automatically add this section to new pages`, if checked the global instance will be automatically added to any new page you create

* If you have existing sections with data in your pages, and you would like to create a global instance for these sections, when editing the sections you have button `Promote to global instance`
Clicking on the button will open the create global instance form, but it will be filled with the data of your section that you chose to promote

### Editing a Global section:

* In Admin page edit mode, the global instances are marked by a red edit button

* To edit the global instance, you simply open the global section instance, perform the updates you want and submit the form
Note: When opening the global section instance in edit mode, you have an indication at the top in red showing the pages where this global section instance is referenced, and that editing it will modify it on all these pages

* The auto insertion field is also editable from the global section instance

### Deleting a Global section:

* Similar to the regular section types, you have a delete icon to remove the global section instance from the page

* You can also delete the global instances you created from the global instance tab that you get when clicking on the `Add a new section` button in the page edit mode as Admin


## Refreshing the render data of a configurable or dynamic section:

* To refresh the content of a configurable or dynamic section use the event `refresh-section`

* When emitting the event make sure you pass as args an object that has a `qs` object and inside the `qs` you will add the query string key/value that you would like to update

* The library automatically check the query string you passed, it will compare them with query strings required by the sections available in your page.
So any configurable or dynamic section in the page that is using the query string you passed in the args of the event, will be refreshed with the new value sent in the event.
Values of the query string can have any type like string, array, object, number ie.:
```js
this.$emit('refresh-section', {
  qs: {
    offset: '12'
  }
})
```
* In the example above, all configurable or dynamic sections in the page that are using the `offset` query string will be refreshed with the new value `offset: '12'`

## Enabling the preview of the sections in the listing when adding one to the page

### To have a preview of the section (static, dynamic, configurable), follow the simple below steps:

* Inside the props of the section view, add a prop object name viewStructure that has a settings array inside it.

* In the settings array you will define the structure of data for the section to be previewed.

For example if you have in your section form the below settings:

```js
settings: [
        {
          media: {
            media_id: "",
            url: "",
            seo_tag: "",
          },
          description: {
            en: '',
            fr: ''
          }
        }
      ]
```

* Then you take the settings array and add it in the settings of the viewStructure in you view component. 

* Then replace the value of each data field by its type

* Supported types in the library are: (wysiwyg, html, integer, number, image, string, text, boolean)

Following the example of the form settings we shared above, you will the below viewStructure settings in your view component:

```js
props: {
    ...,
    viewStructure: {
        settings: [
            {
                media: 'image',
                description: {
                    en: 'string',
                    fr: 'string'
                }
            },
            {
                media: 'image',
                description: {
                    en: 'string',
                    fr: 'string'
                }
            },
            {
                media: 'image',
                description: {
                    en: 'string',
                    fr: 'string'
                }
            }
        ]
    }
}
```

* The settings of the viewStructure prop of the dynamic and configurable section types will depend on the data of the section view that each section support.
For Configurable sections, the settings array will include the fields defined by sections which can be found in the section-types API response inside `fields`. 

## Development

1. Clone this repository
2. Install dependencies using `npm install`
3. Start development server using `npm run dev`

## For Contributors

If you wish to contribute to this project, head to this [wiki](https://github.com/Geeks-Solutions/nuxt-sections/wiki/Contributions) and follow the instructions there.
