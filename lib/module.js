const { resolve, join } = require('path')
const { readdirSync } = require('fs')

module.exports = async function (moduleOptions) {

  const { nuxt } = this

  nuxt.hook('i18n:extend-messages', function (additionalMessages) {
    additionalMessages.push({
      en: {
        "create": "Create",
        "Add": "Add a new section",
        "AddGlobal": "Add a global instance",
        "createGlobal": "Create Global instance",
        "availableSections": "Available sections",
        "typeInventory": "Inventory ",
        "selectSectionType": "Select a section type to create a global instance of it",
        "editLayout": "Edit layout",
        "hideLayout": "Hide layout options",
        "highlightRegions": "Highlight",
        "Edit page": "Edit page",
        "View page": "View page",
        "Edit": "Edit",
        "Save": "Save",
        "Restore": "Restore",
        "Variation": "Variation",
        "Main": "Main",
        "Synchronise": "Synchronise",
        "Logout": "Logout",
        "Create static section": "Create static section",
        "Create New Page": "Create New Page",
        "Done": "Done",
        "Continue": "Continue",
        "autoInsertInstance": "Automatically add this section to new pages",
        "instanceName": "Global Instance name",
        "promoteSection": "Promote to global instance",
        "section-title": "Please enter below the name of a new static section type",
        "section-input-title": "Static section name",
        "success-section-title": "Congratulations, you just added a new custom static section that is editable by a content administrator",
        "success-global-section-title": "Congratulations, you just added a new global instance that is editable by a content administrator",
        "success-section-subtitle": "Now you need to provide three components to make this section alive",
        "success-section-instruction-1": "One icon so it displays a nice and clear choice when adding a new section to a page",
        "success-section-instruction-2": "One form to let the content administrator edit it",
        "success-section-instruction-3": "One view so it can display as you want it for the site visitors",
        "delete-section-type": "Are you sure you want to delete this section type: ",
        "restoreSectionContent": "Are you sure you want to proceed , you will loose all your changes",
        "delete-global-section-type": "Are you sure you want to delete this global instance type: ",
        "authorize-section-type": "Authorise all sections of ",
        "un-authorize-section-type": "You will block all sections coming from ",
        "Confirm": "Confirm",
        "Cancel": "Cancel",
        "authorizeSuccess": "All sections from {appName} are now available",
        "unAuthorizeSuccess": "All sections from {appName} are now locked",
        "authorizeFirst": "You have to unlock this section to be able to use it and for this you will need to provide the authorisation fields. You can contact the creator of this section to get the value of those fields.",
        "Add another": "Add another",
        "Submit data": "Submit data",
        "Adding section": "Adding section...",
        "importSections": "Import sections only works for empty pages",
        "successImported": "Successfully imported ",
        "createPageSuccess": "Congratulations on successfully creating a new page on sections. Start adding some content to it.",
        "by": "By ",
        "loadPageError": "Couldn't load the page: ",
        "tokenInvalidReconnect": "Your token is invalid, reconnect from Sections BO to edit your page",
        "activateConfigSections": "Make sure to activate the configurable section ",
        "forProject": "for your project",
        "createSectionTypeError": "Couldn't create the new section type: ",
        "updateSectionTypeError": "Couldn't update this globale instance: ",
        "globalTypeUpdated": "Global instance updated successfully",
        "referencedSection1": "This section is referenced on",
        "referencedSection1Pages": "pages",
        "referencedSection2": "Editing it will modify it on all these pages",
        "enterSectionTypeName": "Please enter the name of the section",
        "createPageError": "We are unable to create a new sections page for ",
        "noSectionsFolder": "nuxt-sections: Your project contains no @/sections folder",
        "noFormsFolder": "nuxt-sections: Your project contains no @/sections/forms folder",
        "noLayoutsFolder": "nuxt-sections: Your project contains no @/sections/layouts folder",
        "in": "in",
        "cannotRegisterComp": "can't be registered! You should follow the naming convention of any registered component '{Section Name}_{Section Type}.vue'",
        "oldPageVersion": "The version of the page you have is an old one, please refresh your page before doing any modification",
        "linkedSection": "This section is linked to a main section, editing it will break the link, are you sure you want to proceed ?",
        "successAddedSection": "This sections was successfully added to your page but is now only visible to you.",
        "previewSectionError": "We are unable to preview your section, try again later",
        "successPageChanges": "You have successfully saved your changes and they are now visible to your visitors",
        "successSettingsChanges": "You have successfully saved your settings",
        "revertPageSuccess": "You have successfully reverted your page to how it is currently showing to your visitors",
        "sectionRemoved": "Your section has been removed, save your page to display this change to your visitors",
        "deleteSectionTypeError": "Couldn't delete section type: ",
        "deleteSectionPageError": "Couldn't delete section page: ",
        "authorizeError": "Couldn't authorize sections from ",
        "unAuthorizeError": "Couldn't un-authorize sections from ",
        "fillRequiredFields": "You must fill your required fields before submitting your data.",
        "saveConfigSectionError": "We couldn't save your changes, try again later",
        "changesPublished": "Your changes will be published when the page is saved.",
        "sectionsNotLoadedCorrectly": "Some sections could not be loaded correctly, saving the page will delete these sections from your page, unless you are happy with the page you see now, do not save it",
        "fieldNames": "Image/Media fields",
        "fieldDesc": "Declare the name of the fields carrying images/medias in your section, so that Sections can properly process them and return the URL for your files",
        "pathFieldDesc": "The path of the page cannot be blank, must be unique and does not accept specials characters",
        "field": "Field",
        "exportSectionsLabel": "Export sections",
        "importSectionsLabel": "Import sections",
        "clickToCopy": "click to copy",
        "deletePage": "Delete page",
        "deleteSection": "Delete section",
        "delete-section-page": "Are you sure you want to delete this page ?",
        "delete-section": "Are you sure you want to delete this section ? The section will be deleted from all layouts",
        "404NotFound": "404 page not found",
        "settingsSectionsLabel": "Page settings",
        "pageTitle": "Title",
        "pageSeoDesc": "SEO description",
        "pageUrl": "Page path*",
        "savePageSettings": "To save the metadata and the page url, you need to save your page",
        "imageFieldValidation": "Image field must be an array for section ",
        "pagePathRequired": "Page path is required",
        "instanceNameRequired": "Global instance name is required",
        "Metadata": "Settings",
        "wrongFieldName": "Wrong",
        "formatOfSection": "format for section:",
        "optionsFormat": "Options must be an array for section:",
        "invalidSectionsError": "This section could not be saved for the following reason: ",
        "someSectionsNotSaved": "We have an issue saving your page, some sections could not be saved. Scroll over your page to see which section has an issue",
        "unsupportedFieldType": "{type} is not supported, create a vue component named {name} inside @/sections/configurable_components to support it",
        "layoutErrors": {
          "missingComp": "The layout component is missing the props object",
          "missingProp": "The layout component is missing the `slotNames` prop array",
          "propArray": "The `slotNames` prop must be an array having at least one slot name",
          "regionNotConfigured": "region is not configured correctly in your layout:",
          "layoutTemp": "should be present in your layout template"
        },
        "sectionsLanguages": "Languages",
        "englishLang": "English (en)",
        "frenchLang": "French (fr)",
        "activateCookieControl": "Activate cookie consent",
        "gtmId": "GTM ID",
        "gtmIdRequired": "The field GTM Id is required",
        "requiredField": "Required field",
        "projectId": "Project ID",
        "editingSection": "You cannot edit a section while already editing one",
        "checkRequiredField": "There are required field(s) for the english version, please to check it to fill them",
        "filterName": "Name",
        "filterApply": "Apply",
        "filterClear": "Clear",
        "filterBy": "Filter by:",
        "sectionsAppName": "Application name",
        "mediaComponent": {
          "Upload":"Attach a media",
          "Change": "Modify your media",
          "remove": "Remove",
          "media": "Media",
          "favicon": "Favicon",
          "seoTag": "SEO tag: ",
          "filterMedias": "Filter medias",
          "filter": "Filter",
          "clearFilters": "Clear filters",
          "createNew": "+ Create New Media",
          "of": "of",
          "medias": "medias",
          "all": "ALL",
          "images": "IMAGES",
          "videos": "VIDEOS",
          "documents": "DOCUMENTS",
          "category": "CATEGORY:",
          "author": "Author",
          "owner": "Owner",
          "size": "Size",
          "copyLink": "Copy link",
          "total": "Total: ",
          "contentUsing": "Content using this media",
          "dragDropMedia": "Drag and drop the media from you machine to the box below",
          "dragDrop":"Drag and drop or",
          "browse":"browse",
          "yourMedia":"your media",
          "noMediasFound":"No medias found",
          "EditMedia": {
            "remove": "Remove",
            "mediaTitle":"Media Title",
            "tag":"SEO tag",
            "type":"File type",
            "privateDesc":"Private file is a file not publicly accessible but require an STS token to be accessed",
            "publicDesc":"Public file can be accessible by any user",
            "selectOption":"Select an option",
            "state":"Media state",
            "lockedDesc":"Locked file: no other editors of the app can edit it.",
            "unlockedDesc":"Unlocked: all editors can edit the file",
            "sizeRec":"(Size recommended",
            "fileName":"File name:",
            "fileSize":"File size:",
            "duration":"Duration:",
            "downloadMedia":"Download Media",
            "deleteMedia":"DELETE MEDIA",
            "Global Platform": "Global Platform",
            "deleteMediaMsg": "Are you sure you want to delete this media?",
            "cancel": "Cancel",
            "public": "Public",
            "private": "Private",
            "cannotDelete": "Oops! You cannot delete this media",
            "cannotDeleteExtra": "because it\'s linked to the following contents:",
            "updateMediaAgain": "If you update the media file and the media is the one used by your section, make sure to select again the media to have the updated preview"
          },
          "table": {
            "filterBy": "Filter by:",
            "filterDefault": "Select a filter",
            "addFilter": "Add another filter",
            "filter": "Filter",
            "clearFilters": "clear filters",
            "applyFilters": "Apply filters",
            "outOf": "out of",
            "to": "to",
            "results": "results",
            "next": "Next",
            "previous": "Previous",
          },
          "selectFilter":"Select a filter",
          "filterOptions": {
            "title": "Title",
            "createdBy": "Created by",
            "contentsNumber": "Number of contents",
            "privateStatus": "Private status",
            "lockedStatus": "Locked status",
            "selectStatus": "Select a status"
          },
          "headerItems": {
            "id": "ID:",
            "creationDate": "Creation date:",
            "createdBy": "Created by:",
            "mediaType": "Media type:",
            "contents": "Number of content:"
          },
          "by": "by ",
          "save": "Save",
          "selectMedia": "Select media",
          "public": "Public",
          "private": "Private",
          "selectUser": "Select a user",
          "previewNotAvailable": "Preview for private media is not available",
          "seeMore": "SEE MORE",
          "noPermission": "You don’t have the permission to",
          "editMediaLabel": "edit the media",
          "previewMediaLabel": "preview the media",
          "previewOrEditMediaLabel": "preview OR edit the media",
          "becauseMedia": "because this media is set as",
          "locked": "locked",
          "unlocked": "unlocked",
          "privateAndLocked": "private & locked",
          "byCreator": "by the creator",
          "mediaUpdated": "Media updated successfully",
          "mediaCreated": "Media created successfully",
        },
        intro: {
          createPage: "Create a new page in your project, the page will carry the URL in the address bar",
          editPage: "Edit your page to add sections to it",
          topBarButtons: "You are now in edit mode, you can select your page layout and add sections to it",
          addNewSection: "Choose a section to add to your page",
          availableSections: "Here are all the section types you enabled in your project",
          inventory: "The inventory lists all the sections types that you can enable on your project. enabled sections types become available for you to add on your pages.",
          simpleCTA: "Create this Section type to use it in your page, you can always delete it later",
          simpleCTAInstalled: "Now head back to the Available sections to add the new section type to your page",
          clickSimpleCTA: "Normally, you click on the section to add it to your page; for this tutorial, click",
          simpleCTAForm: "Fill in the value you want for this section and submit it to preview your changes",
          saveChanges: "Only you can see this page now, Save it so it becomes available to all your visitors",
          globalSections: "Global sections let you use one section content in multiple pages, the content is automatically synced and can be automatically added to upcoming new pages you add to your project",
          creatingGlobalSection: "Creating a global section will define it on your project and you'll be able to add it anywhere in your pages, like you would for a standard section",
          promoteSection: 'If you want to promote a standard section to a global one, you can do so by editing the section and clicking the "Promote to global" section button at the bottom of the edit form',
          inventoryDesc: "The inventory lists all the sections types that you can enabled for your project so they become available for you to add to your pages",
          checkIt: "Explore it",
          createSection: "Create section",
          openAvailableSections: "Open available sections",
          confirm: "Confirm",
          here: "here",
          nextLabel: "Next",
          prevLabel: "Previous",
          doneLabel: "Done",
          dontShowAgainLabel: "Don't show this again",
          relaunch: "Click here to launch again this guide",
          findMoreGlobal: "Find more information on the global sections here"
        }
      },
      fr: {
        "create": "Créer",
        "Add": "Ajouter une nouvelle section",
        "AddGlobal": "Ajouter une instance globale",
        "createGlobal": "Créer une instance globale",
        "availableSections": "Sections disponibles",
        "typeInventory": "Inventaire ",
        "selectSectionType": "Sélectionner un type de section pour créer une instance globale de celle-ci",
        "editLayout": "Editer le layout",
        "hideLayout": "Cacher les options du layout",
        "highlightRegions": "Surligner",
        "Edit page": "Editer cette page",
        "View page": "Voir cette page",
        "Edit": "Editer",
        "Save": "Enregistrer",
        "Restore": "Restaurer",
        "Variation": "Variation",
        "Main": "Principale",
        "Synchronise": "Synchroniser",
        "Logout": "Déconnecter",
        "Create static section": "Créer un nouveau type de section statique",
        "Create New Page": "Créer une nouvelle page",
        "Done": "Fait",
        "Continue": "Continuer",
        "autoInsertInstance": "Ajouter automatiquement cette section aux nouvelles pages",
        "instanceName": "Nom de l'instance globale",
        "promoteSection": "Promouvoir á une instance globale",
        "section-title": "Veuillez saisir le nom de votre nouveau type de section statique",
        "section-input-title": "Nom de la section statique",
        "success-section-title": "Félicitations, vous venez de créer une section statique modifiable par votre editeur de contenu",
        "success-global-section-title": "Félicitations, vous venez de créer une globale instance modifiable par votre editeur de contenu",
        "success-section-subtitle": "Vous devez maintenant créer trois composants pour que cette section soit utilisable",
        "success-section-instruction-1": "Une icône à afficher dans la fenètre d'ajout de section à une page",
        "success-section-instruction-2": "Un formulaire pour saisir les données à sauvegarder",
        "success-section-instruction-3": "Un aperçu pour qu'elle puisse être affichée comme vous le voulez pour les visiteurs du site",
        "delete-section-type": "Voulez-vous vraiment supprimer ce type de section: ",
        "restoreSectionContent": "Êtes-vous sûr de vouloir continuer ? Vous allez perdre toutes vos modifications.",
        "delete-global-section-type": "Voulez-vous vraiment supprimer ce type de l'instance globale: ",
        "authorize-section-type": "Autoriser toutes les sections de ",
        "un-authorize-section-type": "Vous aller bloquer les sections provenant de ",
        "Confirm": "Confirmer",
        "Cancel": "Annuler",
        "authorizeSuccess": "Toutes les section de {appName} sont maintenant disponibles",
        "unAuthorizeSuccess": "Toutes les sections de {appName} sont maintenant bloquées",
        "authorizeFirst": "Vous devez déverrouiller cette section pour pouvoir l'utiliser et pour cela, vous devrez fournir les champs d'autorisation. Vous pouvez contacter le créateur de cette section pour obtenir la valeur de ces champs.",
        "Add another": "Ajouter un autre",
        "Submit data": "Soumettre les données",
        "Adding section": "Ajout de la section...",
        "importSections": "L'importation de sections ne fonctionne que pour les pages vides",
        "successImported": "Importation réussie pour ",
        "createPageSuccess": "Félicitations pour avoir réussi à créer une nouvelle page sur les sections. Commencez à y ajouter du contenu.",
        "by": "Par ",
        "loadPageError": "Impossible de charger la page: ",
        "tokenInvalidReconnect": "Votre token n'est pas valide, reconnectez-vous via  Sections BO pour modifier votre page",
        "activateConfigSections": "Assurez-vous d'activer la section configurable ",
        "forProject": "pour votre projet",
        "createSectionTypeError": "Impossible de créer le nouveau type de section: ",
        "updateSectionTypeError": "Impossible de modifier ce type de l'instance globale: ",
        "globalTypeUpdated": "Mise à jour de l'instance globale réussie",
        "referencedSection1": "Cette section est référencée sur",
        "referencedSection1Pages": "pages",
        "referencedSection2": "Le modifier le modifiera sur toutes ces pages",
        "enterSectionTypeName": "Veuillez entrer le nom de la section",
        "createPageError": "Nous ne sommes pas en mesure de créer une nouvelle page de sections pour ",
        "noSectionsFolder": "nuxt-sections: votre projet ne contient aucun dossier @/sections",
        "noFormsFolder": "nuxt-sections: votre projet ne contient aucun dossier @/sections/forms",
        "noLayoutsFolder": "nuxt-sections: votre projet ne contient aucun dossier @/sections/layouts",
        "in": "dans",
        "cannotRegisterComp": "ne peut pas être enregistré ! Vous devez suivre la convention de nommage de tout composant enregistré '{Section Name}_{Section Type}.vue'",
        "oldPageVersion": "La version de la page que vous avez est ancienne, veuillez actualiser votre page avant de faire toute modification",
        "linkedSection": "Cette section est liée à une section principale, la modifier cassera le lien, êtes-vous sûr de vouloir continuer ?",
        "successAddedSection": "Cette section a été ajoutée avec succès à votre page mais n'est maintenant visible que pour vous.",
        "previewSectionError": "Nous ne pouvons pas prévisualiser votre section, réessayez plus tard",
        "successPageChanges": "Vous avez enregistré avec succès vos modifications et elles sont maintenant visibles pour vos visiteurs",
        "successSettingsChanges": "Vous avez enregistré vos paramètres avec succès",
        "revertPageSuccess": "Vous avez rétabli avec succès votre page telle qu'elle s'affiche actuellement pour vos visiteurs",
        "sectionRemoved": "Votre section a été supprimée, enregistrez votre page pour afficher ce changement à vos visiteurs",
        "deleteSectionTypeError": "Impossible de supprimer le type de section: ",
        "deleteSectionPageError": "Impossible de supprimer la page section: ",
        "authorizeError": "Impossible d'autoriser les sections de ",
        "unAuthorizeError": "Impossible d'annuler l'autorisation des sections de ",
        "fillRequiredFields": "Vous devez remplir les champs requis avant de soumettre vos données.",
        "saveConfigSectionError": "Nous n'avons pas pu enregistrer vos modifications, réessayez plus tard",
        "changesPublished": "Vos modifications seront publiées lorsque la page sera enregistrée.",
        "sectionsNotLoadedCorrectly": "Certaines sections n'ont pas pu être chargées correctement, l'enregistrement de la page supprimera ces sections de votre page, à moins que vous ne soyez satisfait de la page que vous voyez maintenant, ne l'enregistrez pas",
        "fieldNames": "Champs Image/Média",
        "fieldDesc": "Déclarer le nom des champs images/médias dans votre section, de façon à ce que Sections puisse les procéder correctement et retourner l'URL pour vos fichiers",
        "pathFieldDesc": "Le chemin de la page ne peut être blanc, doit être unique et n'accepte pas de charatère spécial",
        "field": "Champ",
        "exportSectionsLabel": "Exporter les sections",
        "importSectionsLabel": "Importer les sections",
        "clickToCopy": "cliquez pour copier",
        "deletePage": "Supprimer la page",
        "deleteSection": "Supprimer la section",
        "delete-section-page": "Êtes vous sur de vouloir supprimer cette page ?",
        "delete-section": "Êtes vous sur de vouloir supprimer cette section ? La section sera supprimée de toutes les mises en page",
        "404NotFound": "404 Page non trouvée",
        "settingsSectionsLabel": "Page settings",
        "pageTitle": "Titre",
        "pageSeoDesc": "Description SEO",
        "pageUrl": "Chemin de la page*",
        "savePageSettings": "Pour sauver les metadatas et l'url de la page vous devez sauver la page",
        "imageFieldValidation": "Le champ image doit être un tableau pour la section ",
        "pagePathRequired": "Le chemin de la page est requis",
        "instanceNameRequired": "Le nom de l'instance globale est requis",
        "Metadata": "Paramètres",
        "wrongFieldName": "Le format du champ",
        "formatOfSection": "est incorrecte pour la section:",
        "optionsFormat": "Les options doivent être un tableau pour la section:",
        "invalidSectionsError": "Cette section n'a pas pu être sauvegardée pour la raison suivante: ",
        "someSectionsNotSaved": "Nous rencontrons un problème lors de l'enregistrement de votre page, certaines sections n'ont pas pu être sauvegardées. Faites défiler votre page pour voir quelle section pose problème",
        "unsupportedFieldType": "{type} n'est pas pris en charge, veuillez créer un composant Vue nommé {name} à l'intérieur de @/sections/configurable_components pour le prendre en charge",
        "layoutErrors": {
          "missingComp": "Le composant de mise en page ne dispose pas de l'objet props",
          "missingProp": "Le composant de mise en page ne contient pas le tableau de props `slotNames`",
          "propArray": "La prop `slotNames` doit être un tableau ayant au moins un nom d'emplacement",
          "regionNotConfigured": "région n'est pas configurée correctement dans votre mise en page:",
          "layoutTemp": "doit être présent dans votre modèle de mise en page"
        },
        "sectionsLanguages": "Langues",
        "englishLang": "Anglais (en)",
        "frenchLang": "Français (fr)",
        "activateCookieControl": "Activer le consentement aux cookies",
        "gtmId": "GTM ID",
        "gtmIdRequired": "Le champs GTM Id est requis",
        "requiredField": "Champ requis",
        "projectId": "ID du projet",
        "editingSection": "Vous ne pouvez pas modifier une section lorsque vous en modifiez déjà une",
        "checkRequiredField": "Il y a des champ(s) requis pour la version anglaise, veuillez s'il vous plait y accéder pour les remplir",
        "filterName": "Nom",
        "filterApply": "Appliquer",
        "filterClear": "Effacer",
        "filterBy": "Filtrer par:",
        "sectionsAppName": "Nom d'application",
        "mediaComponent": {
          "Upload":"Attacher un média",
          "Change": "Modifier votre média",
          "remove": "Supprimer",
          "media": "Média",
          "favicon": "Favicon",
          "seoTag": "Tag SEO: ",
          "filterMedias": "Filtrer les médias",
          "filter": "Filtrer",
          "clearFilters": "Supprimer les filtres",
          "createNew": "+ Créer un nouveau média",
          "of": "de",
          "medias": "médias",
          "all": "Tous",
          "images": "IMAGES",
          "videos": "VIDEOS",
          "documents": "DOCUMENTS",
          "category": "CATÉGORIE:",
          "author": "Auteur",
          "owner": "Propriétaires",
          "size": "Taille",
          "copyLink": "Copier le lien",
          "total": "Total: ",
          "contentUsing": "Contenu utilisant ce média",
          "dragDropMedia": "Faites glisser et déposer le média de votre ordinateura sur le contennt en dessous",
          "dragDrop":"Faites glisser et déposer ou",
          "browse":"rechercher",
          "yourMedia":"votre média",
          "noMediasFound":"Aucun média trouvé",
          "EditMedia": {
            "remove": "Supprimer",
            "mediaTitle":"Titre du média",
            "tag":"Tag. SEO",
            "type":"Type de fichier",
            "privateDesc":"Le fichier privé est un fichier qui n'est pas accessible au public mais qui nécessite un jeton STS pour y accéder",
            "publicDesc":"Le fichier public peut être accessible par n'importe quel utilisateur",
            "selectOption":"Sélectionner une option",
            "state":"Status du média",
            "lockedDesc":"Fichier verrouillé : aucun autre éditeur de l'application ne peut le modifier.",
            "unlockedDesc":"Déverrouillé : tous les éditeurs peuvent modifier le fichier",
            "sizeRec":"(Taille recommandée",
            "fileName":"Nom du fichier:",
            "fileSize":"Taille du fichier:",
            "duration":"Durée:",
            "downloadMedia":"Télécharger le média",
            "deleteMedia":"Supprimer le média",
            "Global Platform": "Plateforme globale",
            "deleteMediaMsg": "Êtes vous sur de vouloir supprimer ce média?",
            "cancel": "Annuler",
            "public": "Public",
            "private": "Privé",
            "cannotDelete": "Oops! Vous ne pouvez pas supprimer ce media",
            "cannotDeleteExtra": "parcequ'il est lié au contenus suivants:",
            "updateMediaAgain": "Si vous mettez á jour le fichier du média et que c'est celui qui est utilisé par votre section, sélectionner le média de nouveau pour avoir l'aperçu mis á jour"
          },
          "table": {
            "filterBy": "Filtrer par:",
            "filterDefault": "Sélectionner un filtre",
            "addFilter": "Ajouter un nouveau filtre",
            "filter": "Filtrer",
            "clearFilters": "Supprimer les filtres",
            "applyFilters": "Appliquer les filtres",
            "outOf": "sur",
            "to": "à",
            "results": "résultats",
            "next": "Suivant",
            "previous": "Precedent",
          },
          "selectFilter":"Sélectionner un filtre",
          "filterOptions": {
            "title": "Titre",
            "createdBy": "Créé par",
            "contentsNumber": "Nombre de contenus",
            "privateStatus": "Statut privé",
            "lockedStatus": "Statut verrouillé",
            "selectStatus": "Sélectionner un status"
          },
          "headerItems": {
            "id": "ID:",
            "creationDate": "Date de création:",
            "createdBy": "Créé par:",
            "mediaType": "Type de média:",
            "contents": "Nombre de contenus:"
          },
          "by": "par ",
          "save": "Sauvegarder",
          "selectMedia": "Sélectionnez le média",
          "public": "Public",
          "private": "Privé",
          "selectUser": "Sélectionner un utilisateur",
          "previewNotAvailable": "L'aperçu pour les médias privés n'est pas disponible",
          "seeMore": "VOIR PLUS",
          "noPermission": "Vous n'avez pas la permission",
          "editMediaLabel": "d'éditer le média",
          "previewMediaLabel": "de voir ce média",
          "previewOrEditMediaLabel": "de voir ou d'éditer le média",
          "becauseMedia": "parcequ'il est configuré",
          "locked": "bloqué",
          "unlocked": "débloqué",
          "privateAndLocked": "privé & bloqué",
          "byCreator": "par le créateur",
          "mediaUpdated": "Média mis à jour avec succès",
          "mediaCreated": "Média créé avec succès",
        },
        intro: {
          createPage: "Créez une nouvelle page dans votre projet, la page portera l'URL dans la barre d'adresse",
          editPage: "Modifiez votre page pour y ajouter des sections",
          topBarButtons: "Vous êtes maintenant en mode édition, vous pouvez sélectionner la mise en page de votre page et y ajouter des sections",
          addNewSection: "Choisissez une section à ajouter à votre page",
          availableSections: "Voici tous les types de sections que vous avez activés dans votre projet",
          inventory: "L'inventaire répertorie tous les types de sections que vous pouvez activer sur votre projet. Les types de sections activés deviennent disponibles pour que vous puissiez les ajouter à vos pages.",
          simpleCTA: "Créez ce type de section pour l'utiliser dans votre page, vous pouvez toujours le supprimer plus tard",
          simpleCTAInstalled: "Retournez maintenant aux sections disponibles pour ajouter le nouveau type de section à votre page",
          clickSimpleCTA: "En temps normal vous appuyez sur la section pour l’ajouter a votre page, dans le cadre de ce tutoriel cliquez",
          simpleCTAForm: "Remplissez la valeur que vous souhaitez pour cette section et soumettez-la pour prévisualiser vos modifications",
          saveChanges: "Vous seul pouvez voir cette page pour le moment. Enregistrez-la pour qu'elle soit disponible pour tous vos visiteurs",
          globalSections: "Les sections globales vous permettent d'utiliser le contenu d'une section dans plusieurs pages. Le contenu est automatiquement synchronisé et peut être ajouté automatiquement aux nouvelles pages que vous ajoutez à votre projet",
          creatingGlobalSection: "Créer une section globale la définira dans votre projet, et vous pourrez l'ajouter partout dans vos pages, comme vous le feriez pour une section standard",
          promoteSection: 'Si vous souhaitez promouvoir une section standard en section globale, vous pouvez le faire en modifiant la section et en cliquant sur le bouton "Promouvoir en section globale" en bas du formulaire d\'édition',
          inventoryDesc: "L'inventaire répertorie tous les types de sections que vous pouvez activer pour votre projet afin qu'ils soient disponibles pour les ajouter à vos pages",
          checkIt: "Explorez-le",
          createSection: "Créer une section",
          openAvailableSections: "Ouvrir les sections disponibles",
          confirm: "Confirmer",
          here: "ici",
          nextLabel: "Suivant",
          prevLabel: "Précédent",
          doneLabel: "Fin",
          dontShowAgainLabel: "Ne plus afficher ceci",
          relaunch: "Cliquez ici pour relancer le guide",
          findMoreGlobal: "Retrouvez plus d'information sur les sections globales ici"
        }
      }
    })
  })

  this.extendRoutes((routes, resolve) => {
    routes.push({
      name: 'all',
      path: `/*`, // Customize the route path as per your requirements
      component: resolve(__dirname, 'src/pages/_.vue') // Adjust the component path based on your file structure
    });
    routes.push({
      name: 'Health',
      path: `/health`, // Customize the route path as per your requirements
      component: resolve(__dirname, 'src/pages/health.vue') // Adjust the component path based on your file structure
    });
  });

  let options = {}

  let isTailwindInstalled = false

  this.options.buildModules.map(module => {
    if(module.toString().includes('tailwindcss')) {
      isTailwindInstalled = true
    }
  })

  if(isTailwindInstalled === false) {
    this.options.modules.map(module => {
      if(module.toString().includes('tailwindcss')) {
        isTailwindInstalled = true
      }
    })
  }

  if(isTailwindInstalled === false) {
    this.options.css.push(resolve(__dirname, 'src/assets/css/sections.css'))
    this.options.css.push('@geeks.solutions/vue-components/assets/media/media.css')
  }

  if(this.options.publicRuntimeConfig.sections) {
    options = {
      ...moduleOptions,
      ...this.options.publicRuntimeConfig.sections
    }
  } else {
    options = {
      ...moduleOptions,
    }
  }

  this.addModule('@geeks.solutions/vue-components/nuxt');
  this.options.css.push('@geeks.solutions/vue-components/assets/icons/icomoon/style.css')
  this.addPlugin({
    src: require.resolve('@geeks.solutions/vue-components/plugins/quill-editor.js'),
    mode: 'client',
  });


  let cookiesAlias = 'cookies'
  options['cookiesAlias'] = cookiesAlias

  this.options.modules.forEach(module => {
    if (Array.isArray(module) && module[0] === 'cookie-universal-nuxt' && module[1] && module[1].alias  && module[1].alias !== '') {
      cookiesAlias = module[1].alias
      options['cookiesAlias'] = cookiesAlias
    }
  })

  if (!options.namespace) options.namespace = 'sections'
  const { namespace } = options

  const pluginsToRegister = ['plugin.js', 'src/components/index.js', 'src/utils/index.js']
  for (const pluginString of pluginsToRegister) {
    this.addPlugin({
      src: resolve(__dirname, pluginString),
      fileName: join(namespace, pluginString),
      options
    })
  }

  if(isTailwindInstalled === false) {
    this.addPlugin({
      src: resolve(__dirname, 'src/assets/css/sections.css'),
      fileName: join(namespace, 'src/assets/css/sections.css'),
      options
    })
  }

  // build dir (.nuxt/)
  const foldersToSync = ['src/components/Sections', 'src/components/Translations', 'src/components/Tooltip', 'src/components/Editor', 'src/components/Medias', 'src/components/SectionsForms', 'src/components/SectionsViews', 'src/utils', 'src/configs/forms', 'src/configs/type-icons', 'src/configs/views', 'src/base/SubTypes', 'src/base/types', 'src/base/icons', 'src/base/assets']
  for (const pathString of foldersToSync) {
    const path = resolve(__dirname, pathString)
    for (const file of readdirSync(path)) {
      this.addTemplate({
        src: resolve(path, file),
        fileName: join(namespace, pathString, file),
        options
      })
    }
  }

  return {
    ...moduleOptions,
  }

}

module.exports.meta = require('../package.json')
