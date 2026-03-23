<script setup>
import { ref, onMounted } from "vue";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/departmentService.js";

// ⚡ États
const departments = ref([]);
const loading = ref(false);
const error = ref("");

// 📥 Fetch départements
const fetchDepartments = async () => {
  loading.value = true;
  try {
    const res = await getDepartments();
    departments.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "Erreur lors du chargement des départements";
  } finally {
    loading.value = false;
  }
};

// 🔥 Création
const newDeptName = ref("");
const creating = ref(false);

const handleCreate = async () => {
  if (!newDeptName.value.trim()) return;
  creating.value = true;
  try {
    await createDepartment({ name: newDeptName.value.trim() });
    newDeptName.value = "";
    await fetchDepartments();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur création département");
  } finally {
    creating.value = false;
  }
};

// ✏️ Édition inline
const editingId = ref(null);
const editedName = ref("");

const startEdit = (dept) => {
  editingId.value = dept._id;
  editedName.value = dept.name;
};

const cancelEdit = () => {
  editingId.value = null;
  editedName.value = "";
};

const saveEdit = async (id) => {
  if (!editedName.value.trim()) return;
  try {
    await updateDepartment(id, { name: editedName.value.trim() });
    cancelEdit();
    await fetchDepartments();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur mise à jour");
  }
};

// ❌ Suppression
const handleDelete = async (id) => {
  if (!confirm("Confirmer la suppression ?")) return;
  try {
    await deleteDepartment(id);
    await fetchDepartments();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur suppression");
  }
};

// 📦 Mounted
onMounted(fetchDepartments);
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Départements</h1>

    <!-- ERREUR -->
    <div v-if="error" class="bg-red-100 text-red-600 p-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- CREATION -->
    <div class="flex gap-2 mb-6">
      <input
        v-model="newDeptName"
        type="text"
        placeholder="Nom nouveau département"
        class="border p-2 rounded flex-1"
      />
      <button
        @click="handleCreate"
        :disabled="creating"
        class="bg-green-600 text-white px-4 rounded disabled:opacity-50"
      >
        {{ creating ? "..." : "Créer" }}
      </button>
    </div>

    <!-- LISTE -->
    <div class="space-y-2">
      <div
        v-for="dept in departments"
        :key="dept._id"
        class="flex items-center justify-between border p-3 rounded"
      >
        <!-- Édition inline -->
        <div class="flex-1">
          <input
            v-if="editingId === dept._id"
            v-model="editedName"
            type="text"
            class="border p-2 rounded w-full"
          />
          <span v-else>{{ dept.name }}</span>
        </div>

        <!-- ACTIONS -->
        <div class="flex gap-2">
          <button
            v-if="editingId === dept._id"
            @click="saveEdit(dept._id)"
            class="bg-blue-600 text-white px-3 rounded"
          >
            Save
          </button>
          <button
            v-if="editingId === dept._id"
            @click="cancelEdit"
            class="bg-gray-400 text-white px-3 rounded"
          >
            Cancel
          </button>

          <button
            v-else
            @click="startEdit(dept)"
            class="bg-yellow-500 text-white px-3 rounded"
          >
            Edit
          </button>
          <button
            @click="handleDelete(dept._id)"
            class="bg-red-600 text-white px-3 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center mt-4">Chargement...</div>
  </div>
</template>

<style scoped>
input:disabled {
  background: #f3f4f6;
}
button:disabled {
  cursor: not-allowed;
}
</style>