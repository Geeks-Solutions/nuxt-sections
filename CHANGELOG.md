# Releases

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [1.1.3] - 2025-04-10

### Updated

- Update vue-components library version and fix to new version 1.0.17


### [1.1.2] - 2025-04-01

### Added

- Update vue-components library version and fix to new version 1.0.15
- Implemented 2 events that fires on page render `page_payload_preprocess` and `page_payload_postprocess` and that can be listened to by any external js code: Foundation for Js events firing + fire on page render #166
- Exposed a re-render section function that is added to window and can be called from any script in the site `window.SectionsCMS.reRenderSection`, it takes as params a list of section names and qs for each section

### Updated

- `refresh-section` is updated to support multiple sections refresh based on a list of section names and qs for each section: Possibility to re render a section while an event is triggered by the widget #41

### [1.1.1] - 2025-03-28

### Added

- introduced a new hook `init_params` that takes a params configuration and some context including query strings and request headers & body and update the params with the returned value: New query string env variable problems eweev/geeks/meta-sections#139


### [1.1.0] - 2025-03-17

### Removed

- Optimization update: Global css import for quill editor is moved to the form and view components to only load the css when the components are used

**Breaking Change**
- Using `v-html` to display the wysiwyg content will still work, but it will no more have the wysiwyg styles `headings, aligments etc...`
- Use the new introduced component to display the wysiwyg content
`<gWysiwygContent :html-content="html" />`

### Added

- Inject transpile quill 2 support in host project from module.js, required to have quill v2 working

- Tooltip copied message when anchor is clicked: Make sure that when you copy the anchor of a section there is a message copied to the clipboard #148

- Support for dynamic default language configured from Sections BO: Changes needed to make nuxt sections library able of configuring the defaultlocale of the nuxt/i18n library configuration #112

- Metatag adjustments #149


### [1.0.18] - 2025-03-06

### Added

- Support for custom sections 404 page that its path can be set through Sections BO: Ability to create a page on section for a project and use it when we have a 404 page not found #145

### Updated

- Sections settings icon to show the section name when hovered: When hovering an the gear icon of a section, have its name showing #143 

- Hide sections settings icons when side bar is opened: When adding or editing a section, the site side must be as if I am in view mode #142

- Upgrade vue-components library version to v1.0.12

### Fixed

- Scroll management when editing or adding sections in layouts: When using a layout and editing a section you need to use the anchor to be scrolled to the section you are editing #141

- Wysiwyg Headings styles not applied in view mode: When adding a wysiwyg or editing one in a page without css, idf you apply headings on the text , it is not reflected in the view mode #144


### [1.0.17] - 2025-02-03

### Added

- Introduced a new Form component (Draggable/Dynamic FieldSets component): Sections with multiple items must be enhanced to be more flexible #34

- A new hook `update_section_name` that allow to update the display of a section name. The hook is expected to be added to the `sections/js/global-hooks.js`

### Updated

- Add section updated to show in side bar: When adding a section, have it work like in edit mode and have a visual of it on the site when entering the data #78

### Fixed

- Display bugs: When a layout is selected and you have added several section in the left layout for example, when you click to delete a section the display of the popup is not correct #132 + When you are in edit mode and you edit a section with a media and then you click to edit the media, the display of the options of the page are blocking the one of the editor #126

- Bug of loosing layout data when saving page metadata + Bug of changing section weight when editing it inside a layout region: Losing sections weight when editing and using a specific layout #135 +  you add a section in a region and then ou move it to another region, it vanish #138

- Bug fix when adding or editing a section in a layout: When you are in a layout like extended-layout and you are editing or adding a section, the add new section button is showing for all region and they are clickable, they should not #140

- Bug fix When performing changes on a section inside a layout specifically then closing the section and confirm in the popup, the changes are still there instead of having the original section data #139

### [1.0.16] - 2025-01-17

### Added

- defaultLang support value can be set in Sections BO: Read the new default language field from project metadata #117.
Value of this field is now exposed to all sections views and forms for a better management of `Language Translations`

- Sections Tutorial: Interactive user guides #115

- Translation management for configurable fields #109: Dynamic fields of configurable section forms are now translatable by default for the following types 'wysiwyg', 'string', 'textfield', 'textarea' 

### Updated

- Automated test coverage for the fetch hook Fix automated test for the fetch hook #107

- Performance update: Loaded scripts size decreased by shifting the current wysiwyg editor component to the global editor component from vue-components library.
Which is using lazy load import of the quill libraries to only include the component where it is used

### Changed

- Wysiwyg Editor component to use the one coming from vue-components library: Wysiwyg Component update needed #110

- Condition to send the language when it is not default to always send it: Send the language query string even though the Sections site is in its default language #114:
Current language of the site will now always be sent in the payload query strings

### Fixed

- Replace old section when it gets promoted to global: Promoting a section to global is keeping the simple one on the page #113

- Fixed token expiration duration: When the token is expired and I access a Section site that was in edit mode, the edit mode must no more show #106

- Fix info icon to show the details on click: When there is an information icon for a section, in the section listing, have the info shown while clicking on it and not hovering #92

### [1.0.15] - 2024-12-24

### Fixed

- Fixed refresh section function problem with cname enabled that was not using the website domain


### [1.0.14] - 2024-12-16

### Fixed

- Weight problem for local sections #102

- Automatic scroll to the section when clicking to edit it #94

### Added

- For each section in admin & editMode a small button on the right and when clicking on it the edit options shows for the section #95

- Filter management for the different section tabs #68

- Support for asyncData hook for better pages navigation experience #100

