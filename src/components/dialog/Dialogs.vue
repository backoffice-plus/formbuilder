<template>

  <DialogAsModal
      v-for="item in modalRegistry.modals.value"
      :id=item.id
      :component=item.component
      :modalControl=item.modalControl
      :options=item.options
  />

</template>

<script setup lang="ts">
import {useDialogRegistry} from "@/";
import DialogAsModal from "./DialogAsModal.vue";

const modalRegistry = useDialogRegistry();
</script>
