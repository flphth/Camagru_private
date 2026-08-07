// ------------------------------------------------------------------
// Camagru — lightweight EN/FR internationalisation
// ------------------------------------------------------------------

const translations = {
    en: {
        // Sidebar navigation
        'nav.gallery': 'Gallery',
        'nav.create': 'Create',
        'nav.profile': 'Profile',
        'nav.logout': 'Logout',
        'nav.register': 'Register',
        'nav.login': 'Login',
        // Footer
        'footer.about': 'About',
        'footer.source': 'Source code',
        // Login
        'login.heroTitle': 'Share your moments.',
        'login.heroText': 'Capture a picture, decorate it with fun overlays and post it to the gallery.',
        'login.title': 'Login',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.submit': 'Log in',
        'login.forgot': 'Forgot password?',
        'login.createAccount': 'Create new account',
        'login.browse': 'See photos already shared',
        // Register
        'register.title': 'Get started',
        'register.subtitle': 'Sign up to share and discover pictures.',
        'register.email': 'Email',
        'register.username': 'Username',
        'register.password': 'Password',
        'register.confirm': 'Confirm password',
        'register.submit': 'Sign up',
        'register.checkEmailTitle': 'Check your email',
        'register.goToLogin': 'Go to login',
        'register.mismatch': 'Passwords do not match.',
        'register.strength': 'Password strength: ',
        'strength.weak': 'Weak',
        'strength.medium': 'Medium',
        'strength.strong': 'Strong',
        // Forgot
        'forgot.title': 'Find your account',
        'forgot.subtitle': "Enter your email and we'll send you a reset link.",
        'forgot.email': 'Email',
        'forgot.submit': 'Continue',
        // Reset
        'reset.title': 'Choose a new password',
        'reset.subtitle': "Pick a strong password you don't use elsewhere.",
        'reset.password': 'New password',
        'reset.submit': 'Reset password',
        // Activate
        'activate.title': 'Account activation',
        'activate.loading': 'Activating your account…',
        'activate.goToLogin': 'Go to login',
        // Profile
        'profile.title': 'Edit profile',
        'profile.sub': 'Manage your account details',
        'profile.username': 'Username',
        'profile.email': 'Email',
        'profile.notify': 'Email me when someone comments on my images',
        'profile.changePassword': 'Change password',
        'profile.currentPassword': 'Current password',
        'profile.newPassword': 'New password',
        'profile.confirmNewPassword': 'Confirm new password',
        'profile.save': 'Save changes',
        'profile.mismatch': 'New passwords do not match.',
        // About
        'about.title': 'About Camagru',
        'about.p1': 'Camagru is a small web application built as part of the 42 school curriculum.',
        'about.p2': 'It lets you take a picture with your webcam (or upload one), decorate it with predefined overlays, and share the result in a public gallery where anyone can like and comment on the creations.',
        'about.p3': 'The project is an exercise in full-stack web development: server-side image processing, user authentication, form validation and application security.',
        // Editing
        'edit.deselect': 'Deselect',
        'edit.capture': 'Capture',
        'edit.upload': 'Upload an image',
        'edit.uploadHint': 'No webcam? Upload a picture instead.',
        'edit.mainTitle': 'Create your picture',
        'edit.mainHint': 'Pick a sticker, then capture from your webcam or upload an image.',
        'edit.historyTitle': 'Your latest pictures',
        'edit.badType': 'Only PNG or JPEG images are allowed.',
        'edit.tooLarge': 'Image is too large (max 5 MB).',
        'edit.needLogin': 'You must be logged in to access the editing page.',
        'edit.uploadError': 'Image upload error. Please try again.',
        'edit.selectSticker': 'Please select a sticker first.',
        'edit.webcamNotReady': 'Webcam is not ready yet. Please allow camera access and try again.',
        // Feed
        'feed.emptyTitle': 'Empty',
        'feed.empty': 'The gallery is empty for now.',
        'feed.like': 'Like',
        'feed.unlike': 'Dislike',
        'feed.likes': ' like',
        'feed.addComment': 'Add a comment…',
        'feed.justNow': 'Just now',
        'feed.commentFailed': 'Failed to submit comment.',
        'feed.prev': 'Previous',
        'feed.next': 'Next',
        'feed.page': 'Page',
        'feed.share': 'Share',
        'feed.shareText': 'Check out this Camagru creation!',
        'feed.copyLink': 'Copy link',
        'feed.copied': 'Copied!',
        'feed.postNotFound': 'This post no longer exists.',
        // Common / modal
        'common.delete': 'Delete',
        'common.cancel': 'Cancel',
        'common.ok': 'OK',
        'common.deleteImage': 'Delete this image?',
        'notfound.title': 'Page not found',
        'notfound.text': "The page you're looking for doesn't exist.",
        'notfound.home': 'Back to gallery'
    },
    fr: {
        'nav.gallery': 'Galerie',
        'nav.create': 'Créer',
        'nav.profile': 'Profil',
        'nav.logout': 'Déconnexion',
        'nav.register': 'Inscription',
        'nav.login': 'Connexion',
        'footer.about': 'À propos',
        'footer.source': 'Code source',
        'login.heroTitle': 'Partagez vos moments.',
        'login.heroText': 'Prenez une photo, décorez-la avec des filtres amusants et publiez-la dans la galerie.',
        'login.title': 'Connexion',
        'login.username': "Nom d'utilisateur",
        'login.password': 'Mot de passe',
        'login.submit': 'Se connecter',
        'login.forgot': 'Mot de passe oublié ?',
        'login.createAccount': 'Créer un compte',
        'login.browse': 'Voir les photos déjà partagées',
        'register.title': 'Commencer',
        'register.subtitle': 'Inscrivez-vous pour partager et découvrir des photos.',
        'register.email': 'E-mail',
        'register.username': "Nom d'utilisateur",
        'register.password': 'Mot de passe',
        'register.confirm': 'Confirmer le mot de passe',
        'register.submit': "S'inscrire",
        'register.checkEmailTitle': 'Vérifiez vos e-mails',
        'register.goToLogin': 'Aller à la connexion',
        'register.mismatch': 'Les mots de passe ne correspondent pas.',
        'register.strength': 'Robustesse du mot de passe : ',
        'strength.weak': 'Faible',
        'strength.medium': 'Moyen',
        'strength.strong': 'Fort',
        'forgot.title': 'Retrouver votre compte',
        'forgot.subtitle': "Saisissez votre e-mail, nous vous enverrons un lien de réinitialisation.",
        'forgot.email': 'E-mail',
        'forgot.submit': 'Continuer',
        'reset.title': 'Choisir un nouveau mot de passe',
        'reset.subtitle': "Choisissez un mot de passe robuste que vous n'utilisez pas ailleurs.",
        'reset.password': 'Nouveau mot de passe',
        'reset.submit': 'Réinitialiser le mot de passe',
        'activate.title': 'Activation du compte',
        'activate.loading': 'Activation de votre compte…',
        'activate.goToLogin': 'Aller à la connexion',
        'profile.title': 'Modifier le profil',
        'profile.sub': 'Gérez les informations de votre compte',
        'profile.username': "Nom d'utilisateur",
        'profile.email': 'E-mail',
        'profile.notify': "M'envoyer un e-mail quand quelqu'un commente mes images",
        'profile.changePassword': 'Changer le mot de passe',
        'profile.currentPassword': 'Mot de passe actuel',
        'profile.newPassword': 'Nouveau mot de passe',
        'profile.confirmNewPassword': 'Confirmer le nouveau mot de passe',
        'profile.save': 'Enregistrer',
        'profile.mismatch': 'Les nouveaux mots de passe ne correspondent pas.',
        'about.title': 'À propos de Camagru',
        'about.p1': "Camagru est une petite application web réalisée dans le cadre du cursus de l'école 42.",
        'about.p2': "Elle permet de prendre une photo avec sa webcam (ou d'en importer une), de la décorer avec des filtres prédéfinis, et de partager le résultat dans une galerie publique où chacun peut liker et commenter les créations.",
        'about.p3': "Le projet est un exercice de développement web full-stack : traitement d'image côté serveur, authentification, validation des formulaires et sécurité applicative.",
        'edit.deselect': 'Désélectionner',
        'edit.capture': 'Capturer',
        'edit.upload': 'Importer une image',
        'edit.uploadHint': "Pas de webcam ? Importez une photo à la place.",
        'edit.mainTitle': 'Créez votre photo',
        'edit.mainHint': "Choisissez un filtre, puis capturez depuis la webcam ou importez une image.",
        'edit.historyTitle': 'Vos dernières photos',
        'edit.badType': 'Seules les images PNG ou JPEG sont autorisées.',
        'edit.tooLarge': "L'image est trop volumineuse (max 5 Mo).",
        'edit.needLogin': "Vous devez être connecté pour accéder à la page d'édition.",
        'edit.uploadError': "Erreur lors de l'envoi de l'image. Veuillez réessayer.",
        'edit.selectSticker': "Veuillez d'abord sélectionner un filtre.",
        'edit.webcamNotReady': "La webcam n'est pas prête. Autorisez l'accès à la caméra puis réessayez.",
        'feed.emptyTitle': 'Vide',
        'feed.empty': 'La galerie est vide pour le moment.',
        'feed.like': 'Like',
        'feed.unlike': 'Dislike',
        'feed.likes': ' like',
        'feed.addComment': 'Ajouter un commentaire…',
        'feed.justNow': "À l'instant",
        'feed.commentFailed': "Échec de l'envoi du commentaire.",
        'feed.prev': 'Précédent',
        'feed.next': 'Suivant',
        'feed.page': 'Page',
        'feed.share': 'Partager',
        'feed.shareText': 'Regarde cette création Camagru !',
        'feed.copyLink': 'Copier le lien',
        'feed.copied': 'Copié !',
        'feed.postNotFound': "Ce post n'existe plus.",
        'common.delete': 'Supprimer',
        'common.cancel': 'Annuler',
        'common.ok': 'OK',
        'common.deleteImage': 'Supprimer cette image ?',
        'notfound.title': 'Page introuvable',
        'notfound.text': "La page que vous cherchez n'existe pas.",
        'notfound.home': 'Retour à la galerie'
    }
};

