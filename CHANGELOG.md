# Releases

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [1.0.16] - 2025-01-17

### Added

- defaultLang support value can be set in Sections BO: Read the new default language field from project metadata #117

- Sections Tutorial: Interactive user guides #115

- Translation management for configurable fields #109

### Updated

- Automated test coverage for the fetch hook Fix automated test for the fetch hook #107

### Changed

- Wysiwyg Editor component to use the one coming from vue-components library Wysiwyg Component update needed #110

- Condition to send the language when it is not default to always send it: Send the language query string even though the Sections site is in its default language #114

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