### Updated

- Settings popup for the page to read project metadata and apply custom css #70

- query string to include language when it is not the default one when rendering a section #101


### [1.0.13] - 2024-11-11

### Added

- Lambda functions #88

### Fixed

- Layout data initialization on page render

- Fix Empty Edit section form when editing another section when one is already opened #87

- Custom css bug fixed #86

### [1.0.12] - 2024-10-24

### Added

- Added cname website domain support issue Using Cname for section project eweev/geeks/kms#44

- Meta data form needs css as additonal field #15

- Introduced a preview of the sections from the listing #57

- Introduce custom CSS and css presets in page settings #69

### Updated

- Section types listing updated tabs to Available sections, global Sections and Inventory #67

- Update wysiwygs image with default alt and lazy loading #75 

- page_pre_render hook #97

## [1.0.11] - 2024-10-16

### Fixed

- Multiple bug fixes [Library fixes needed #65](https://github.com/Geeks-Solutions/nuxt-sections/issues/65)

## [1.0.10] - 2024-08-29

### Fixed

- Fix query string problem on the root path [Query strings used for a section dynamic or configurable needs to support the root one / #48](https://github.com/Geeks-Solutions/nuxt-sections/issues/48)

- Fix default language selection when locales order is changed [Query strings used for a section dynamic or configurable needs to support the root one / #48](https://github.com/Geeks-Solutions/nuxt-sections/issues/48)

### Added

- Add a new event to the view component that allow the view section to be refreshed by calling the render API

- Added JSON QS support

- Global Sections management [Global Sections management #39](https://github.com/Geeks-Solutions/nuxt-sections/issues/39)

### Updated

- Updated vue-components library with live version 1.0.7

## [1.0.9] - 2024-04-05

### Fixed

- readme file type to have categories_titles[] that was categories_titles

- Add back the support for old query strings ?key=value in plus to the current management

### Updated

- When queryStrings is enabled: send a default qs with key=page_path that will have as value the sections page path (without the QS) for the render configurable, dynamic sections and when saving the page

- Configurable section type to support new field types that can be defined and imported from the host project [Library adjustment for configurable sections and query strings #41](https://github.com/Geeks-Solutions/nuxt-sections/issues/41)

## [1.0.8] - 2024-02-05

### Added

- A view component for medias regarding its type #30

- Info icon above dynamic section types to show the required query strings

- Expose Hooks for the dynamic page

### Fixed

- Dynamic and Configurable sections to support blogs section types

- Dynamic section types showing empty in the list of section types by removing the !include('local) condition

- Correct handling of sections initialization and sections errors

### Updated

- Query String management to support SEO

## [1.0.7] - 2024-01-31

### Added

- Layout and region integration #103
- Library should declare path /health #114
- Export the Wysiwyg component and add support for media meta component and media content linking
- Create static section enhancement #16
- CHANGELOG reformatted based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

### Removed

- Remove create static section button as the creation will now be dynamic from the list of available sections

### Updated

- Update vue-components library with live version 1.0.5

## [1.0.6] - 2023-08-28

### Added

- Add support for all sections errors by showing an alert icon near the edit/drag/delete option to indicate the sections that has error and display them in a popup when the button is clicked

## [1.0.5] - 2023-06-07

### Added

- Global management of the errors if a page is saved and a sections is invalid, from the Library #12
- Have an icon showing in the language switcher when editing a section, to show in which language the site is opened #13

### Fixed

- Verifying the integrity of the options the user wants to save for a section #9

## [1.0.4] - 2023-06-08

### Added

- Dynamic page path implementation
- Library management for supported language supported #110
- Library update to support media #92
- Proper 404 page when the page does not exist

### Fixed

- Load performance by only loading the necessary views when rendering the page. All admin related html/JS codes will only show for admin users and in the edit mode
- Adjustment to be done in the Library #109

## [1.0.3] - 2023-05-29

### Fixed

- Bug fix for the problem of loosing sections when saving settings after updating a page with new sections added
- Bug fix for the problem of sending updated sections that were not saved when saving settings

### Changed

- Update success message when saving a page settings

## [1.0.2] - 2023-05-29

### Fixed

- Bug fixes for create new static section type to prevent sending empty name fields

## [1.0.1] - 2023-05-23

### Added

- Support for cookie-universal-nuxt alias to dynamically read the alias used by the host project
- SEO metadata management [#101](https://github.com/Geeks-Solutions/vue-sections/issues/101)

### Fixed

- Bug fixes for the media content linking of configurable sections
- New feature implementation of having default support for dynamic pages

## [1.0.0] - 2023-04-19

### Added

- Launch of nuxt-sections module migrated from vue-sections library

### Fixed

- Library updates needed after the backend fixes done on media [#93](https://github.com/Geeks-Solutions/vue-sections/issues/93)

[1.0.7]: https://github.com/Geeks-Solutions/nuxt-sections/pull/23
[1.0.6]: https://github.com/Geeks-Solutions/nuxt-sections/pull/22
[1.0.5]: https://github.com/Geeks-Solutions/nuxt-sections/pull/11
[1.0.4]: https://github.com/Geeks-Solutions/nuxt-sections/pull/8
[1.0.3]: https://github.com/Geeks-Solutions/nuxt-sections/pull/7
[1.0.2]: https://github.com/Geeks-Solutions/nuxt-sections/pull/6
[1.0.1]: https://github.com/Geeks-Solutions/nuxt-sections/pull/5
[1.0.0]: https://github.com/Geeks-Solutions/nuxt-sections/pull/1
