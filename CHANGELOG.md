# Releases

---

### v1.0.0 (19/4/2023)

---

 - Launch of nuxt-sections module migrated from vue-sections library

 - Library updates needed after the backend fixes done on media #93


### v1.0.1 (23/5/2023)

---

 - Bug fixes for the media content linking of configurable sections

 - Support for cookie-universal-nuxt alias to dynamically read the alias used by the host project
 
 - SEO metadata management #101

 - New feature implementation of having default support for dynamic pages


### v1.0.2 (29/5/2023)

---

 - Bug fixes for create new static section type to prevent sending empty name fields


### v1.0.3 (29/5/2023)

---

 - Bug fix for the problem of loosing sections when saving settings after updating a page with new sections added

 - Bug fix for the problem of sending updated sections that were not saved when saving settings

 - Update success message when saving a page settings


### v1.0.4 (8/6/2023)

---

 - Dynamic page path implementation

 - Issue 48 about performance by only loading the necessary views when rendering the page. All admin related html/JS codes will only show for admin users and in the edit mode 

 - Library must manage language supported #110

 - Adjustment to be done in the Library #109

 - Library update to support media #92

 - Proper 404 page when the page does not exist eweev/geeks/section-website#67
