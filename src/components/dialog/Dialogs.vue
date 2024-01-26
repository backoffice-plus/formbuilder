<template>

  <DialogAsModal
      v-for="item in modals"
      :id=item.id
      :component=item.component
      :modalControl=item.modalControl
      :options=item.options
      v-if="modals"
  />

</template>

<script setup lang="ts">
import {getFormbuilder} from "@/";
import DialogAsModal from "./DialogAsModal.vue";
import {computed} from "vue";

const fb = getFormbuilder();
const modals = computed(() => fb?.exposed?.dialogRegistry?.modals?.value);

</script>
