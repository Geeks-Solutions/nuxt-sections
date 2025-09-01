# Sections

Sections is an efficient serverless app relying on modern technologies to increase page render speed and facilitate the work of frontend developers. This package provide a VueJS Component to use right off the bat to interface with Sections' server

In order to benefit from this service you should register for free on the following [link](https://sections.geeks.solutions/admin/register)

# Nuxt Sections

> Is a Nuxtjs 3 module for sections supporting SSR and migrated from [Nuxt Sections library](https://www.npmjs.com/package/@geeks.solutions/nuxt-sections/v/1.1.5)


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
`@nuxtjs/i18n`
`vue-toastification/nuxt` 
>
> For the module to work properly, the i18n configuration should be added to the `nuxt.config.ts` file like below:

```js
i18n: {
  detectBrowserLanguage: false,
    defaultLocale: "en",
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
    langDir: "lang/"
}
```

To use module with nuxt `publicRuntimeConfig` use the below:

````js
modules: [
    '@geeks.solutions/nuxt-sections',
    ...
],
  
runtimeConfig: {
    public: {
      sections: {
        projectId: '62ff7827628cfa00099de9e1',
          projectUrl: 'http://localhost:3000',
          environment: 'testing',
          queryStringSupport: "enabled",
          projectLocales: 'en,fr'
      }
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
    :sections-page-data="sectionsPageData"
  />
</template>

<script>
import { useCookie } from '#imports'
  
export default {
  name: 'IndexPage',
  data() {
    return {
      pageName: "Home",
      sectionsPageData: null
    };
  },
  computed: {
    lang() {
      return this.$i18n.locale.toString()
    },
    admin() {
      return !!useCookie("sections-auth-token").value
    }
  },
  async asyncData({ app }) {
    if (process.client) {
      const { renderPageData } = await import('@geeks.solutions/nuxt-sections/lib/src/utils/helpers');
      return { sectionsPageData: await renderPageData(app, "testh") }
    }
  }
}
</script>

````

Here we load props from data on the page, the admin prop is used to indicate if the edit interface for the page should display or not. Sections uses a cookie named `sections-auth-token` to store a user token to secure communications for page editing actions, if the cookie is found it assumes the edit button should show. In case you want to know whether the sections are loaded, You can use @finishLoad in your Sections component with a method name. Don't forget to add the method in the methods object.

To get the UserToken and have it stored in the above cookie, simply set sections on a page of your website, then head to your Sections project page (where you have your projectID) and set the login redirect url properly, then hit connect sections to my app. This library will receive and process the request to generate the UserToken and store it in the cookie for further use. for more information check the [docs](https://sections.geeks.solutions/docs/frontend/index.html)

If you now want to move on and start providing local and static sections for your website editor, or customize the display of dynamic or configurable ones, read below.

When using the default dynamic Sections page, the library expose the mounted, created and fetch hooks of the pages. In order to use these hooks, your sections folder must have `js` folder and the `js` folder must have a `hooks.js` file containing the hooks **(Make sure to follow the same structure as showing below)**:

Note: sectionsPageData and the asyncData hook are optional but you can use them to leverage the power of asyncData hook for better pages navigation experience where the asyncData will pause the navigation to your page until the page response is returned and loaded

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

export {
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

export {
  mounted
};
```

- New hook exposed to alter the configurable fields data before they get rendered `configurable_pre_render`

```js
// sections/js/configurable-hooks.js

const configurable_pre_render = (options, defaultLang, locales, props) => {
  if (props.name === "selective_articles") {
    let optionsUpdated = null
    if (options && options[0]) {
      optionsUpdated = options
      Object.keys(optionsUpdated[0]).forEach(key => {
        if ((key === 'cta_label' || key === 'title' || key === 'description' || key === 'text') && typeof optionsUpdated[0][key] === 'string') {
          const stringValue = optionsUpdated[0][key]
          optionsUpdated[0][key] = {}
          locales.forEach(locale => {
            if (locale === defaultLang) {
              optionsUpdated[0][key][locale] = stringValue
            } else optionsUpdated[0][key][locale] = ''
          })
        }
      })
    }
    if (optionsUpdated) {
      return optionsUpdated
    }
  }
}

export {
  configurable_pre_render
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
  <LazyMediasUploadMedia :media-label="$t('Media')" :upload-text="$t('Upload')" :change-text="$t('Change')" :seo-tag="$t('seoTag')" :media="settings[0].media" @uploadContainerClicked="$emit('openMediaModal', settings[0].media.length > 0 ? settings[0].media[0].media_id : null)" @removeUploadedImage="removeImage" />
</template>

<script>
  export default {
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

* The `refresh-section` event has been updated to support multiple sections refresh based on a list of section names and qs for each section.
qs object outside the array can still be used to have common qs sent for all sections

```js
this.$emit('refresh-section', {
        sections: [
          {
            name: '60df8a48d66ef20008f8e03a:categories_articles',
            qs: {
              'categories_titles': Array.isArray(item) ? categoriesTitles.split(',') : [categoriesTitles],
              sort: {},
              additonalQs: "qs string",
              ...qs
            }
          }
        ],
        qs: {
          'categories_titles': Array.isArray(item) ? categoriesTitles.split(',') : [categoriesTitles],
          sort: {},
          ...qs
        }
      })
```

* A re-render sections function has been exposed and added to window, it can be called from any script in the site `window.SectionsCMS.value.reRenderSection`, it takes as params a list of section names and qs for each section:

```js
window.SectionsCMS.value.reRenderSection(
        {
          sections: [
            {
              id: "6800b27be6e9830006bce308", // Optional to target section IDs specifically
              name: "60df8a48d66ef20008f8e03a:categories_articles",
              qs: {
                "page_path": "blogs",
                "categories_titles": [
                  "Eweev"
                ],
                "sort": {},
                "offset_ca": 0,
                "language": "en"
              },
              options: [ // Optional to overid configurable sections options, if not set the existing options for the targeted configurable section will be used
                {
                  "article_page_path": "customPath/rerender"
                }
              ]
            }
          ]
        }
      )
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

## Update the css of your page 

* In the settings of your page, you will find a css preset dropdown that has 3 different css that where you can select one and save it for your page.
* The preset array will come from an env variable that should follow this structure
``NUXT_ENV_SECTIONS_CSS_PRESET=[{\"name\": \"Preset 1\", \"url\": \"https://s3.amazonaws.com/eweevtestbucketprivate/sections/preset1f5bee855a36c43708a8c7b801864715c.css\"},{\"name\": \"Preset 2\", \"url\": \"https://s3.amazonaws.com/eweevtestbucketprivate/sections/preset2127eaa90b85f48798c16665f2a96cf5a.css\"},{\"name\": \"Preset 3\", \"url\": \"https://s3.amazonaws.com/eweevtestbucketprivate/sections/preset3348a13214941498bb6391ab43ae5d057.css\"}]``
* You have an option `Other` that allow you to upload your own custom css file to use in your page.
* Each preset can be exported, allowing you to make the updates you want and then upload it using the Other option
* The project is styled with Tailwindcss and all Tailwindcss classes can be updated by adding the class name and its update in the custom css file   
Here is an example of one of the presets that includes Tailwindcss classes which are the standards for any style update that has to be added/changed
```css
html {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.rounded-2xl {
  border-radius: 1rem !important;
}

.rounded-full {
  border-radius: 9999px !important;
}

.rounded-lg {
  border-radius: 0.5rem !important;
}

.rounded-md {
  border-radius: 0.375rem !important;
}

.rounded-sm {
  border-radius: 0.125rem !important;
}

.rounded-xl {
  border-radius: 0.75rem !important;
}

.rounded-br-lg {
  border-bottom-right-radius: 0.5rem !important;
}

.rounded-tl-lg {
  border-top-left-radius: 0.5rem !important;
}

.border {
  border-width: 1px !important;
}

.border-b {
  border-bottom-width: 1px !important;
}

.border-t {
  border-top-width: 1px !important;
}


.text-2xl {
  font-size: 1.5rem !important;
  line-height: 2rem !important;
}

.text-3xl {
  font-size: 1.875rem !important;
  line-height: 2.25rem !important;
}

.text-4xl {
  font-size: 2.25rem !important;
  line-height: 2.5rem !important;
}

.text-8xl {
  font-size: 6rem !important;
  line-height: 1 !important;
}

.text-base {
  font-size: 1rem !important;
  line-height: 1.5rem !important;
}

.text-lg {
  font-size: 1.125rem !important;
  line-height: 1.75rem !important;
}

.text-sm {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

.text-xl {
  font-size: 1.25rem !important;
  line-height: 1.75rem !important;
}

.text-xs {
  font-size: 0.75rem !important;
  line-height: 1rem !important;
}

.font-bold {
  font-weight: 700 !important;
}

.font-extrabold {
  font-weight: 800 !important;
}

.font-light {
  font-weight: 300 !important;
}

.font-medium {
  font-weight: 500 !important;
}

.font-semibold {
  font-weight: 600 !important;
}

.font-thin {
  font-weight: 100 !important;
}

.shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color) !important;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
}

.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color) !important;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
}

.drop-shadow-2xl {
  --tw-drop-shadow: drop-shadow(0 25px 25px rgb(0 0 0 / 0.15)) !important;
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow) !important;
}

.grayscale {
  --tw-grayscale: grayscale(100%) !important;
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow) !important;
}

.hover\:border:hover {
  border-width: 1px !important;
}

.hover\:shadow:hover {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color) !important;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
}

.border-Blue {
  --tw-border-opacity: 1 !important;
  border-color: rgb(50 150 250 / var(--tw-border-opacity)) !important;
}

.border-Error_200 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(255 120 60 / var(--tw-border-opacity)) !important;
}

.border-Error_600 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(200 40 40 / var(--tw-border-opacity)) !important;
}

.border-FieldGray {
  --tw-border-opacity: 1 !important;
  border-color: rgb(130 130 130 / var(--tw-border-opacity)) !important;
}

.border-Gray_200 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(190 190 220 / var(--tw-border-opacity)) !important;
}

