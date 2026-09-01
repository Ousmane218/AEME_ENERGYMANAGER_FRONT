export const userGuide = {
  gestionnaire: {
    label: "Gestionnaire",
    sections: [
      {
        title: "Tableau de bord",
        steps: [
          { label: "Consulter mon tableau de bord", path: ["Tableau de bord"] },
          { label: "Créer un nouveau rapport", path: ["Tableau de bord", "Nouveau Rapport"] },
          { label: "Consulter mes derniers rapports", path: ["Tableau de bord", "Activité des Rapports"] },
          { label: "Consulter tous mes rapports", path: ["Tableau de bord", "Activité des Rapports", "Voir Tout"] },
          { label: "Télécharger le Cadastre Énergétique", path: ["Tableau de bord", "Télécharger maintenant"] },
          { label: "Accéder à la messagerie", path: ["Tableau de bord", "Messagerie"] },
        ]
      },
      {
        title: "Mes Rapports",
        steps: [
          {
            label: "Créer un rapport",
            description: "Créez un nouveau rapport énergétique pour votre structure en renseignant les informations demandées et en ajoutant, si nécessaire, les pièces justificatives.",
            path: ["Mes Rapports", "Nouveau Rapport"]
          },
          { label: "Consulter mes rapports", path: ["Mes Rapports"] },
          {
            label: "Filtrer mes rapports par statut",
            description: "Utilisez les filtres pour retrouver rapidement les rapports soumis, approuvés ou rejetés.",
            path: ["Mes Rapports", "Tous / Soumis / Approuvés / Rejetés"]
          },
          {
            label: "Consulter le détail d’un rapport",
            description: "Retrouvez les informations transmises dans le rapport, son statut actuel ainsi que les documents qui y sont associés.",
            path: ["Mes Rapports", "sélectionner le rapport"]
          },
          {
            label: "Télécharger une pièce jointe",
            description: "Les documents et justificatifs associés à un rapport peuvent être consultés ou téléchargés depuis sa fiche détaillée.",
            path: ["Mes Rapports", "sélectionner le rapport", "Télécharger"]
          },
          {
            label: "Supprimer un rapport",
            description: "Cette action permet de supprimer définitivement le rapport sélectionné. Vérifiez le rapport concerné avant de confirmer.",
            path: ["Mes Rapports", "icône Corbeille sur le rapport concerné"]
          },
        ]
      },
      {
        title: "Messagerie",
        steps: [
          { label: "Consulter mes conversations", path: ["Messagerie"] },
          {
            label: "Démarrer une conversation avec un utilisateur",
            description: "Recherchez un utilisateur de la plateforme pour commencer une conversation privée avec lui.",
            path: ["Messagerie", "rechercher l’utilisateur", "sélectionner l’utilisateur"]
          },
          { label: "Envoyer un message", path: ["Messagerie", "sélectionner une conversation", "saisir le message", "Envoyer"] },
          {
            label: "Participer à une discussion de groupe",
            description: "Les groupes auxquels vous appartenez apparaissent directement dans votre messagerie. Sélectionnez-en un pour participer à la discussion.",
            path: ["Messagerie", "sélectionner le groupe", "saisir le message", "Envoyer"]
          },
          { label: "Retirer une conversation privée de ma liste", path: ["Messagerie", "icône X sur la conversation"] },
        ]
      },
      {
        title: "Réunions",
        steps: [
          { label: "Consulter mes réunions", path: ["Réunions"] },
          {
            label: "Rejoindre une réunion",
            description: "Les réunions auxquelles vous avez accès apparaissent dans la rubrique Réunions. Utilisez le bouton Rejoindre au moment de la visioconférence.",
            path: ["Réunions", "sélectionner la réunion", "Rejoindre"]
          },
          { label: "Copier le lien d’une réunion", path: ["Réunions", "sélectionner Copier le lien"] },
          { label: "Supprimer une réunion privée que j’ai créée", path: ["Réunions", "icône Corbeille sur la réunion"] },
        ]
      },
      {
        title: "Carte",
        steps: [
          { label: "Consulter la carte énergétique", path: ["Carte"] }
        ]
      },
      {
        title: "Mon Profil",
        steps: [
          { label: "Consulter mon profil", path: ["Mon Profil"] },
          { label: "Modifier mes informations de profil", path: ["Mon Profil", "modifier les informations", "Enregistrer"] }
        ]
      }
    ]
  },
  administrateur: {
    label: "Administrateur",
    sections: [
      {
        title: "Tableau de bord",
        steps: [
          { label: "Consulter le tableau de bord", path: ["Tableau de bord"] },
          { label: "Consulter les derniers rapports reçus", path: ["Tableau de bord", "Activité des Rapports"] },
          { label: "Consulter tous les rapports", path: ["Tableau de bord", "Activité des Rapports", "Voir Tout"] },
          { label: "Ouvrir un rapport récent", path: ["Tableau de bord", "sélectionner le rapport"] },
          { label: "Planifier une réunion", path: ["Tableau de bord", "Planifier Réunion"] },
          { label: "Accéder à la messagerie", path: ["Tableau de bord", "Messagerie"] },
          { label: "Télécharger le Cadastre Énergétique", path: ["Tableau de bord", "Télécharger maintenant"] },
        ]
      },
      {
        title: "Rapports",
        steps: [
          { label: "Consulter tous les rapports", path: ["Rapports"] },
          { label: "Filtrer les rapports par statut", path: ["Rapports", "Tous / Soumis / Approuvés / Rejetés"] },
          { label: "Consulter le détail d’un rapport", path: ["Rapports", "sélectionner le rapport"] },
          {
            label: "Approuver un rapport",
            description: "Après vérification des informations transmises par le Gestionnaire, vous pouvez approuver un rapport encore en attente. Son statut devient alors Validé.",
            path: ["Rapports", "sélectionner un rapport en attente", "Approuver"]
          },
          {
            label: "Rejeter un rapport",
            description: "Utilisez cette action lorsqu'un rapport en attente ne peut pas être validé. Le rapport apparaîtra ensuite avec le statut Rejeté.",
            path: ["Rapports", "sélectionner un rapport en attente", "Rejeter"]
          },
          { label: "Télécharger une pièce jointe", path: ["Rapports", "sélectionner le rapport", "Télécharger"] },
        ]
      },
      {
        title: "Gestionnaires",
        steps: [
          { label: "Consulter les utilisateurs", path: ["Gestionnaires"] },
          { label: "Rechercher un utilisateur", path: ["Gestionnaires", "utiliser la barre de recherche"] },
          {
            label: "Créer un utilisateur",
            description: "Créez le compte d’un nouvel utilisateur et attribuez-lui le rôle correspondant à ses responsabilités dans Energy Manager.",
            path: ["Gestionnaires", "Nouvel utilisateur"]
          },
          {
            label: "Créer un Gestionnaire",
            description: "Un Gestionnaire doit être rattaché à une Structure et à une Cohorte afin d’accéder aux fonctionnalités correspondant à son périmètre.",
            path: ["Gestionnaires", "Nouvel utilisateur", "choisir Gestionnaire", "sélectionner la Structure et la Cohorte", "Envoyer l’invitation"]
          },
          {
            label: "Créer un DAGE",
            description: "Le profil DAGE est rattaché à un Ministère. Sélectionnez le ministère correspondant avant l’envoi de l’invitation.",
            path: ["Gestionnaires", "Nouvel utilisateur", "choisir DAGE", "sélectionner le Ministère", "Envoyer l’invitation"]
          },
          { label: "Créer un Administrateur", path: ["Gestionnaires", "Nouvel utilisateur", "choisir Administrateur Système", "Envoyer l’invitation"] },
          { label: "Consulter le détail d’un utilisateur", path: ["Gestionnaires", "sélectionner l’utilisateur"] },
          {
            label: "Désactiver un utilisateur",
            description: "La désactivation bloque l’accès de l’utilisateur à la plateforme sans supprimer définitivement son compte.",
            path: ["Gestionnaires", "sélectionner l’utilisateur", "Désactiver"]
          },
          {
            label: "Réactiver un utilisateur",
            description: "Réactivez un compte précédemment désactivé afin de lui permettre d’accéder de nouveau à la plateforme.",
            path: ["Gestionnaires", "sélectionner l’utilisateur", "Réactiver"]
          },
          {
            label: "Renvoyer une invitation",
            description: "Cette action permet de renvoyer l’invitation à un utilisateur dont l’activation du compte est toujours en attente.",
            path: ["Gestionnaires", "sélectionner l’utilisateur", "Renvoyer l’invitation"]
          },
          { label: "Consulter les rapports d’un utilisateur", path: ["Gestionnaires", "sélectionner l’utilisateur", "Archive des Rapports"] },
          { label: "Démarrer une conversation avec un utilisateur", path: ["Gestionnaires", "sélectionner l’utilisateur", "Chat Direct"] },
        ]
      },
      {
        title: "Messagerie",
        steps: [
          { label: "Consulter mes conversations", path: ["Messagerie"] },
          { label: "Envoyer un message", path: ["Messagerie", "sélectionner une conversation", "saisir le message", "Envoyer"] },
          { label: "Démarrer une conversation avec un utilisateur", path: ["Messagerie", "rechercher l’utilisateur", "sélectionner l’utilisateur"] },
          { label: "Accéder à l’administration des groupes", path: ["Messagerie", "icône Paramètres"] },
          {
            label: "Créer un groupe global",
            description: "Un groupe global permet de créer un espace de discussion destiné à l’ensemble des utilisateurs concernés par ce groupe.",
            path: ["Messagerie", "Paramètres", "Global", "renseigner le Nom", "Créer"]
          },
          {
            label: "Créer un groupe pour un ministère",
            description: "Créez un espace de discussion réservé aux utilisateurs rattachés au ministère sélectionné.",
            path: ["Messagerie", "Paramètres", "Ministère", "sélectionner le Ministère cible", "renseigner le Nom", "Créer"]
          },
          {
            label: "Créer un groupe pour une structure",
            description: "Créez un espace de discussion réservé aux utilisateurs rattachés à une structure donnée.",
            path: ["Messagerie", "Paramètres", "Structure", "sélectionner la Structure cible", "renseigner le Nom", "Créer"]
          },
          {
            label: "Créer un groupe pour une cohorte",
            description: "Créez un espace de discussion regroupant les utilisateurs appartenant à une même cohorte.",
            path: ["Messagerie", "Paramètres", "Cohorte", "sélectionner la Cohorte cible", "renseigner le Nom", "Créer"]
          },
          {
            label: "Synchroniser les membres d’un groupe",
            description: "La synchronisation met à jour automatiquement les membres du groupe selon son ministère, sa structure ou sa cohorte de rattachement.",
            path: ["Messagerie", "Paramètres", "sélectionner le groupe", "Sync"]
          },
          {
            label: "Archiver un groupe",
            description: "L’archivage désactive le groupe sans le supprimer définitivement. Il pourra être réactivé ultérieurement.",
            path: ["Messagerie", "Paramètres", "sélectionner le groupe", "Archiver"]
          },
          { label: "Réactiver un groupe archivé", path: ["Messagerie", "Paramètres", "sélectionner le groupe", "Réactiver"] },
        ]
      },
      {
        title: "Réunions",
        steps: [
          { label: "Consulter les réunions", path: ["Réunions"] },
          {
            label: "Planifier une réunion",
            description: "Programmez une visioconférence en définissant son type, son public cible ainsi que sa date et son heure de début.",
            path: ["Réunions", "Planifier une Réunion"]
          },
          {
            label: "Planifier une réunion globale",
            description: "Une réunion globale est destinée à l’ensemble des utilisateurs concernés de la plateforme.",
            path: ["Réunions", "Planifier une Réunion", "Globale (Tous)", "définir la date et l’heure"]
          },
          {
            label: "Planifier une réunion pour un ministère",
            description: "Cette option permet de programmer une réunion destinée aux utilisateurs rattachés au ministère sélectionné.",
            path: ["Réunions", "Planifier une Réunion", "Ministère", "sélectionner le Ministère", "définir la date et l’heure"]
          },
          {
            label: "Planifier une réunion pour une structure",
            description: "Cette option permet de cibler les utilisateurs appartenant à une structure précise.",
            path: ["Réunions", "Planifier une Réunion", "Structure", "sélectionner la Structure", "définir la date et l’heure"]
          },
          {
            label: "Planifier une réunion pour une cohorte",
            description: "Cette option permet de programmer une réunion destinée aux membres d’une cohorte donnée.",
            path: ["Réunions", "Planifier une Réunion", "Cohorte", "sélectionner la Cohorte", "définir la date et l’heure"]
          },
          { label: "Rejoindre une réunion", path: ["Réunions", "sélectionner la réunion", "Rejoindre"] },
          { label: "Copier le lien d’une réunion", path: ["Réunions", "Copier le lien"] },
          { label: "Supprimer une réunion", path: ["Réunions", "icône Corbeille sur la réunion concernée"] },
        ]
      },
      {
        title: "Ministères",
        steps: [
          { label: "Consulter les ministères", path: ["Ministères"] },
          { label: "Rechercher un ministère", path: ["Ministères", "rechercher par nom ou code"] },
          {
            label: "Créer un ministère",
            description: "Ajoutez un nouveau ministère à l’organisation institutionnelle utilisée dans Energy Manager.",
            path: ["Ministères", "Nouveau Ministère"]
          },
          { label: "Modifier un ministère", path: ["Ministères", "sélectionner Éditer"] },
          {
            label: "Désactiver un ministère",
            description: "La désactivation permet de rendre un ministère inactif sans supprimer définitivement ses informations.",
            path: ["Ministères", "Désactiver"]
          },
          { label: "Réactiver un ministère", path: ["Ministères", "Activer"] },
        ]
      },
      {
        title: "Structures",
        steps: [
          { label: "Consulter les structures", path: ["Structures"] },
          { label: "Rechercher une structure", path: ["Structures", "rechercher par nom, région ou ministère"] },
          {
            label: "Créer une structure",
            description: "Ajoutez une nouvelle structure et rattachez-la aux informations institutionnelles demandées.",
            path: ["Structures", "Nouvelle Structure"]
          },
          { label: "Modifier une structure", path: ["Structures", "Options (…)", "modifier les informations"] },
          {
            label: "Supprimer une structure",
            description: "Cette action supprime définitivement la structure sélectionnée. Vérifiez les informations avant de confirmer.",
            path: ["Structures", "icône Corbeille", "confirmer la suppression"]
          },
        ]
      },
      {
        title: "Cohortes",
        steps: [
          { label: "Consulter les cohortes", path: ["Cohortes"] },
          { label: "Rechercher une cohorte", path: ["Cohortes", "rechercher par nom ou code"] },
          {
            label: "Créer une cohorte",
            description: "Ajoutez une nouvelle cohorte qui pourra ensuite être utilisée pour organiser les Gestionnaires, les groupes et les réunions.",
            path: ["Cohortes", "Nouvelle Cohorte"]
          },
          { label: "Modifier une cohorte", path: ["Cohortes", "Éditer"] },
          {
            label: "Désactiver une cohorte",
            description: "La désactivation conserve la cohorte dans le système tout en la rendant inactive.",
            path: ["Cohortes", "Désactiver"]
          },
          { label: "Réactiver une cohorte", path: ["Cohortes", "Activer"] },
        ]
      },
      {
        title: "Carte",
        steps: [
          { label: "Consulter la carte énergétique", path: ["Carte"] }
        ]
      },
      {
        title: "Profil",
        steps: [
          { label: "Consulter mon profil", path: ["Mon Profil"] },
          { label: "Modifier mes informations de profil", path: ["Mon Profil", "modifier les informations", "Enregistrer"] }
        ]
      }
    ]
  }
};
