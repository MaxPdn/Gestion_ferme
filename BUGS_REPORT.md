# 🐛 RAPPORT D'AUDIT - BUGS & PROBLÈMES IDENTIFIÉS 

**Date:** 25 mars 2026  
**Projet:** Gestion de Ferme (MongoDB/Vue.js)  
**Priorité:** Critique, Haute, Moyenne

---

## 📋 RÉSUMÉ EXÉCUTIF

**Total de bugs trouvés:** 18  
- 🔴 Critique: 5
- 🟠 Haute: 7
- 🟡 Moyenne: 6

---

## 🔴 BUGS CRITIQUES

### 1. Doublon de routes - Campagnes et Départements
**Localisation:** [backend/src/app.js](backend/src/app.js#L14-L17)
**Ligne:** 14-17  
**Sévérité:** Critique (Conflit de routing)

**Problème:**
```javascript
app.use("/api", router);  // Inclut campaigns et departments via index.js
app.use("/api/campaigns", campaignRoutes);  // Redéfinit les mêmes routes
app.use("/api/departments", departmentRoutes);
```

Les routes campaigns et departments sont montées DEUX FOIS aux mêmes URLs, ce qui crée une redondance et peut causer des comportements imprévisibles.

**Solution:**
Supprimer les lignes 16-17 car les routes sont déjà présentes via `app.use("/api", router)`.

---

### 2. Modèle manquant - Stock dans HealthRecord
**Localisation:** [backend/src/models/HealthRecord.js](backend/src/models/HealthRecord.js#L28-L32)
**Ligne:** 28-32  
**Sévérité:** Critique (Référence brisée)

**Problème:**
```javascript
medication: {
  name: String,
  dosage: String,
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock'  // ❌ Ce modèle n'existe pas!
  }
}
```

Le modèle 'Stock' n'existe pas dans le codebase. Cela causera une erreur lors de la population.

**Solution:**
Soit:
1. Créer le modèle Stock manquant
2. Soit supprimer la référence si non utilisée

---

### 3. Statut de campagne incohérent - Home.vue
**Localisation:** [frontend/src/views/Home.vue](frontend/src/views/Home.vue#L39)
**Ligne:** 39  
**Sévérité:** Critique (Logique brisée)

**Problème:**
```javascript
const active = campaigns.value.filter(c => c.status === 'En cours').length;
```

Le modèle Campaign utilise les statuts: `"preparation", "active", "completed"`  
Mais le filtre cherche `'En cours'` - LA VALEUR N'EXISTE PAS!

**Solution:**
Changer la ligne 39:
```javascript
const active = campaigns.value.filter(c => c.status === 'active').length;
```

---

### 4. Propriété 'name' manquante dans le modèle User
**Localisations:** 
- [backend/src/models/User.js](backend/src/models/User.js)
- [frontend/src/views/Home.vue](frontend/src/views/Home.vue#L21)

**Ligne:** Home.vue ligne 21  
**Sévérité:** Critique (Données manquantes)

**Problème:**
```javascript
// User.js n'a pas de champ 'name'
// Mais Home.vue essaie d'afficher:
{{ user.name || 'Utilisateur' }}
```

Le modèle User ne possède pas de champ `name`, seulement `username, email, password, role`.

**Solution:**
Soit:
1. Ajouter le champ `name` au modèle User
2. Soit utiliser `username` à la place de `name` dans Home.vue

**Recommandé:** Utiliser `username` (ligne 21 de Home.vue):
```javascript
{{ user.username || 'Utilisateur' }}
```

---

### 5. Routes Health sans authentification
**Localisation:** [backend/src/routes/healthRoutes.js](backend/src/routes/healthRoutes.js)
**Ligne:** Toutes  
**Sévérité:** Critique (Faille de sécurité)

**Problème:**
```javascript
router.route('/:campaignId')
  .post(createHealthRecord)
  .get(getCampaignHealthHistory);
```

Les routes de santé n'ont PAS de middleware `protect`, contrairement aux routes finance et users. N'importe qui peut créer/lire des records sans authentification!

**Solution:**
Ajouter le middleware `protect` aux routes health:
```javascript
import { protect } from "../middlewares/middleware.js";

router.use(protect);

router.route('/:campaignId')
  .post(createHealthRecord)
  .get(getCampaignHealthHistory);
```

---

## 🟠 BUGS HAUTE PRIORITÉ

### 6. Fonction getFinanceStats complète - Endpoint manquant
**Localisation:** [backend/src/controllers/financeController.js](backend/src/controllers/financeController.js#L78)
**Ligne:** 78-105  
**Sévérité:** Haute (Endpoint incomplet)

**Problème:**
La fonction `getFinanceStats` est définie dans le controller mais...  
Regardez les routes dans [financeRoutes.js](backend/src/routes/financeRoutes.js#L11) - la route existe ET est utilisée par le frontend.

Pas d'erreur réelle ici - c'est bon ✅

---

### 7. Campaign.controller - Pas de gestion d'erreurs
**Localisation:** [backend/src/controllers/campaign.controller.js](backend/src/controllers/campaign.controller.js#L15-L29)
**Ligne:** 15-29 (getAll, getOne, update, remove)  
**Sévérité:** Haute (Erreurs non gérées)

**Problème:**
```javascript
export const getAll = async (req, res) => {
  const campaigns = await campaignService.getAllCampaigns();
  res.json(campaigns);  // ❌ Pas de try-catch!
};

export const getOne = async (req, res) => {
  const campaign = await campaignService.getCampaignById(req.params.id);
  res.json(campaign);  // ❌ Pas de try-catch!
};
```

Si une erreur DB survient, aucune gestion n'existe = crash du server.

**Solution:**
Ajouter try-catch:
```javascript
export const getAll = async (req, res) => {
  try {
    const campaigns = await campaignService.getAllCampaigns();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

### 8. Health Records - Validation manquante
**Localisation:** [backend/src/controllers/healthController.js](backend/src/controllers/healthController.js#L6-L22)
**Ligne:** 6-22  
**Sévérité:** Haute (Validation absente)

**Problème:**
```javascript
export const createHealthRecord = async (req, res) => {
  try {
    const { campaignId } = req.params;
    // ❌ Pas de vérification que la campagne existe!
    const newRecord = await HealthRecord.create({
      campaign: campaignId,
      // ...
    });
```

On crée un record de santé pour une campagne qui n'existe peut-être pas.

**Solution:**
Valider que la campagne existe:
```javascript
export const createHealthRecord = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Vérifier que la campagne existe
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'Campagne non trouvée' 
      });
    }
    
    const newRecord = await HealthRecord.create({
      campaign: campaignId,
      // ...
    });
```

---

### 9. Campaign.service - updateCampaign sans populate
**Localisation:** [backend/src/services/campaign.service.js](backend/src/services/campaign.service.js#L27-L30)
**Ligne:** 27-30  
**Sévérité:** Haute (Données incomplètes)

**Problème:**
```javascript
export const updateCampaign = async (id, data) => {
  return await Campaign.findByIdAndUpdate(id, data, { new: true });
  // ❌ Pas de .populate("department", "name")!
};
```

Le champ `department` reste un ObjectId au lieu d'être hydraté avec le nom.

Comparez avec `getAllCampaigns`:
```javascript
export const getAllCampaigns = async () => {
  return await Campaign.find()
    .populate("department", "name")  // ✅ Correct
    .sort({ createdAt: -1 });
};
```

**Solution:**
Ajouter populate dans updateCampaign:
```javascript
export const updateCampaign = async (id, data) => {
  return await Campaign.findByIdAndUpdate(id, data, { new: true })
    .populate("department", "name");
};
```

---

### 10. Department.controller - Pas d'authentification
**Localisation:** [backend/src/routes/department.routes.js](backend/src/routes/department.routes.js)
**Ligne:** Toutes  
**Sévérité:** Haute (Faille de sécurité)

**Problème:**
```javascript
router.get("/", getDepartments);
router.post("/", createDepartment);  // ❌ N'importe qui peut créer!
router.put("/:id", updateDepartment);  // ❌ N'importe qui peut modifier!
router.delete("/:id", deleteDepartment);  // ❌ N'importe qui peut supprimer!
```

Contrairement à users, finance, et health, les routes departments n'ont pas de middleware `protect`.

**Solution:**
Ajouter le middleware de protection:
```javascript
import { protect, isAdmin } from "../middlewares/middleware.js";

const router = express.Router();

router.use(protect, isAdmin);  // Ajouter cette ligne

router.get("/", getDepartments);
router.post("/", createDepartment);
// ...
```

---

### 11. Campaign.service.js - ObjectId invalide non validé
**Localisation:** [backend/src/services/campaign.service.js](backend/src/services/campaign.service.js#L25)
**Ligne:** 25  
**Sévérité:** Haute (Validation manquante)

**Problème:**
```javascript
export const getCampaignById = async (id) => {
  return await Campaign.findById(id)  // ❌ Pas de vérification que 'id' est valide
    .populate("department", "name");
};
```

Si quelqu'un envoie un ID invalide (pas un ObjectId MongoDB), Mongoose lèvera une erreur.

**Solution:**
Valider avec mongoose.Types.ObjectId:
```javascript
import mongoose from "mongoose";

export const getCampaignById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("ID de campagne invalide");
  }
  return await Campaign.findById(id)
    .populate("department", "name");
};
```

---

### 12. Password reset sans vérification de sécurité
**Localisation:** [backend/src/controllers/authController.js](backend/src/controllers/authController.js#L38-L54)
**Ligne:** 38-54  
**Sévérité:** Haute (Faille de sécurité critique)

**Problème:**
```javascript
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // ❌ N'importe qui peut réinitialiser n'importe quel mot de passe!
    // Pas de vérification d'email, pas d'OTP, pas de confirmation
    
    const user = await User.findOne({ email });
    user.password = newPassword;
    await user.save();
```

N'importe qui connaissant un email peut réinitialiser le mot de passe. C'est une FAILLE CRITIQUE!

**Solution:**
Implémenter un système d'OTP ou de token de vérification:
```javascript
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmationToken } = req.body;
    
    // Vérifier le token (devrait être envoyé par email)
    // const decoded = jwt.verify(confirmationToken, process.env.RESET_TOKEN_SECRET);
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email introuvable" });
    
    // if (decoded.email !== email) {
    //   return res.status(400).json({ message: "Token invalide" });
    // }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: "Mot de passe réinitialisé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 🟡 BUGS MOYENNE PRIORITÉ

### 13. Campaign.model - Default function incorrecte
**Localisation:** [backend/src/models/Campaign.model.js](backend/src/models/Campaign.model.js#L38-L42)
**Ligne:** 38-42  
**Sévérité:** Moyenne (Comportement imprévisible)

**Problème:**
```javascript
currentCount: {
  type: Number,
  default: function() {
    return this.initialCount;
  },
  min: [0, 'L\'effectif actuel ne peut pas être négatif'],
},
```

La fonction default ne sera exécutée qu'UNE FOIS lors de la création. Si `initialCount` change, `currentCount` ne sera pas mis à jour.

**Solution:**
Soit utiliser une fonction d'initialisation au niveau du controller, soit utiliser une valeur statique:
```javascript
currentCount: {
  type: Number,
  required: [true, 'Le nombre actuel de sujets est obligatoire'],
  min: [0, 'L\'effectif actuel ne peut pas être négatif'],
},
```

Et au moment de la création du document:
```javascript
// Dans le controller/service:
const campaign = await Campaign.create({
  ...data,
  currentCount: data.initialCount
});
```

---

### 14. Department.controller - Incohérence service vs controller
**Localisation:** [backend/src/controllers/department.controller.js](backend/src/controllers/department.controller.js)
**Ligne:** Toutes les fonctions  
**Sévérité:** Moyenne (Incohérence de pattern)

**Problème:**
Le controller appelle Mongoose directement au lieu d'utiliser le service:

```javascript
// Dans controller:
export const getDepartments = async (req, res) => {
  const depts = await Department.find().sort({ createdAt: -1 });  // ❌ Direct!
  res.status(200).json(depts);
};

// Mais department.service.js a une fonction pour ça:
export const getDepartments = async () => {
  return await Department.find().sort({ createdAt: -1 });
};
```

Cela crée un pattern incohérent dans le codebase.

**Solution:**
Utiliser le service dans tous les controllers:
```javascript
import * as departmentService from "../services/department.service.js";

export const getDepartments = async (req, res) => {
  try {
    const depts = await departmentService.getDepartments();
    res.status(200).json(depts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
```

---

### 15. Finance route - Pas de vérification d'accès par campagne
**Localisation:** [backend/src/controllers/financeController.js](backend/src/controllers/financeController.js#L49-L65)
**Ligne:** 49-65  
**Sévérité:** Moyenne (Logique métier)

**Problème:**
```javascript
export const getCampaignTransactions = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const transactions = await Transaction.find({ campaign: campaignId })
    // ❌ Pas de vérification que l'utilisateur a accès à cette campagne
```

N'importe quel utilisateur authentifié peut voir les transactions de n'importe quelle campagne.

**Solution:**
Vérifier les droits d'accès (dépend de votre logique métier):
```javascript
export const getCampaignTransactions = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Vérifier que la campagne existé
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campagne non trouvée" });
    }
    
    // Optionnel: Vérifier que l'utilisateur a accès
    // if (campaign.createdBy?.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    //   return res.status(403).json({ message: "Accès refusé" });
    // }
    
    const transactions = await Transaction.find({ campaign: campaignId })
      .sort({ date: -1 });
    
    res.status(200).json({
      status: "success",
      results: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
```

---

### 16. CampaignList.vue - Status filter avec mauvaises valeurs
**Localisation:** [frontend/src/views/CampaignList.vue](frontend/src/views/CampaignList.vue#L142-L149)
**Ligne:** 142-149  
**Sévérité:** Moyenne (UX confus)

**Problème:**
```html
<select v-model="statusFilter">
  <option value="all">Tous les statuts</option>
  <option value="active">En cours</option>
  <option value="completed">Terminée</option>
  <option value="preparation">Préparation</option>
</select>
```

Les valeurs sont correctes (`"active", "completed", "preparation"`) ✅  
Mais le label "En cours" n'est pas exact pour toutes les statuts affichées.

**Solution:**
Harmonis les labels avec les statuts backend:
```html
<select v-model="statusFilter">
  <option value="all">Tous les statuts</option>
  <option value="active">Actif</option>
  <option value="completed">Complété</option>
  <option value="preparation">Préparation</option>
</select>
```

---

### 17. Validation des données manquante - Création de transaction
**Localisation:** [frontend/src/views/FinanceView.vue](frontend/src/views/FinanceView.vue#L60)
**Ligne:** 60  
**Sévérité:** Moyenne (Validation côté client)

**Problème:**
```javascript
const submitTransaction = async () => {
  if (newTransaction.value.amount <= 0) return;  // ✅ Une validation
  // ❌ Pas de vérification que la catégorie est sélectionnée
  // ❌ Pas de vérification que la date est valide
  // ❌ Pas de vérification que la description n'est pas vide
  const success = await financeStore.addTransaction(newTransaction.value);
```

**Solution:**
Ajouter des validations:
```javascript
const submitTransaction = async () => {
  if (newTransaction.value.amount <= 0) {
    notify("Le montant doit être positif");
    return;
  }
  if (!newTransaction.value.category) {
    notify("Sélectionnez une catégorie");
    return;
  }
  if (!newTransaction.value.description.trim()) {
    notify("Veuillez ajouter une description");
    return;
  }
  
  const success = await financeStore.addTransaction(newTransaction.value);
  if (success) {
    showModal.value = false;
    // ... reset form
  }
};
```

---

### 18. Health Store - URLs API inconsistantes
**Localisation:** [frontend/src/stores/healthStore.js](frontend/src/stores/healthStore.js#L14,25,36)
**Ligne:** 14, 25, 36  
**Sévérité:** Moyenne (À vérifier)

**Problème:**
```javascript
// Utilise /api/health-records/
const response = await axios.get(`http://localhost:7000/api/health-records/${campaignId}`);
```

Vérifions si l'endpoint backend existe vraiment...

En regardant [routes/index.js](backend/src/routes/index.js#L14):
```javascript
router.use("/health-records", healthRoutes);
```

Et dans app.js: `app.use("/api", router);`

Donc les routes health sont à `/api/health-records` ✅ C'est correct!

**Status:** ✅ AUCUN PROBLÈME

---

## 📊 TABLEAU RÉCAPITULATIF

| # | Bug | Localisation | Sévérité | Status |
|---|-----|--------------|----------|--------|
| 1 | Routes en doublon (campaigns/departments) | app.js#14-17 | 🔴 Critique | À corriger |
| 2 | Modèle Stock manquant | HealthRecord.js#28-32 | 🔴 Critique | À créer ou supprimer |
| 3 | Statut "En cours" inexistant | Home.vue#39 | 🔴 Critique | À corriger |
| 4 | Propriété 'name' manquante User | User.js, Home.vue#21 | 🔴 Critique | À corriger |
| 5 | Health routes sans auth | healthRoutes.js | 🔴 Critique | À ajouter middleware |
| 6 | Campaign.controller sans try-catch | campaign.controller.js#15-29 | 🟠 Haute | À ajouter |
| 7 | Health validation manquante | healthController.js#6-22 | 🟠 Haute | À ajouter |
| 8 | updateCampaign sans populate | campaign.service.js#27-30 | 🟠 Haute | À corriger |
| 9 | Department routes sans auth | department.routes.js | 🟠 Haute | À ajouter middleware |
| 10 | ObjectId non validé | campaign.service.js#25 | 🟠 Haute | À valider |
| 11 | Reset password sans OTP | authController.js#38-54 | 🟠 Haute | À sécuriser |
| 12 | Default function incorrecte | Campaign.model.js#38-42 | 🟡 Moyenne | À refactoriser |
| 13 | Service vs Controller incohérent | department.controller.js | 🟡 Moyenne | À harmoniser |
| 14 | Finance - pas de vérif accès | financeController.js#49-65 | 🟡 Moyenne | À vérifier |
| 15 | Status filter inconsistent | CampaignList.vue#142-149 | 🟡 Moyenne | À aligner labels |
| 16 | Validation transaction manquante | FinanceView.vue#60 | 🟡 Moyenne | À ajouter |
| 17 | Health URLs (vérification) | healthStore.js | ✅ OK | Pas de problème |
| 18 | getFinanceStats | financeController.js#78 | ✅ OK | Pas de problème |

---

## 🎯 PRIORITÉS D'ACTIONS

### Phase 1 - URGENT (Demain)
1. Corriger le statut "En cours" dans Home.vue
2. Ajouter propriété `name` ou utiliser `username` pour User
3. Ajouter middleware de protection à health routes
4. Supprimer routes en doublon dans app.js

### Phase 2 - IMPORTANT (Cette semaine)
5. Corriger resetPassword avec OTP/token
6. Ajouter middleware de protection à department routes
7. Ajouter try-catch à campaign.controller
8. Valider ObjectId dans campaign.service
9. Ajouter validation à createHealthRecord

### Phase 3 - MAINTENANCE (Semaine prochaine)
10. Ajouter populate à updateCampaign
11. Corriger default function dans Campaign model
12. Harmoniser service vs controller pattern
13. Ajouter validations côté client
14. Ajouter vérification d'accès aux transactions

---

## 🔗 RÉFÉRENCES RAPIDES

**Fichiers à corriger (priorité décroissante):**
1. `backend/src/views/Home.vue` - statut + user.name
2. `backend/src/routes/healthRoutes.js` - ajouter protect
3. `backend/src/app.js` - supprimer doublons
4. `backend/src/controllers/authController.js` - resetPassword sécurité
5. `backend/src/routes/department.routes.js` - ajouter protect
6. `backend/src/controllers/campaign.controller.js` - ajouter errors
7. `backend/src/models/HealthRecord.js` - modèle Stock