.border-Gray_300 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(160 160 200 / var(--tw-border-opacity)) !important;
}

.border-Primary_Color_10 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(240 230 110 / var(--tw-border-opacity)) !important;
}

.border-Primary_Color_25 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(225 205 210 / var(--tw-border-opacity)) !important;
}

.border-Primary_Color_50 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(160 160 180 / var(--tw-border-opacity)) !important;
}

.border-Primary_Color_600 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(20 20 80 / var(--tw-border-opacity)) !important;
}

.border-gray-300 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(190 200 210 / var(--tw-border-opacity)) !important;
}

.border-white {
  --tw-border-opacity: 1 !important;
  border-color: rgb(240 240 240 / var(--tw-border-opacity)) !important;
}

.bg-BgGrey {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(220 220 220 / var(--tw-bg-opacity)) !important;
}

.bg-Error_200 {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(255 140 80 / var(--tw-bg-opacity)) !important;
}

.bg-Error_600 {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(220 70 70 / var(--tw-bg-opacity)) !important;
}

.bg-Gray_50 {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(240 248 255 / var(--tw-bg-opacity)) !important;
}

.bg-Primary_Color_10 {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(130 190 190 / var(--tw-bg-opacity)) !important;
}

.bg-Primary_Color_25 {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(200 240 240 / var(--tw-bg-opacity)) !important;
}