// Server (PHP) messages are returned in English; map the known ones to French.
const serverMessages = {
    fr: {
        'Missing required fields.': 'Champs obligatoires manquants.',
        'Invalid email address.': 'Adresse e-mail invalide.',
        'Username must be 3 to 50 characters (letters, digits, underscore).': "Le nom d'utilisateur doit faire 3 à 50 caractères (lettres, chiffres, underscore).",
        'Password must be at least 8 characters and include upper and lower case letters and a digit.': 'Le mot de passe doit faire au moins 8 caractères et contenir majuscules, minuscules et un chiffre.',
        'Email is already in use.': 'Cet e-mail est déjà utilisé.',
        'Failed to register user.': "Échec de l'inscription.",
        'Registration successful. Please check your email to activate your account.': 'Inscription réussie. Vérifiez vos e-mails pour activer votre compte.',
        'Invalid username or password.': "Nom d'utilisateur ou mot de passe invalide.",
        'Account is not activated. Please check your email to activate your account.': "Le compte n'est pas activé. Vérifiez vos e-mails pour l'activer.",
        'Login successful.': 'Connexion réussie.',
        'Invalid activation link.': "Lien d'activation invalide.",
        'Account already activated. You can log in.': 'Compte déjà activé. Vous pouvez vous connecter.',
        'Account activated. You can now log in.': 'Compte activé. Vous pouvez maintenant vous connecter.',
        'If an account exists for this email, a reset link has been sent.': 'Si un compte existe pour cet e-mail, un lien de réinitialisation a été envoyé.',
        'Invalid reset link.': 'Lien de réinitialisation invalide.',
        'Reset link is invalid or has expired.': 'Le lien de réinitialisation est invalide ou a expiré.',
        'Password updated. You can now log in.': 'Mot de passe mis à jour. Vous pouvez maintenant vous connecter.',
        'You must be logged in.': 'Vous devez être connecté.',
        'You must be logged.': 'Vous devez être connecté.',
        'Invalid username.': "Nom d'utilisateur invalide.",
        'Nothing to update.': 'Rien à mettre à jour.',
        'Profile updated.': 'Profil mis à jour.',
        'Failed to update profile.': 'Échec de la mise à jour du profil.',
        'Your current password is required to set a new one.': 'Votre mot de passe actuel est requis pour en définir un nouveau.',
        'Your current password is incorrect.': 'Votre mot de passe actuel est incorrect.',
        'Invalid image data.': "Données d'image invalides.",
        'Image is too large.': "L'image est trop volumineuse.",
        'Only PNG images are allowed.': 'Seules les images PNG sont autorisées.',
        'Failed to save image.': "Échec de l'enregistrement de l'image.",
        'Failed to upload image.': "Échec de l'envoi de l'image.",
        'Unknow error.': 'Erreur inconnue.',
        'Invalid image.': 'Image invalide.',
        'Image not found.': 'Image introuvable.',
        'Image deleted.': 'Image supprimée.',
        'Invalid comment.': 'Commentaire invalide.',
        'Failed to send content.': "Échec de l'envoi du commentaire.",
        'You have already liked this image.': 'Vous avez déjà aimé cette image.',
        'Failed to like image.': "Échec du like.",
        'Image liked successfully.': 'Image aimée.',
        'Like removed successfully.': 'Like retiré.',
        'Failed to remove like.': 'Échec du retrait du like.'
    }
};

function getLang() {
    return localStorage.getItem('lang') || 'en';
}

function setLang(lang) {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    applyI18n(document);
    if (typeof renderNav === 'function') renderNav();

    // Reload the current page so JS-generated content is re-rendered in the new language
    const page = window.location.pathname.split('/')[1] || 'home';
    if (typeof loadContent === 'function') loadContent(page);
}

function t(key) {
    const lang = getLang();
    return (translations[lang] && translations[lang][key]) ||
           translations.en[key] || key;
}

// Translate a message coming from the server (English) to the current language
function translateServerMessage(message) {
    if (!message) return message;
    const lang = getLang();
    if (lang === 'en') return message;
    return (serverMessages[lang] && serverMessages[lang][message]) || message;
}

// Apply translations to every [data-i18n] / [data-i18n-ph] element under root
function applyI18n(root) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    root.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
}

// Wire the language selector and apply the stored language to static markup
function initI18n() {
    document.documentElement.lang = getLang();
    const sel = document.getElementById('lang-select');
    if (sel) {
        sel.value = getLang();
        sel.addEventListener('change', () => setLang(sel.value));
    }
    applyI18n(document);
}
