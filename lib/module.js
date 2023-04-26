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
        "createPageSuccess": "Congratulations on successfully creating a new page on sections. Start adding some content to it."
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
        "Logout": "Deconnecter",
        "Create static section": "Créer un nouveau type de section statique",
        "Create New Page": "Créer une nouvelle page",
        "Done": "Fait",
        "Continue": "Continuer",
        "section-title": "Veuillez saisir le nom de votre nouveau type de section static",
        "section-input-title": "Nom de la section static",
        "success-section-title": "Félicitations, vous venez de créer une section static modifiable par votre editeur de contenu",
        "success-section-subtitle": "Vous devez maintenant créer trois composants pour que cette section soit utilisable",
        "success-section-instruction-1": "Une icon à afficher dans la fenetre d'ajout de section à une page",
        "success-section-instruction-2": "Un formulaire pour saisir les données à sauvegarder",
        "success-section-instruction-3": "Un en rendu qui s'affichera pour tout vos visiteurs",
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
        "createPageSuccess": "Félicitations pour avoir réussi à créer une nouvelle page sur les sections. Commencez à y ajouter du contenu."
      }
    })
  })

  let options = {}

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

  const pluginsToRegister = ['plugin.js', 'src/components/index.js', 'src/utils/index.js']
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