.bg-Primary_Color_50 {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(160 200 190 / var(--tw-bg-opacity)) !important;
}

.bg-Primary_Color_600 {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(40 40 80 / var(--tw-bg-opacity)) !important;
}

.text-Blue {
  --tw-text-opacity: 1 !important;
  color: rgb(30 140 100 / var(--tw-text-opacity)) !important;
}

.text-Gray_300 {
  --tw-text-opacity: 1 !important;
  color: rgb(130 160 190 / var(--tw-text-opacity)) !important;
}

.text-Gray_600 {
  --tw-text-opacity: 1 !important;
  color: rgb(20 224 224 / var(--tw-text-opacity)) !important;
}

.text-Gray_700 {
  --tw-text-opacity: 1 !important;
  color: rgb(50 80 130 / var(--tw-text-opacity)) !important;
}

.text-Gray_800 {
  --tw-text-opacity: 1 !important;
  color: rgb(30 60 100 / var(--tw-text-opacity)) !important;
}

.text-Gray_900 {
  --tw-text-opacity: 1 !important;
  color: rgb(0 34 102 / var(--tw-text-opacity)) !important;
}

.text-Primary_Color_300 {
  --tw-text-opacity: 1 !important;
  color: rgb(70 90 50 / var(--tw-text-opacity)) !important;
}

