const { resolve, join } = require('path')
const { readdirSync } = require('fs')

module.exports = async function (moduleOptions) {

  const { nuxt } = this

  nuxt.hook('i18n:extend-messages', function (additionalMessages) {
    additionalMessages.push({
      en: {
        "Add": "Add a new section",
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
        "section-title": "Please enter below the name of a new static section type",
        "section-input-title": "Static section name",
        "success-section-title": "Congratulations, you just added a new custom static section that is editable by a content administrator",
        "success-section-subtitle": "Now you need to provide three components to make this section alive",
        "success-section-instruction-1": "One icon so it displays a nice and clear choice when adding a new section to a page",
        "success-section-instruction-2": "One form to let the content administrator edit it",
        "success-section-instruction-3": "One view so it can display as you want it for the site visitors",
        "delete-section-type": "Are you sure you want to delete this section type: ",
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
        "activateConfigSections": "Make sure to activate the configurable section ",
        "forProject": "for your project",
        "createSectionTypeError": "Couldn't create the new section type: ",
        "enterSectionTypeName": "Please enter the name of the section",
        "createPageError": "We are unable to create a new sections page for ",
        "noSectionsFolder": "nuxt-sections: Your project contains no @/sections folder",
        "in": "in",
        "cannotRegisterComp": "can't be registered! You should follow the naming convention of any registered component '{Section Name}_{Section Type}.vue'",
        "oldPageVersion": "The version of the page you have is an old one, please refresh your page before doing any modification",
        "linkedSection": "This section is linked to a main section, editing it will break the link, are you sure you want to proceed ?",
        "successAddedSection": "This sections was successfully added to your page but is now only visible to you.",
        "previewSectionError": "We are unable to preview your section, try again later",
        "successPageChanges": "You have successfully saved your changes and they are now visible to your visitors",
        "revertPageSuccess": "You have successfully reverted your page to how it is currently showing to your visitors",
        "sectionRemoved": "Your section has been removed, save your page to display this change to your visitors",
        "deleteSectionTypeError": "Couldn't delete section type: ",
        "authorizeError": "Couldn't authorize sections from ",
        "unAuthorizeError": "Couldn't un-authorize sections from ",
        "fillRequiredFields": "You must fill your required fields before submitting.",
        "saveConfigSectionError": "We couldn't save your changes, try again later",
        "changesPublished": "Your changes will be published when the page is saved.",
        "sectionsNotLoadedCorrectly": "Some sections could not be loaded correctly, saving the page will delete these sections from your page, unless you are happy with the page you see now, do not save it",
        "fieldNames": "Field names",
        "field": "Field",
        "exportSectionsLabel": "Export sections",
        "importSectionsLabel": "Import sections",
        "clickToCopy": "click to copy"
      },
      fr: {
        "Add": "Ajouter une nouvelle section",
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
        "section-title": "Veuillez saisir le nom de votre nouveau type de section statique",
        "section-input-title": "Nom de la section statique",
        "success-section-title": "Félicitations, vous venez de créer une section statique modifiable par votre editeur de contenu",
        "success-section-subtitle": "Vous devez maintenant créer trois composants pour que cette section soit utilisable",
        "success-section-instruction-1": "Une icône à afficher dans la fenètre d'ajout de section à une page",
        "success-section-instruction-2": "Un formulaire pour saisir les données à sauvegarder",
        "success-section-instruction-3": "Un aperçu pour qu'elle puisse être affichée comme vous le voulez pour les visiteurs du site",
        "delete-section-type": "Voulez-vous vraiment supprimer ce type de section: ",
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
        "activateConfigSections": "Assurez-vous d'activer la section configurable ",
        "forProject": "pour votre projet",
        "createSectionTypeError": "Impossible de créer le nouveau type de section: ",
        "enterSectionTypeName": "Veuillez entrer le nom de la section",
        "createPageError": "Nous ne sommes pas en mesure de créer une nouvelle page de sections pour ",
        "noSectionsFolder": "nuxt-sections: votre projet ne contient aucun dossier @/sections",
        "in": "dans",
        "cannotRegisterComp": "ne peut pas être enregistré ! Vous devez suivre la convention de nommage de tout composant enregistré '{Section Name}_{Section Type}.vue'",
        "oldPageVersion": "La version de la page que vous avez est ancienne, veuillez actualiser votre page avant de faire toute modification",
        "linkedSection": "Cette section est liée à une section principale, la modifier cassera le lien, êtes-vous sûr de vouloir continuer ?",
        "successAddedSection": "Cette section a été ajoutée avec succès à votre page mais n'est maintenant visible que pour vous.",
        "previewSectionError": "Nous ne pouvons pas prévisualiser votre section, réessayez plus tard",
        "successPageChanges": "Vous avez enregistré avec succès vos modifications et elles sont maintenant visibles pour vos visiteurs",
        "revertPageSuccess": "Vous avez rétabli avec succès votre page telle qu'elle s'affiche actuellement pour vos visiteurs",
        "sectionRemoved": "Votre section a été supprimée, enregistrez votre page pour afficher ce changement à vos visiteurs",
        "deleteSectionTypeError": "Impossible de supprimer le type de section: ",
        "authorizeError": "Impossible d'autoriser les sections de ",
        "unAuthorizeError": "Impossible d'annuler l'autorisation des sections de ",
        "fillRequiredFields": "Vous devez remplir les champs obligatoires avant de soumettre.",
        "saveConfigSectionError": "Nous n'avons pas pu enregistrer vos modifications, réessayez plus tard",
        "changesPublished": "Vos modifications seront publiées lorsque la page sera enregistrée.",
        "sectionsNotLoadedCorrectly": "Certaines sections n'ont pas pu être chargées correctement, l'enregistrement de la page supprimera ces sections de votre page, à moins que vous ne soyez satisfait de la page que vous voyez maintenant, ne l'enregistrez pas",
        "fieldNames": "Noms de champs",
        "field": "Champ",
        "exportSectionsLabel": "Exporter les sections",
        "importSectionsLabel": "Importer les sections",
        "clickToCopy": "cliquez pour copier"
      }
    })
  })

  let options = {}

  let isTailwindInstalled = false

  this.options.buildModules.map(module => {
    isTailwindInstalled = module.toString().includes('tailwindcss')
  })

  if(isTailwindInstalled === false) {
    this.options.modules.map(module => {
      isTailwindInstalled = module.toString().includes('tailwindcss')
    })
  }

  if(isTailwindInstalled === false) {
    this.options.css.push(resolve(__dirname, 'src/assets/css/sections.css'))
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

  if (!options.namespace) options.namespace = 'sections'
  const { namespace } = options

  const pluginsToRegister = ['plugin.js', 'src/components/index.js', 'src/utils/index.js', 'src/assets/css/sections.css']
  for (const pluginString of pluginsToRegister) {
    this.addPlugin({
      src: resolve(__dirname, pluginString),
      fileName: join(namespace, pluginString),
      options
    })
  }

  // build dir (.nuxt/)
  const foldersToSync = ['src/components/Sections', 'src/utils', 'src/configs/forms', 'src/configs/type-icons', 'src/configs/views', 'src/base/SubTypes', 'src/base/types', 'src/base/icons', 'src/base/assets']
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


}

module.exports.meta = require('../package.json')
