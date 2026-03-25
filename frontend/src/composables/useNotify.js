import { ref } from "vue";

export const message = ref("");
export const show = ref(false);

export const notify = (text) => {
  message.value = text;
  show.value = true;

  setTimeout(() => {
    show.value = false;
  }, 3000);
};