.text-Primary_Color_700 {
  --tw-text-opacity: 1 !important;
  color: rgb(255 87 51 / var(--tw-text-opacity)) !important;
}

.text-error {
  --tw-text-opacity: 1 !important;
  color: rgb(210 50 80 / var(--tw-text-opacity)) !important;
}

.text-gray-800 {
  --tw-text-opacity: 1 !important;
  color: rgb(40 55 75 / var(--tw-text-opacity)) !important;
}

.text-white {
  --tw-text-opacity: 1 !important;
  color: rgb(210 230 230 / var(--tw-text-opacity)) !important;
}

.hover\:border-Error_700:hover {
  --tw-border-opacity: 1 !important;
  border-color: rgb(190 60 60 / var(--tw-border-opacity)) !important;
}

.hover\:border-Gray_1000:hover {
  --tw-border-opacity: 1 !important;
  border-color: rgb(180 180 170 / var(--tw-border-opacity)) !important;
}

.hover\:border-Primary_Color_400:hover {
  --tw-border-opacity: 1 !important;
  border-color: rgb(80 80 60 / var(--tw-border-opacity)) !important;
}

.hover\:bg-Error_700:hover {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(190 60 60 / var(--tw-bg-opacity)) !important;
}

.hover\:bg-Gray_1000:hover {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(180 180 170 / var(--tw-bg-opacity)) !important;
}

.hover\:bg-Primary_Color_400:hover {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(80 80 60 / var(--tw-bg-opacity)) !important;
}

.hover\:text-Blue:hover {
  --tw-text-opacity: 1 !important;
  color: rgb(30 140 100 / var(--tw-text-opacity)) !important;
}

.hover\:text-Gray_700:hover {
  --tw-text-opacity: 1 !important;
  color: rgb(50 80 130 / var(--tw-text-opacity)) !important;
}

.hover\:text-Primary_Color_800:hover {
  --tw-text-opacity: 1 !important;
  color: rgb(20 20 10 / var(--tw-text-opacity)) !important;
}
```


## Lambda functions

### Events emitted by the library

* `page_pre_render`: When a page is loaded and about to be rendered, will contain the response from your section page as a payload

* Implemented 2 events that fires on page render `page_payload_preprocess` and `page_payload_postprocess` and that can be listened to by any external js code

### Callbacks you can implement

Inside `sections/js/global-hooks.js`

* `page_pre_load`: When a page is about to be loaded, it allows you to update the payload sent for the render page API request

* `section_pre_render`: When a view section component is being picked up for rendering (before rendering), it allows you to change the view component before rendering it.
The callback is expected to return the path of the new view component.

```js
const page_pre_load = (payload) => {
    return payload
}

const section_pre_render = (payload) => {
    return false
}

export {
    page_pre_load,
    section_pre_render
};
```

* `page_pre_render`: When a page is loaded and about to be rendered, will contain the response from your section page as a payload, the sections array, your website domain name.
  It allows you to update the sections that will be seen on your page based on the condition you choose.
  Note: When adding a new section to the payload make sure to add this key/value pair to this new section `"altered": true`

ex.: 

```js
// eslint-disable-next-line camelcase
const page_pre_render = (payload, sections, websiteDomain, $sections, $config) => {
  if (websiteDomain === 'projectcnamenov.k8s-dev.geeks.solutions') {
    if (payload.page && payload.page === '/') {
      sections.push({
        "error": null,
        "id": "6760071f3253f40006f2acfe",
        "name": "SimpleCTA",
        "type": "static",
        "settings": [
          {
            "fr": {
              "link": "/fr/test",
              "title": "FR This section is generated using the page_pre_render hook",
              "subTitle": "FR page_pre_render HOOK",
              "buttonLabel": "FR Submit test HOOK"
            },
            "en": {
              "link": "/test",
              "title": "This section is generated using the page_pre_render hook",
              "subTitle": "page_pre_render HOOK",
              "buttonLabel": "Submit test HOOK"
            }
          }
        ],
        "status_code": null,
        "region": {},
        "query_string_keys": null,
        "render_data": "",
        "linked_to": "",
        "weight": 9,
        "altered": true
      })
      return sections
    } else if (payload.page && payload.page === 'test') {
      if (sections.right) {
        sections.right.push({
          "error": null,
          "id": "6760071f3253f40006f2acfe",
          "name": "SimpleCTA",
          "type": "static",
          "settings": [
            {
              "fr": {
                "link": "/fr/test",
                "title": "FR This section is generated using the page_pre_render hook",
                "subTitle": "FR page_pre_render HOOK",
                "buttonLabel": "FR Submit test HOOK"
              },
              "en": {
                "link": "/test",
                "title": "This section is generated using the page_pre_render hook",
                "subTitle": "page_pre_render HOOK",
                "buttonLabel": "Submit test HOOK"
              }
            }
          ],
          "status_code": null,
          "region": {
            "top-right-left-bottom": {
              "slot": "right",
              "weight": 8
            }
          },
          "query_string_keys": null,
          "render_data": "",
          "linked_to": "",
          "weight": 9,
          "altered": true
        })
      }
      return sections
    } else return null
  }
  return null
}

export {
  page_pre_render
};

```

Inside `sections/forms/${section_name}_hooks.js`
i.e.: `sections/forms/full_article_hooks.js`

* `seo_management`: When a view section component is being picked up for rendering (before rendering), it allows you to overwrite the seo metas of your page (title, description, image).
  The hook takes as params the section data and the page current localization.
  The callback is expected to return an object including the metas of your section to overwrite the page metas.

ex.:

```js
const seo_management = (section, locale) => {
  return {
    title: section.render_data.title,
    description: section.render_data.description,
    image: section.render_data.medias[0].files[0].url
  }
}

export {
  seo_management
};
```

* `available_locales`: This hook should return the list of supported locale codes as an array of strings, it will be used to abstract the language prefix from the url used by sections API to render the page

ex.:

```js
import langCodes from 'langs'

const available_locales = () => {
  // langCodes.codes("1") is a function in langs library https://www.npmjs.com/package/langs that returns a list of string language codes
  return langCodes.codes("1")
}

export {
  available_locales
};
```

* `section_page_initialization_completed`: Runs after a page has been initialized. It provides access to useful context (such as routing, localization, or cookies) and allows you to execute custom logic at that point.

```js
const section_page_initialization_completed = (res, i18n, useCookie, route) => {
  // run custom logic after initialization
}
````

* `reload_page_on_path_update`: Determines whether the page should reload when the path changes.

```js
const reload_page_on_path_update = (useCookie) => {
  return true // reload the page on path update
}
```

* `clear_cookies`: Called when the library is about to clear its cookies. This hook can be used to also clear custom cookies.

```js
const clear_cookies = (useCookie) => {
  // clear custom cookies here
}
```

* `refetch_client_side`: Controls whether client-side refetching should happen. Disabled by default.

```js
const refetch_client_side = (useCookie) => {
  return false // do not refetch client-side
}
```

* `fetch_on_server`: Controls whether server-side fetching should happen. Enabled by default.

```js
const fetch_on_server = (useCookie) => {
  return true // allow server-side fetching
}
```

* `api_pre_request`: Runs before an API request is sent. It allows modifying the request, such as updating the URL or body.

```js
const api_pre_request = async ($nuxt, method, url, body, options) => {
  return { url, body } // optionally update request before sending
}
```

* `api_post_request`: Runs after an API request succeeds. It allows you to inspect or modify the response before it is returned.

```js
const api_post_request = async ($nuxt, method, url, body, options, res, onSuccess) => {
  return res // optionally modify response
}
```

* `api_request_error`: Triggered when an API request fails. It allows you to customize how errors are handled.

```js
const api_request_error = ($nuxt, method, url, body, error, options) => {
  return error // handle errors here
}
```

* `medias_api_url`: Allows overriding the API endpoints used for media-related requests.

  * If `stringUrl` is `true`, the return value must be a string.
  * Otherwise, the return value should be an object of media endpoints.

```js
const medias_api_url = (useCookie, projectId, stringUrl) => {
  return stringUrl ? '/custom-media-url' : { mediasUri: '/custom/media/endpoint' }
}
```

* `medias_api_error_received`: Runs when a media API request results in an error. It allows custom error handling.

```js
const medias_api_error_received = (useCookie, error) => {
  return 'Custom error message'
}
```

* `medias_api_request_received`: Runs when a media API request is received. It can be used to decide whether the request should proceed.

```js
const medias_api_request_received = (useCookie, method, url, payload) => {
  return { proceed: true }
}
```

* `medias_api_response_received`: Runs after receiving a response from a media API request. It allows modification of the response before it is used.

```js
const medias_api_response_received = async (useCookie, method, url, payload, response) => {
  return response // optionally update response
}
```

* `pre_open_edit_mode`: Determines whether the edit mode should open. If the hook returns `true`, edit mode will **not** open. By default, edit mode opens.

```js
const pre_open_edit_mode = (useCookie) => {
  return false // allow edit mode to open
}
```

```js
export {
  section_page_initialization_completed,
  reload_page_on_path_update,
  clear_cookies,
  refetch_client_side,
  fetch_on_server,
  api_pre_request,
  api_post_request,
  api_request_error,
  medias_api_url,
  medias_api_error_received,
  medias_api_request_received,
  medias_api_response_received,
  pre_open_edit_mode
};
```

### The following will require a specific component to be implemented in your project:

Inside `sections/page_components/page_not_found.vue` or `sections/page_components/project_not_found.vue`

The two below components allow you to change the default behavior of the library for the two cases described below

* `page_not_found.vue`: When a page was not found or it was requested for a non existing project, will contain the page name and qs requested as a prop
* `project_not_found.vue`: When a page was requested for a non existing project, will contain the page name and qs requested as a prop


### SEO Management:

This feature allows you to overwrite the metadata of your page by the metas coming from your sections based on your choice and conditions that you set using the `seo_management` section specific hook described above.  
To enable this feature for a section, simply add inside the (created, onMounted) hook of the desired section the below code:

```js
created() {
    this.$emit('seo-support', true)
  }
```

This will add an additional `SEO` button to your section options (edit, drag, delete), that you can use(by clicking on it) to enable/disable overwriting the metas of your page by the ones of this section, based on the return value from the `seo_management` section specific hook described above.
The sections metas complies to the sections order in the page (following their weights). And so the section with the lowest weight and having a meta (ie. `title`) will be the one overwriting the page title meta even if other sections has SEO enabled and returning a title. 

### Builder Settings:

The library support providing the ability for the host project to define multiple forms that will be displayed dynamically in the settings popup and that will be saved into the project metadata. 

## Files structure:

* The custom forms should be defined inside `sections/builder/settings` as vue components and the library will be responsible for displaying a new tab in the settings popup and its name is based on the vue component name

## Builder Hooks:

* The library expose: 1 hook (with no callback function) that can be implemented inside `sections/builder/settings/builder-hooks.js`:

 - `initialize_builder_settings`: this hook is called when the page data are received and have as arguments the builder settings data, the useHead composable that allow you to update the page head settings and the current tab in use

* And 4 hooks (with callbacks):
 
 - `update_tab_title` (that must return a string of the updated tab title): this hook is called before the tabs titles are rendered, it allows you to update the tabs title
 - `reset_builder_settings` (that must return an object of the original builder settings for each tab): this hook is called when confirming closing the settings popup, it allows you to reset any previously applied settings and have as arguments the original builder settings data and the current tab in use
 - `builder_settings_payload` (that must return an object having the original builder settings and the updated ones for each tab): this hook is called when data change inside the builder tab form, it allows to correctly set the payload that will be processed by sections API to save the correct builder settings, it has as arguments the original builder settings data, the updated settings of the current builder tab and the current tab in use
 - `handle_unsaved_settings` (that must returns a boolean): this hook is called when switching between the builder tabs and returns true to show a warning for unsaved settings
It takes as arguments: 
 1. isEqual: a function used to compare original and updated settings
 2. Original builder settings saved for your project 
 3. Updated settings
 4. Current tab in use

i.e:

```js
const initialize_builder_settings = (settings, useHead, tab) => {
  
}

const reset_builder_settings = (settings, tab) => {
  
}

const handle_unsaved_settings = (isEqual, originalSettings, settings, tab) => {
  const allEmpty = Object.values(settings).every(value => value.trim() === '')
  return  !isEqual(originalSettings, settings) && !allEmpty
}

const builder_settings_payload = (originalBuilderSettings, settings, tab) => {
  
}

const update_tab_title = (tab) => {
  return tab
}

export {
  initialize_builder_settings,
  reset_builder_settings,
  handle_unsaved_settings,
  builder_settings_payload,
  update_tab_title
}

```

## Sections Specific Theme Builder Hooks:

* This feature can be enabled by injecting a function called `sectionsThemeComponents` provided by the library inside the view component of the section that you want it to support theme settings.
If this function is injected, a brush icon will show next to the available options of this section and clicking on it will open the theme sidebar of this section.
It takes as arguments the section name and an array list of the theme components that will show as tabs inside the theme sidebar
`id, name and path` are required options to have this feature working properly.
The `path` option is the vue component path in your host project

```js
const sectionsThemeComponents = inject('sectionsThemeComponents')
sectionsThemeComponents?.(this.section.name, [
  {
    id: 'global',
    name: 'Global sections theme settings',
    path: '/theme/global_settings'
  },
  {
    id: 'specific',
    name: 'Specific section theme settings',
    path: '/theme/Plans_settings'
  }
])
```

* The library expose: 1 hook (with no callback function) that can be implemented inside `sections/theme/theme-hooks.js`:

- `initialize_theme_settings`: this hook is called when the page data are received and have as arguments the theme settings data, the useHead composable that allow you to update the page head settings

* And 4 hooks (with callbacks):

- `section_removed` (that must return an object of the updated theme settings): this hook is called when confirming removing a section from a page, it allows you to update the theme settings metadata stored for the page and have as arguments the original theme settings data and the ID of the removed section
- `reset_theme_settings` (that must return an object of the original theme settings for each tab): this hook is called when confirming closing the settings popup, it allows you to reset any previously applied settings and have as arguments the original theme settings data, the data of section you are editing and the current tab in use
- `theme_settings_payload` (that must return an object having the original theme settings and the updated ones for each tab): this hook is called when data change inside the theme component tab form, it allows to correctly set the payload that will be processed by sections API to save the correct theme settings, it has as arguments the original theme settings data, the updated settings of the current theme component tab, the current tab in use and the data of section you are editing
- `handle_unsaved_settings` (that must returns a boolean): this hook is called when switching between the theme component tabs and returns true to show a warning for unsaved settings
  It takes as arguments:
1. isEqual: a function used to compare original and updated settings
2. Original theme settings saved for your project
3. Updated settings
4. Current tab in use
5. The data of section you are editing

i.e:

```js
const initialize_theme_settings = (settings, useHead) => {
  
}

const reset_theme_settings = (originalSettings, section, tab) => {
  
}

const handle_unsaved_settings = (isEqual, originalSettings, settings, tab, section) => {
  const allEmpty = Object.values(settings).every(value => value.trim() === '')
  return  !isEqual(originalSettings, settings) && !allEmpty
}

const theme_settings_payload = (originalThemeSettings, settings, tab, section) => {
  
}

const section_removed = (sectionTheme, sectionId) => {
  
}

export {
  initialize_theme_settings,
  reset_theme_settings,
  handle_unsaved_settings,
  theme_settings_payload,
  section_removed
}

```


## Dependency Injection / Providers

The library provide to the sections the following functions:

- `languageSupport` provider function that can be injected in a section view that calls this function with its name as a param, the function would add the section in a list of Sections to re-render whenever re-render call is made using the `refresh-section` event

```js
name: 'CategoriesDynamic',
  props: {
  section: {
    type: Object,
  default: () => {},
  },
  lang: {
    type: String,
  default: "en"
  },
},
mounted() {
  const languageSupport = inject('languageSupport')
  languageSupport?.(this.section.name)
},
```

- `loadScript` provider function that is used to inject javascript libraries, it takes as params the url of the script and a boolean uniqueness that is used to make sure the script requested is unique and it is not already injected in the DOM.
If the boolean uniqueness is set to true, the function will clean the script url from any query string and check if it is unique and not already added in the DOM

**How to use it:**
```js
const loadScript = inject('loadScript')
onMounted(async () => {
  if (!loadScript ) return
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.13.0/lottie.min.js', true)
})
```

## Development

1. Clone this repository
2. Install dependencies using `npm install`
3. Start development server using `npm run dev:prepare` then `npm run dev`

## For Contributors

If you wish to contribute to this project, head to this [wiki](https://github.com/Geeks-Solutions/nuxt-sections/wiki/Contributions) and follow the instructions there.
